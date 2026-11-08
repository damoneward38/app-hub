"""Shared helpers for houly-pipe: config loading, time parsing, media probing
and ffmpeg execution with live progress reporting.

Nothing in here is pipeline-specific, so it stays importable from one-off scripts.
"""

from __future__ import annotations

import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Callable, Sequence

import yaml

FFMPEG = os.environ.get("FFMPEG_BIN", "ffmpeg")
FFPROBE = os.environ.get("FFPROBE_BIN", "ffprobe")


class PipelineError(RuntimeError):
    """Any failure we can explain to the operator without a traceback."""


# Optional observer for live progress: (label, done_seconds, total_seconds, speed).
# The pipeline installs one to write out/status.json; nothing else depends on it,
# so run_ffmpeg keeps working unchanged when no hook is set.
_PROGRESS_HOOK: Callable[[str, float, float | None, str], None] | None = None


def set_progress_hook(hook: Callable[[str, float, float | None, str], None] | None) -> None:
    """Install (or clear with None) the live progress observer."""
    global _PROGRESS_HOOK
    _PROGRESS_HOOK = hook


def _emit_progress(label: str, done: float, total: float | None, speed: str) -> None:
    """Never let a reporting failure take down a four-hour render."""
    if _PROGRESS_HOOK is None:
        return
    try:
        _PROGRESS_HOOK(label, done, total, speed)
    except Exception:  # noqa: BLE001 - status output is strictly best-effort
        pass


# --------------------------------------------------------------------------- #
# environment
# --------------------------------------------------------------------------- #

def require_tools() -> None:
    """Fail early and clearly when ffmpeg/ffprobe are not reachable."""
    missing = [tool for tool in (FFMPEG, FFPROBE) if shutil.which(tool) is None]
    if missing:
        raise PipelineError(
            f"{', '.join(missing)} not found on PATH. Install FFmpeg, or set "
            "FFMPEG_BIN / FFPROBE_BIN to the absolute paths."
        )


def ensure_dir(path: str | Path) -> Path:
    directory = Path(path).expanduser()
    directory.mkdir(parents=True, exist_ok=True)
    return directory


# --------------------------------------------------------------------------- #
# config
# --------------------------------------------------------------------------- #

def load_config(path: str | Path = "config.yaml") -> tuple[dict[str, Any], Path]:
    """Load YAML and return it with the directory every relative path resolves against."""
    config_path = Path(path).expanduser().resolve()
    if not config_path.is_file():
        raise PipelineError(f"Config not found: {config_path}")
    with config_path.open("r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle) or {}
    if not isinstance(config, dict):
        raise PipelineError("Config root must be a mapping.")
    return config, config_path.parent


def resolve(root: Path, value: str | Path) -> Path:
    """Resolve a config path relative to the config file, honouring ~ and absolutes."""
    candidate = Path(str(value)).expanduser()
    return candidate if candidate.is_absolute() else (root / candidate).resolve()


# --------------------------------------------------------------------------- #
# time
# --------------------------------------------------------------------------- #

_CLOCK = re.compile(r"^\d{1,4}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?$")
_HUMAN = re.compile(r"(\d+(?:\.\d+)?)\s*(ms|h|m|s)", re.IGNORECASE)
_UNITS = {"h": 3600.0, "m": 60.0, "s": 1.0, "ms": 0.001}


def parse_time(value: Any) -> float:
    """Accept 01:23:45.5, 12:30, 90, '3h40m' or '1m30s' and return seconds."""
    if value is None:
        raise PipelineError("Missing time value.")
    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()
    if not text:
        raise PipelineError("Empty time value.")

    if _CLOCK.match(text):
        parts = [float(part) for part in text.split(":")]
        while len(parts) < 3:
            parts.insert(0, 0.0)
        hours, minutes, seconds = parts
        return hours * 3600.0 + minutes * 60.0 + seconds

    if re.fullmatch(r"\d+(?:\.\d+)?", text):
        return float(text)

    matches = _HUMAN.findall(text)
    if not matches:
        raise PipelineError(f"Unrecognised time value: {value!r}")
    return sum(float(amount) * _UNITS[unit.lower()] for amount, unit in matches)


def timecode(seconds: float) -> str:
    """Seconds to H:MM:SS.mmm, for logs and manifests."""
    seconds = max(0.0, float(seconds))
    hours, remainder = divmod(seconds, 3600.0)
    minutes, secs = divmod(remainder, 60.0)
    return f"{int(hours)}:{int(minutes):02d}:{secs:06.3f}"


def human_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024.0 or unit == "TB":
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


# --------------------------------------------------------------------------- #
# probing
# --------------------------------------------------------------------------- #

def probe(path: str | Path) -> dict[str, Any]:
    """ffprobe a file into the handful of facts the pipeline actually branches on."""
    source = Path(path)
    if not source.is_file():
        raise PipelineError(f"Input file not found: {source}")

    result = subprocess.run(
        [FFPROBE, "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", str(source)],
        capture_output=True, text=True, check=False,
    )
    if result.returncode != 0:
        raise PipelineError(f"ffprobe failed on {source.name}: {result.stderr.strip()}")

    data = json.loads(result.stdout or "{}")
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)

    duration = 0.0
    for source_value in (data.get("format", {}).get("duration"),
                         (video or {}).get("duration")):
        try:
            duration = float(source_value)
            break
        except (TypeError, ValueError):
            continue

    fps = 0.0
    rate = (video or {}).get("avg_frame_rate") or "0/0"
    if "/" in rate:
        numerator, _, denominator = rate.partition("/")
        try:
            fps = float(numerator) / float(denominator) if float(denominator) else 0.0
        except (TypeError, ValueError):
            fps = 0.0

    return {
        "duration": duration,
        "has_video": video is not None,
        "has_audio": audio is not None,
        "width": int((video or {}).get("width") or 0),
        "height": int((video or {}).get("height") or 0),
        "fps": fps,
        "vcodec": (video or {}).get("codec_name", ""),
        "acodec": (audio or {}).get("codec_name", ""),
    }


