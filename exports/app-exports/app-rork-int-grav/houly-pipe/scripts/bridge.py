#!/usr/bin/env python3
"""houly-pipe bridge — a small, authenticated HTTP control server.

Run this on the machine that holds the footage and the FFmpeg binary. It lets
the Intégrav phone app pair with this computer over the local network, watch a
render in real time, and dispatch new jobs — without opening the box to anyone
else on the coffee-shop Wi-Fi.

    python3 scripts/bridge.py                 # pair + serve on port 8787
    python3 scripts/bridge.py --port 9000
    python3 scripts/bridge.py --bind 127.0.0.1   # loopback only
    python3 scripts/bridge.py --list-devices
    python3 scripts/bridge.py --revoke all

Security model, in short:
  * Nothing is reachable without a bearer token.
  * A token is only issued in exchange for the pairing code this process prints
    to the terminal you are sitting in front of. The code lives for 10 minutes,
    is single-use, and survives 5 wrong guesses before the pairing window shuts.
  * Only the SHA-256 of a token is written to disk, so a stolen state file
    cannot be replayed.
  * Downloads are confined to the pipeline's output folder; key-preview inputs
    are confined to the pipeline's project folder.

Standard library only — no pip install, nothing new to trust.
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import signal
import shutil
import socket
import subprocess
import sys
import threading
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import load_config  # noqa: E402

BRIDGE_VERSION = "1.0"
PAIRING_TTL_SECONDS = 600
MAX_PAIRING_ATTEMPTS = 5
MAX_BODY_BYTES = 512 * 1024
JOB_HISTORY = 40
# The preview comes back as PNG over Wi-Fi. A 4K frame would be several
# megabytes for no benefit on a phone screen, so the result is downscaled —
# AFTER keying at full size.
MAX_PREVIEW_WIDTH = 960


class PreviewUnavailable(Exception):
    """The key preview cannot run on this host (no OpenCV installed)."""


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S%z")


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def local_addresses() -> list[str]:
    """Best-effort list of LAN addresses this machine answers on."""
    found: list[str] = []
    try:
        # Connecting a UDP socket sends nothing but picks the default route,
        # which is the address a phone on the same network can actually reach.
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        probe.settimeout(0.2)
        probe.connect(("8.8.8.8", 80))
        found.append(probe.getsockname()[0])
        probe.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            address = info[4][0]
            if address not in found and not address.startswith("127."):
                found.append(address)
    except OSError:
        pass
    return found


# --------------------------------------------------------------------------
# Persistent state: paired devices
# --------------------------------------------------------------------------


class DeviceStore:
    """Paired phones, kept in `.bridge/state.json` with owner-only permissions."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.lock = threading.Lock()
        self.devices: list[dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        try:
            payload = json.loads(self.path.read_text("utf-8"))
            self.devices = payload.get("devices") or []
        except (OSError, ValueError):
            self.devices = []

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps({"devices": self.devices}, indent=2), "utf-8")
        os.replace(tmp, self.path)
        try:
            os.chmod(self.path, 0o600)
        except OSError:
            pass

    def add(self, name: str, platform: str) -> tuple[str, dict[str, Any]]:
        token = secrets.token_urlsafe(32)
        device = {
            "id": "dev_" + secrets.token_hex(6),
            "name": (name or "iPhone").strip()[:48] or "iPhone",
            "platform": (platform or "ios").strip()[:24],
            "tokenHash": _sha256(token),
            "pairedAt": _now(),
            "lastSeen": _now(),
        }
        with self.lock:
            self.devices.append(device)
            self._save()
        return token, device

    def match(self, token: str) -> dict[str, Any] | None:
        """Constant-time lookup, so a wrong token leaks no timing signal."""
        digest = _sha256(token)
        with self.lock:
            for device in self.devices:
                if hmac.compare_digest(device.get("tokenHash", ""), digest):
                    device["lastSeen"] = _now()
                    self._save()
                    return device
        return None

    def revoke(self, device_id: str) -> bool:
        with self.lock:
            before = len(self.devices)
            self.devices = [d for d in self.devices if d.get("id") != device_id]
            changed = len(self.devices) != before
            if changed:
                self._save()
            return changed

    def revoke_all(self) -> int:
        with self.lock:
            count = len(self.devices)
            self.devices = []
            self._save()
            return count

    def public(self) -> list[dict[str, Any]]:
        with self.lock:
            return [
                {k: v for k, v in device.items() if k != "tokenHash"}
                for device in self.devices
            ]


