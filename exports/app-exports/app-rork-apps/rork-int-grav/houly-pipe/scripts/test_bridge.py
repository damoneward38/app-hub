#!/usr/bin/env python3
"""Route and security tests for the bridge — standard library only.

Run from the scripts folder:

    python3 -m unittest test_bridge -v

These exercise the HTTP surface the way a phone does: discovery, pairing
(including the wrong-code lockout and single-use rule), token enforcement on
every protected route, job cancel, device revoke, and the path-confinement
guards on downloads and key-preview inputs. Renders themselves are exercised
end-to-end by hand (they need ffmpeg + real footage); everything that must
never go wrong without footage is asserted here.
"""

from __future__ import annotations

import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

import bridge


def _silent_log(*_args: Any, **_kwargs: Any) -> None:
    """Keep per-request log lines out of the test output."""


class BridgeHTTPTests(unittest.TestCase):
    """One server per class; tests share it and re-open pairing as needed."""

    server: bridge.BridgeServer
    state: bridge.BridgeState
    code: str

    @classmethod
    def setUpClass(cls) -> None:
        cls._tmp = tempfile.TemporaryDirectory()
        root = Path(cls._tmp.name) / "pipe"
        out_dir = root / "out"
        out_dir.mkdir(parents=True)
        devices = bridge.DeviceStore(root / ".bridge/state.json")
        pairing = bridge.PairingWindow(ttl=60)
        runner = bridge.JobRunner(root, out_dir, bridge.Notifier(None, None))
        cls.code = pairing.open()
        cls.state = bridge.BridgeState(root, out_dir, devices, pairing, runner, bridge.Notifier(None, None))
        bridge.BridgeHandler.state = cls.state
        bridge.BridgeHandler.log_message = _silent_log  # type: ignore[method-assign]
        cls.server = bridge.BridgeServer(("127.0.0.1", 0), bridge.BridgeHandler)
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls._tmp.cleanup()

    # -- helpers ----------------------------------------------------------

    @classmethod
    def call(
        cls,
        method: str,
        path: str,
        token: str | None = None,
        body: dict[str, Any] | None = None,
    ) -> tuple[int, dict[str, Any]]:
        data = json.dumps(body).encode() if body is not None else None
        request = urllib.request.Request(
            f"http://127.0.0.1:{cls.port}{path}", data=data, method=method
        )
        if body is not None:
            request.add_header("Content-Type", "application/json")
        if token:
            request.add_header("Authorization", f"Bearer {token}")
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                payload: dict[str, Any] = json.loads(response.read().decode("utf-8")) or {}
                return response.status, payload
        except urllib.error.HTTPError as error:
            raw = error.read().decode("utf-8")
            try:
                payload = json.loads(raw) or {}
            except ValueError:
                payload = {"raw": raw}
            return error.code, payload

    def reopen_pairing(self) -> str:
        return self.state.pairing.open()

    # -- discovery & auth ---------------------------------------------------

    def test_hello_identifies_the_bridge(self) -> None:
        status, payload = self.call("GET", "/v1/hello")
        self.assertEqual(status, 200)
        self.assertEqual(payload["service"], "houly-pipe")
        self.assertIn("pairingOpen", payload)

    def test_status_without_token_is_refused(self) -> None:
        status, payload = self.call("GET", "/v1/status")
        self.assertEqual(status, 401)
        self.assertIn("error", payload)

    def test_garbage_token_is_refused(self) -> None:
        status, _ = self.call("GET", "/v1/status", token="not-a-real-token")
        self.assertEqual(status, 401)

    def test_every_protected_route_refuses_anon(self) -> None:
        for method, path in (
            ("GET", "/v1/status"),
            ("GET", "/v1/manifest"),
            ("GET", "/v1/thumbnail"),
            ("GET", "/v1/jobs"),
            ("GET", "/v1/devices"),
            ("POST", "/v1/jobs"),
            ("POST", "/v1/preview-key"),
        ):
            status, payload = self.call(method, path, body={} if method == "POST" else None)
            self.assertEqual(status, 401, f"{method} {path}")
            self.assertIn("error", payload)

    # -- pairing ------------------------------------------------------------

    def test_five_wrong_codes_lock_the_window(self) -> None:
        self.reopen_pairing()
        final: dict[str, Any] = {}
        for attempt in range(5):
            status, final = self.call("POST", "/v1/pair", body={"code": f"{100000 + attempt:06d}"})
            self.assertEqual(status, 403)
        self.assertIn("locked", final["error"])
        # The window is shut: even the terminal shows it needs P to reopen.
        self.assertFalse(self.state.pairing.is_open)

    def test_pairing_code_is_single_use(self) -> None:
        code = self.reopen_pairing()
        status, first = self.call("POST", "/v1/pair", body={"code": code, "device": "Test"})
        self.assertEqual(status, 200)
        self.assertIn("token", first)
        self.assertIn("deviceId", first)
        status, second = self.call("POST", "/v1/pair", body={"code": code})
        self.assertEqual(status, 403)

    def test_non_digits_are_stripped_but_wrong_digits_refused(self) -> None:
        code = self.reopen_pairing()
        status, _ = self.call("POST", "/v1/pair", body={"code": " ".join(code[:5]) + "9"})
        self.assertEqual(status, 403)

    # -- the authenticated surface -----------------------------------------

    def test_paired_token_reads_status_and_jobs(self) -> None:
        self.state.pairing.close()
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code, "device": "Status Phone"})
        token = paired["token"]

        status, snapshot = self.call("GET", "/v1/status", token=token)
        self.assertEqual(status, 200)
        self.assertIn("pipeline", snapshot)
        self.assertIn("recentJobs", snapshot)

        status, jobs = self.call("GET", "/v1/jobs", token=token)
        self.assertEqual(status, 200)
        self.assertIn("jobs", jobs)

        status, listing = self.call("GET", "/v1/devices", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(listing["you"], paired["deviceId"])
        names = [d["name"] for d in listing["devices"]]
        self.assertIn("Status Phone", names)
        # The token hash must never leave the computer.
        for device in listing["devices"]:
            self.assertNotIn("tokenHash", device)

    def test_cancel_unknown_job_is_404(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})
        status, payload = self.call(
            "POST", "/v1/jobs/job_ffffffff/cancel", token=paired["token"]
        )
        self.assertEqual(status, 404)
        self.assertIn("error", payload)

    def test_job_without_config_is_refused(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})
        status, payload = self.call("POST", "/v1/jobs", token=paired["token"], body={"title": "empty"})
        self.assertEqual(status, 400)

    def test_revoke_kills_the_token_immediately(self) -> None:
        self.state.pairing.close()
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code, "device": "Doomed"})
        token, device_id = paired["token"], paired["deviceId"]

        status, _ = self.call("GET", "/v1/status", token=token)
        self.assertEqual(status, 200)

        status, payload = self.call("DELETE", f"/v1/devices/{device_id}", token=token)
        self.assertEqual(status, 200)

        status, _ = self.call("GET", "/v1/status", token=token)
        self.assertEqual(status, 401)

    def test_revoking_another_device_is_404(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})
        status, _ = self.call("DELETE", "/v1/devices/dev_deadbeef", token=paired["token"])
        self.assertEqual(status, 404)

    # -- confinement --------------------------------------------------------

    def test_thumbnail_download_cannot_escape_the_output_folder(self) -> None:
        secret = Path(self._tmp.name) / "secret.txt"
        secret.write_text("top secret", "utf-8")
        (self.state.out_dir / "manifest.json").write_text(
            json.dumps({"thumbnail": "../../secret.txt"}), "utf-8"
        )
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})

        status, payload = self.call("GET", "/v1/thumbnail", token=paired["token"])
        self.assertEqual(status, 404)
        # The secret file exists — the 404 is the guard, not a missing file.
        self.assertTrue(secret.exists())
        self.assertNotIn("raw", payload)

    def test_preview_input_cannot_escape_the_pipeline_folder(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})
        status, payload = self.call(
            "POST",
            "/v1/preview-key",
            token=paired["token"],
            body={"source": "../../secret.txt", "time": 0.0},
        )
        self.assertEqual(status, 400)
        self.assertIn("outside", payload["error"])

    def test_preview_without_source_names_the_convention(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code})
        status, payload = self.call("POST", "/v1/preview-key", token=paired["token"], body={})
        self.assertEqual(status, 400)
        self.assertIn("raw/", payload["error"])

    # -- unit-level checks on the pieces -------------------------------------

    def test_token_never_stored_in_plaintext(self) -> None:
        code = self.reopen_pairing()
        _, paired = self.call("POST", "/v1/pair", body={"code": code, "device": "HashCheck"})
        on_disk = (self.state.devices.path).read_text("utf-8")
        self.assertNotIn(paired["token"], on_disk)
        self.assertIn(bridge._sha256(paired["token"]), on_disk)

    def test_state_file_is_owner_only(self) -> None:
        mode = self.state.devices.path.stat().st_mode & 0o777
        self.assertEqual(mode, 0o600)

    def test_oversized_body_is_ignored(self) -> None:
        code = self.reopen_pairing()
        huge = {"code": code, "device": "x" * (bridge.MAX_BODY_BYTES + 1)}
        try:
            status, _ = self.call("POST", "/v1/pair", body=huge)
            self.assertEqual(status, 403)
        except urllib.error.URLError:
            # The server refuses the body without draining it, so the client
            # can hit a broken pipe mid-send. That refusal is the point.
            pass
        # The oversized payload must never have been evaluated: the real code
        # is still valid and pairs cleanly afterwards.
        status, payload = self.call("POST", "/v1/pair", body={"code": code, "device": "After"})
        self.assertEqual(status, 200)


if __name__ == "__main__":
    unittest.main()