# --------------------------------------------------------------------------- #
# filtergraph escaping
# --------------------------------------------------------------------------- #

def escape_filter_value(value: str | Path) -> str:
    """Escape a path for use *inside* a filtergraph option (subtitles=, lut3d=).

    Backslashes, colons and quotes are all filtergraph metacharacters; Windows
    drive letters break `subtitles=` without this.
    """
    text = str(value)
    text = text.replace("\\", "\\\\")
    text = text.replace(":", "\\:")
    text = text.replace("'", "\\'")
    text = text.replace("[", "\\[").replace("]", "\\]")
    text = text.replace(",", "\\,")
    return text


# --------------------------------------------------------------------------- #
# execution
# --------------------------------------------------------------------------- #

def run_ffmpeg(
    args: Sequence[str],
    *,
    label: str = "ffmpeg",
    total_seconds: float | None = None,
    dry_run: bool = False,
) -> None:
    """Run ffmpeg with `-progress` parsed into a single rewriting status line.

    stderr goes to a temp file rather than a pipe, so a chatty encode can never
    deadlock on a full OS buffer during a four-hour render.
    """
    command = [FFMPEG, "-hide_banner", "-nostdin", "-y",
               "-loglevel", "warning", "-progress", "pipe:1", "-nostats", *args]

    if dry_run:
        print(f"[dry-run] {shlex.join(command)}")
        return

    print(f"[{label}] {shlex.join(command)}")
    started = time.monotonic()
    _emit_progress(label, 0.0, total_seconds, "—")

    with tempfile.TemporaryFile("w+", encoding="utf-8", errors="replace") as err_file:
        process = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=err_file, text=True, bufsize=1
        )
        assert process.stdout is not None
        speed = "—"
        for line in process.stdout:
            key, _, value = line.strip().partition("=")
            if key == "speed":
                speed = value
            elif key == "out_time_us" and value.isdigit():
                done = int(value) / 1_000_000
                if total_seconds and total_seconds > 0:
                    pct = min(100.0, done / total_seconds * 100.0)
                    bar_width = 28
                    filled = int(bar_width * pct / 100.0)
                    bar = "█" * filled + "·" * (bar_width - filled)
                    sys.stdout.write(
                        f"\r  {bar} {pct:5.1f}%  {timecode(done)} / "
                        f"{timecode(total_seconds)}  {speed}   "
                    )
                else:
                    sys.stdout.write(f"\r  {timecode(done)} encoded  {speed}   ")
                sys.stdout.flush()
                _emit_progress(label, done, total_seconds, speed)
        process.wait()
        sys.stdout.write("\n")

        if process.returncode != 0:
            err_file.seek(0)
            tail = "\n".join(err_file.read().strip().splitlines()[-20:])
            raise PipelineError(f"{label} failed (exit {process.returncode}):\n{tail}")

    if total_seconds and total_seconds > 0:
        _emit_progress(label, total_seconds, total_seconds, "—")
    print(f"  ✔ {label} in {timecode(time.monotonic() - started)}")