class PairingWindow:
    """A short-lived, single-use code shown in the operator's terminal."""

    def __init__(self, ttl: int = PAIRING_TTL_SECONDS) -> None:
        self.ttl = ttl
        self.lock = threading.Lock()
        self.code: str | None = None
        self.expires_at: float = 0.0
        self.attempts = 0

    def open(self) -> str:
        with self.lock:
            # Zero-padded so it is always six characters to read aloud.
            self.code = f"{secrets.randbelow(1_000_000):06d}"
            self.expires_at = time.time() + self.ttl
            self.attempts = 0
            return self.code

    def close(self) -> None:
        with self.lock:
            self.code = None
            self.attempts = 0

    @property
    def is_open(self) -> bool:
        with self.lock:
            return self.code is not None and time.time() < self.expires_at

    def seconds_left(self) -> int:
        with self.lock:
            if self.code is None:
                return 0
            return max(0, int(self.expires_at - time.time()))

    def check(self, candidate: str) -> tuple[bool, str]:
        with self.lock:
            if self.code is None:
                return False, "Pairing is closed on the computer. Press P in its terminal to open it again."
            if time.time() >= self.expires_at:
                self.code = None
                return False, "That pairing code expired. Press P on the computer for a fresh one."
            if self.attempts >= MAX_PAIRING_ATTEMPTS:
                self.code = None
                return False, "Too many wrong codes. Pairing is locked — press P on the computer to reopen it."

            digits = re.sub(r"\D", "", candidate or "")
            if hmac.compare_digest(self.code, digits):
                self.code = None  # single use
                return True, ""

            self.attempts += 1
            left = MAX_PAIRING_ATTEMPTS - self.attempts
            if left <= 0:
                self.code = None
                return False, "Too many wrong codes. Pairing is locked — press P on the computer to reopen it."
            return False, f"Wrong pairing code. {left} attempt{'s' if left != 1 else ''} left."


# --------------------------------------------------------------------------
# Job runner
# --------------------------------------------------------------------------


class JobRunner:
    """Runs one render at a time, newest request queued behind the current one."""

    def __init__(self, root: Path, out_dir: Path, notifier: "Notifier") -> None:
        self.root = root
        self.out_dir = out_dir
        self.notifier = notifier
        self.lock = threading.Lock()
        self.jobs: list[dict[str, Any]] = []
        self.process: subprocess.Popen[bytes] | None = None
        self.current_id: str | None = None
        self.queue: list[str] = []
        self.worker = threading.Thread(target=self._drain, daemon=True)
        self.worker.start()

    def submit(self, title: str, config_yaml: str, stages: str | None, limit: float | None) -> dict[str, Any]:
        job_id = "job_" + secrets.token_hex(5)
        config_path = self.root / f".bridge/configs/{job_id}.yaml"
        config_path.parent.mkdir(parents=True, exist_ok=True)
        config_path.write_text(config_yaml, "utf-8")

        job = {
            "id": job_id,
            "title": (title or "Untitled render").strip()[:120],
            "state": "queued",
            "createdAt": _now(),
            "startedAt": None,
            "finishedAt": None,
            "error": None,
            "configFile": str(config_path.relative_to(self.root)),
            "stages": stages or "trim,render,preview,upload",
            "limit": limit,
        }
        with self.lock:
            self.jobs.insert(0, job)
            del self.jobs[JOB_HISTORY:]
            self.queue.append(job_id)
        return dict(job)

    def cancel(self, job_id: str) -> bool:
        with self.lock:
            if job_id in self.queue:
                self.queue.remove(job_id)
                self._set(job_id, state="cancelled", finishedAt=_now())
                return True
            running = self.current_id == job_id
            process = self.process
        if running and process and process.poll() is None:
            # Kill the whole render process group — pipeline.py spawns ffmpeg
            # children, and killing only the parent leaves orphan encoders that
            # keep writing into tmp/ and out/ and corrupt the next render.
            try:
                pgid = os.getpgid(process.pid)
            except ProcessLookupError:
                pgid = None
            if pgid:
                try:
                    os.killpg(pgid, signal.SIGTERM)
                except (ProcessLookupError, PermissionError):
                    process.terminate()
            else:
                process.terminate()
            try:
                process.wait(timeout=8)
            except subprocess.TimeoutExpired:
                if pgid:
                    try:
                        os.killpg(pgid, signal.SIGKILL)
                    except (ProcessLookupError, PermissionError):
                        pass
                try:
                    process.kill()
                except ProcessLookupError:
                    pass
                process.wait(timeout=8)
            # Sweep: a child spawned in the same tick as the SIGTERM can miss it
            # and survive the group leader. SIGKILL any remaining group members.
            if pgid:
                try:
                    os.killpg(pgid, signal.SIGKILL)
                except (ProcessLookupError, PermissionError):
                    pass
            return True
        return False

    def _set(self, job_id: str, **fields: Any) -> None:
        for job in self.jobs:
            if job["id"] == job_id:
                job.update(fields)
                return

    def _find(self, job_id: str) -> dict[str, Any] | None:
        for job in self.jobs:
            if job["id"] == job_id:
                return job
        return None

    def _drain(self) -> None:
        while True:
            job_id: str | None = None
            with self.lock:
                if self.queue and self.process is None:
                    job_id = self.queue.pop(0)
            if job_id is None:
                time.sleep(0.4)
                continue
            self._run(job_id)

    def _run(self, job_id: str) -> None:
        with self.lock:
            job = self._find(job_id)
            if job is None or job["state"] == "cancelled":
                return
            job.update(state="running", startedAt=_now())
            config_path = self.root / job["configFile"]
            stages = job["stages"]
            limit = job["limit"]
            title = job["title"]
            self.current_id = job_id

        command = [
            sys.executable,
            str(Path(__file__).resolve().parent / "pipeline.py"),
            "--config", str(config_path),
            # The per-job config lives in .bridge/configs/, so without --base
            # every relative path in it (raw/intro.mp4) would resolve inside
            # that folder and the render would fail before it started.
            "--base", str(self.root),
            "--stages", stages,
        ]
        if limit:
            command += ["--limit", str(limit)]

        log_path = self.root / f".bridge/logs/{job_id}.log"
        log_path.parent.mkdir(parents=True, exist_ok=True)

        code = -1
        try:
            with log_path.open("wb") as log:
                process = subprocess.Popen(
                    command,
                    cwd=str(self.root),
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    start_new_session=True,
                )
                with self.lock:
                    self.process = process
                code = process.wait()
        except OSError as error:
            with self.lock:
                self._set(job_id, state="failed", error=str(error), finishedAt=_now())
                self.process = None
                self.current_id = None
            return

        tail = self._tail(log_path)
        with self.lock:
            job = self._find(job_id)
            cancelled = job is not None and job["state"] == "cancelled"
            if cancelled or code < 0:
                self._set(job_id, state="cancelled", finishedAt=_now())
                state = "cancelled"
            elif code == 0:
                self._set(job_id, state="done", finishedAt=_now(), error=None)
                state = "done"
            else:
                self._set(job_id, state="failed", finishedAt=_now(), error=tail)
                state = "failed"
            self.process = None
            self.current_id = None

        self.notifier.job_finished(title, state, tail if state == "failed" else None)

    @staticmethod
    def _tail(path: Path, limit: int = 400) -> str:
        try:
            text = path.read_text("utf-8", errors="replace").strip()
        except OSError:
            return "The render exited without writing a log."
        if not text:
            return "The render exited without output."
        return text[-limit:]

    def snapshot(self) -> dict[str, Any]:
        with self.lock:
            return {
                "jobs": [dict(job) for job in self.jobs],
                "activeJobId": self.current_id,
                "queued": list(self.queue),
            }


# --------------------------------------------------------------------------
# Telegram notifications (optional)
# --------------------------------------------------------------------------


class Notifier:
    """Pushes a Telegram message when a render lands. Entirely optional."""

    def __init__(self, token: str | None, chat_id: str | None) -> None:
        self.token = (token or "").strip()
        self.chat_id = (chat_id or "").strip()

    @property
    def enabled(self) -> bool:
        return bool(self.token and self.chat_id)

    def send(self, text: str) -> bool:
        if not self.enabled:
            return False
        payload = urllib.parse.urlencode(
            {"chat_id": self.chat_id, "text": text, "disable_web_page_preview": "true"}
        ).encode()
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        try:
            with urllib.request.urlopen(url, data=payload, timeout=10) as response:
                return response.status == 200
        except (urllib.error.URLError, OSError) as error:
            print(f"  telegram: {error}")
            return False

    def job_finished(self, title: str, state: str, error: str | None) -> None:
        if not self.enabled:
            return
        mark = {"done": "Finished", "failed": "Failed", "cancelled": "Cancelled"}.get(state, state)
        text = f"houly-pipe · {mark}\n{title}"
        if error:
            text += f"\n\n{error[-300:]}"
        threading.Thread(target=self.send, args=(text,), daemon=True).start()


# --------------------------------------------------------------------------
# HTTP surface
# --------------------------------------------------------------------------


class BridgeState:
    def __init__(
        self,
        root: Path,
        out_dir: Path,
        devices: DeviceStore,
        pairing: PairingWindow,
        runner: JobRunner,
        notifier: Notifier,
    ) -> None:
        self.root = root
        self.out_dir = out_dir
        self.devices = devices
        self.pairing = pairing
        self.runner = runner
        self.notifier = notifier
        self.host_name = socket.gethostname()
        self.started_at = _now()


class BridgeHandler(BaseHTTPRequestHandler):
    server_version = f"houly-pipe-bridge/{BRIDGE_VERSION}"
    state: BridgeState  # injected on the server instance

    # -- plumbing ---------------------------------------------------------

    def log_message(self, format: str, *args: Any) -> None:
        sys.stdout.write(f"  {_now()}  {self.address_string()}  {format % args}\n")

    def _send(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _send_bytes(self, data: bytes, content_type: str) -> None:
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _error(self, status: int, message: str) -> None:
        self._send(status, {"error": message})

    def _body(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return {}
        if length <= 0 or length > MAX_BODY_BYTES:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError, OSError):
            return {}

    def _device(self) -> dict[str, Any] | None:
        header = self.headers.get("Authorization") or ""
        if not header.startswith("Bearer "):
            return None
        return self.state.devices.match(header[7:].strip())

    def _read_json_file(self, name: str) -> dict[str, Any] | None:
        path = self.state.out_dir / name
        try:
            return json.loads(path.read_text("utf-8"))
        except (OSError, ValueError):
            return None

    # -- routes -----------------------------------------------------------

    def do_GET(self) -> None:  # noqa: N802
        path = urllib.parse.urlparse(self.path).path.rstrip("/") or "/"

        if path in ("/", "/v1/hello"):
            self._send(200, {
                "service": "houly-pipe",
                "version": BRIDGE_VERSION,
                "host": self.state.host_name,
                "startedAt": self.state.started_at,
                "pairingOpen": self.state.pairing.is_open,
                "pairingSecondsLeft": self.state.pairing.seconds_left(),
                "pairedDevices": len(self.state.devices.public()),
                "telegram": self.state.notifier.enabled,
            })
            return

        device = self._device()
        if device is None:
            self._error(401, "This computer does not recognise that link. Pair the phone again.")
            return

        if path == "/v1/status":
            self._send(200, self._status_payload())
            return

        if path == "/v1/manifest":
            manifest = self._read_json_file("manifest.json")
            if manifest is None:
                self._error(404, "No finished render on this computer yet.")
                return
            self._send(200, manifest)
            return

        if path == "/v1/thumbnail":
            manifest = self._read_json_file("manifest.json") or {}
            name = manifest.get("thumbnail")
            if not name:
                self._error(404, "That render has no thumbnail.")
                return
            data = self._safe_read(str(name))
            if data is None:
                self._error(404, "The thumbnail file is missing from the output folder.")
                return
            guessed = mimetypes.guess_type(str(name))[0] or "image/jpeg"
            self._send_bytes(data, guessed)
            return

        if path == "/v1/jobs":
            self._send(200, self.state.runner.snapshot())
            return

        if path == "/v1/devices":
            self._send(200, {"devices": self.state.devices.public(), "you": device["id"]})
            return

        self._error(404, "Unknown endpoint.")

    def do_POST(self) -> None:  # noqa: N802
        path = urllib.parse.urlparse(self.path).path.rstrip("/") or "/"
        body = self._body()

        if path == "/v1/pair":
            ok, message = self.state.pairing.check(str(body.get("code", "")))
            if not ok:
                print(f"  pairing refused from {self.address_string()}: {message}")
                self._error(403, message)
                return
            token, device = self.state.devices.add(
                str(body.get("device", "iPhone")), str(body.get("platform", "ios"))
            )
            print(f"  paired: {device['name']} ({device['id']}) from {self.address_string()}")
            self.state.notifier.send(f"houly-pipe · {device['name']} paired with {self.state.host_name}")
            self._send(200, {
                "token": token,
                "deviceId": device["id"],
                "host": self.state.host_name,
                "version": BRIDGE_VERSION,
            })
            return

        device = self._device()
        if device is None:
            self._error(401, "This computer does not recognise that link. Pair the phone again.")
            return

        if path == "/v1/jobs":
            ctype = self.headers.get("Content-Type", "")
            if self.headers.get("Content-Length", "0") not in ("", "0") and not ctype.startswith("application/json"):
                self._error(400, "Send the render request as JSON (Content-Type: application/json).")
                return
            # Accept a config under any common key; thin clients may send none.
            config_yaml = str(
                body.get("config")
                or body.get("configYaml")
                or body.get("config_yaml")
                or ""
            )
            if len(config_yaml.strip()) < 20:
                # Fall back to this computer's own config.yaml so the phone app,
                # studio, or automation can trigger a render without uploading YAML.
                try:
                    config_yaml = (self.state.runner.root / "config.yaml").read_text("utf-8")
                except OSError:
                    self._error(
                        400,
                        "That render request arrived without a pipeline config, and no "
                        "config.yaml exists on this computer."
                    )
                    return
            limit_raw = body.get("limit")
            try:
                limit = float(limit_raw) if limit_raw is not None else None
            except (TypeError, ValueError):
                limit = None
            job = self.state.runner.submit(
                title=str(body.get("title") or "Untitled render"),
                config_yaml=config_yaml,
                stages=str(body.get("stages")) if body.get("stages") else None,
                limit=limit,
            )
            print(f"  queued {job['id']} · {job['title']} (from {device['name']})")
            self._send(202, job)
            return

        if path == "/v1/preview-key":
            self._preview_key(body)
            return

        match = re.fullmatch(r"/v1/jobs/(job_[0-9a-f]+)/cancel", path)
        if match:
            if self.state.runner.cancel(match.group(1)):
                self._send(200, {"cancelled": match.group(1)})
            else:
                self._error(404, "That job already finished.")
            return

        if path == "/v1/notify/test":
            if not self.state.notifier.enabled:
                self._error(400, "Telegram is not configured in config.yaml on this computer.")
                return
            ok = self.state.notifier.send(f"houly-pipe · test message from {self.state.host_name}")
            self._send(200 if ok else 502, {"sent": ok})
            return

        self._error(404, "Unknown endpoint.")

    # -- key preview ------------------------------------------------------

    @staticmethod
    def _green_machine() -> Any:
        """Imported on demand: a render-only host with no OpenCV keeps serving
        every other endpoint — the preview is the only thing that needs it."""
        try:
            import green_machine as gm  # noqa: PLC0415 - deliberately lazy
        except ImportError as error:
            raise PreviewUnavailable(
                "Key preview needs OpenCV on this computer: pip install opencv-python"
            ) from error
        return gm

    def _safe_input(self, name: str) -> Path | None:
        """Preview inputs live under the pipeline root — the same confinement
        downloads have, pointed the other way."""
        root = self.state.root.resolve()
        candidate = (root / name).resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            print(f"  blocked path traversal attempt: {name}")
            return None
        return candidate

    @staticmethod
    def _body_float(
        body: dict[str, Any],
        key: str,
        default: float,
        minimum: float | None = None,
        maximum: float | None = None,
    ) -> float:
        """Reads a number, falling back to the default on anything unusable —
        a phone that sends `null` or a string gets the setting it meant, not a
        poisoned matte. The chained clamp also absorbs NaN, which survives
        json.loads by default."""
        try:
            value = float(body.get(key, default))
        except (TypeError, ValueError):
            value = float(default)
        if minimum is not None:
            value = max(minimum, value)
        if maximum is not None:
            value = min(maximum, value)
        return value

    def _preview_key(self, body: dict[str, Any]) -> None:
        """Keys ONE frame with the settings the phone will render with, and
        returns it as PNG. The tolerance is judged on real pixels from the real
        clip before a full render is committed to."""
        source_name = str(body.get("source") or "").strip()
        if not source_name:
            self._error(400, "Name the source clip, relative to the pipeline folder — e.g. raw/green_take.mp4.")
            return
        source_path = self._safe_input(source_name)
        if source_path is None:
            self._error(400, "That source path is outside the pipeline folder, so the preview refuses it.")
            return

        try:
            gm = self._green_machine()
        except PreviewUnavailable as error:
            self._error(500, str(error))
            return

        try:
            frame, _ = gm.key_one_frame(
                str(source_path),
                start=self._body_float(body, "time", 0.0, minimum=0.0),
                background=str(body.get("background") or "#101010"),
                key_color=str(body.get("keyColor") or "green"),
                tolerance=self._body_float(body, "tolerance", 0.16, 0.0, 1.0),
                softness=self._body_float(body, "softness", 0.08, 0.0, 1.0),
                despill=self._body_float(body, "despill", 0.8, 0.0, 1.0),
                feather=int(self._body_float(body, "feather", 2, 0.0, 24.0)),
                size=self._body_float(body, "size", 1.0, 0.05, 4.0),
                x=self._body_float(body, "x", 0.0, -0.5, 0.5),
                y=self._body_float(body, "y", 0.0, -0.5, 0.5),
                max_width=MAX_PREVIEW_WIDTH,
            )
        except gm.PipelineError as error:
            self._error(400, str(error))
            return
        except Exception:  # noqa: BLE001 - a keyer crash must not kill the server thread silently
            print("  preview-key failed:")
            traceback.print_exc()
            self._error(500, "The keyer crashed on that frame. The bridge terminal shows the detail.")
            return

        ok, encoded = gm.cv2.imencode(".png", frame)
        if not ok:
            self._error(500, "Could not encode the preview frame.")
            return
        self._send_bytes(encoded.tobytes(), "image/png")

    def do_DELETE(self) -> None:  # noqa: N802
        path = urllib.parse.urlparse(self.path).path.rstrip("/") or "/"
        if self._device() is None:
            self._error(401, "This computer does not recognise that link.")
            return
        match = re.fullmatch(r"/v1/devices/(dev_[0-9a-f]+)", path)
        if match:
            if self.state.devices.revoke(match.group(1)):
                print(f"  revoked {match.group(1)}")
                self._send(200, {"revoked": match.group(1)})
            else:
                self._error(404, "No such device.")
            return
        self._error(404, "Unknown endpoint.")

    # -- helpers ----------------------------------------------------------

    def _safe_read(self, name: str) -> bytes | None:
        """Reads a file from the output folder, refusing anything outside it."""
        candidate = (self.state.out_dir / name).resolve()
        try:
            candidate.relative_to(self.state.out_dir.resolve())
        except ValueError:
            print(f"  blocked path traversal attempt: {name}")
            return None
        try:
            return candidate.read_bytes()
        except OSError:
            return None

    def _status_payload(self) -> dict[str, Any]:
        status = self._read_json_file("status.json") or {"state": "idle", "progress": 0.0}
        snapshot = self.state.runner.snapshot()
        active_id = snapshot["activeJobId"]
        active = next((job for job in snapshot["jobs"] if job["id"] == active_id), None)

        # A stale status.json from a previous run must not read as "running".
        if active is None and status.get("state") == "running":
            status["state"] = "idle"

        return {
            "host": self.state.host_name,
            "pipeline": status,
            "activeJob": active,
            "queuedCount": len(snapshot["queued"]),
            "recentJobs": snapshot["jobs"][:8],
            "hasManifest": (self.state.out_dir / "manifest.json").exists(),
        }


class BridgeServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------


def _banner(
    port: int,
    bind: str,
    pairing: PairingWindow,
    devices: DeviceStore,
    notifier: Notifier,
    tunnel: bool = False,
) -> None:
    addresses = local_addresses() if bind == "0.0.0.0" else [bind]
    print()
    print("  houly-pipe bridge")
    print("  " + "-" * 46)
    if addresses:
        for address in addresses:
            print(f"  Address    http://{address}:{port}")
    else:
        print(f"  Address    http://<this-computer>:{port}")
    if tunnel:
        print("  TUNNEL     This bridge is being shared beyond your network.")
        print("             Prefer an https tunnel (cloudflared/ngrok) and press")
        print("             P afterwards so the code cannot be reused.")
    print(f"  Code       {pairing.code}    (valid {PAIRING_TTL_SECONDS // 60} minutes, one phone)")
    print(f"  Paired     {len(devices.public())} device(s)")
    print(f"  Telegram   {'on' if notifier.enabled else 'off'}")
    print("  " + "-" * 46)
    print("  On the phone: Render Studio → Connect a computer")
    print("  Type the address and the code above.")
    print()
    print("  P = new pairing code   L = list devices   Ctrl-C = stop")
    print()


def _console(
    pairing: PairingWindow,
    devices: DeviceStore,
    port: int,
    bind: str,
    notifier: Notifier,
    tunnel: bool = False,
) -> None:
    """Lets the operator reopen pairing without restarting the server."""
    for line in sys.stdin:
        key = line.strip().lower()
        if key == "p":
            pairing.open()
            _banner(port, bind, pairing, devices, notifier, tunnel)
        elif key == "l":
            listed = devices.public()
            print(f"  {len(listed)} paired device(s)")
            for device in listed:
                print(f"    {device['id']}  {device['name']}  last seen {device['lastSeen']}")
            print()


def main() -> int:
    # Redirected to a log file, stdout is block-buffered — which would hide the
    # pairing code until the buffer filled. Line-buffer so the banner appears now.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(line_buffering=True)  # type: ignore[union-attr]
        except (AttributeError, ValueError):
            pass

    parser = argparse.ArgumentParser(description="houly-pipe bridge — pair a phone with this computer")
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--bind", default="0.0.0.0", help="0.0.0.0 for the LAN, 127.0.0.1 for loopback only")
    parser.add_argument("--list-devices", action="store_true")
    parser.add_argument("--revoke", metavar="DEVICE_ID|all")
    parser.add_argument(
        "--tunnel",
        action="store_true",
        help="the bridge is being shared past your network (cloudflared/ngrok) — prints a pairing-code warning",
    )
    args = parser.parse_args()

    config, root = load_config(args.config)
    pipe = config.get("pipeline") or {}
    out_dir = (root / str(pipe.get("outputFile", "out/final_render.mp4"))).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    devices = DeviceStore(root / ".bridge/state.json")

    if args.list_devices:
        listed = devices.public()
        print(f"{len(listed)} paired device(s)")
        for device in listed:
            print(f"  {device['id']}  {device['name']}  paired {device['pairedAt']}  last seen {device['lastSeen']}")
        return 0

    if args.revoke:
        if args.revoke == "all":
            print(f"Revoked {devices.revoke_all()} device(s).")
        elif devices.revoke(args.revoke):
            print(f"Revoked {args.revoke}.")
        else:
            print(f"No device {args.revoke}.")
            return 1
        return 0

    if shutil.which("ffmpeg") is None:
        print("  ! ffmpeg is not on PATH — renders dispatched from the phone will fail.")

    notify = (config.get("notify") or {}).get("telegram") or {}
    notifier = Notifier(notify.get("botToken"), notify.get("chatId"))
    runner = JobRunner(root, out_dir, notifier)
    pairing = PairingWindow()
    pairing.open()

    state = BridgeState(root, out_dir, devices, pairing, runner, notifier)
    BridgeHandler.state = state

    try:
        server = BridgeServer((args.bind, args.port), BridgeHandler)
    except OSError as error:
        print(f"Could not listen on {args.bind}:{args.port} — {error}")
        print("Another copy of the bridge may already be running. Try --port 8788.")
        return 1

    _banner(args.port, args.bind, pairing, devices, notifier, args.tunnel)
    threading.Thread(
        target=_console, args=(pairing, devices, args.port, args.bind, notifier, args.tunnel), daemon=True
    ).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopping bridge.")
        server.shutdown()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # noqa: BLE001 - top-level guard
        print(f"bridge failed: {error}")
        sys.exit(1)
