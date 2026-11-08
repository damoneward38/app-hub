#!/usr/bin/env python3
"""Green Machine — chroma key and background compositing for houly-pipe.

Pulls a subject off a green (or blue, or any) screen and places it over a still,
a video, or a flat colour, with scale/rotation/offset control and real edge
treatment: soft matte, spill suppression, feathering.

Frames stream straight into ffmpeg, so a 4K source costs the same memory as a
720p one and the audio survives the round trip.

    # stills
    python3 green_machine.py --input shot.png --bg studio.jpg --output out.png

    # video, subject 20% larger, nudged right, over a looping plate
    python3 green_machine.py --input take.mp4 --bg plate.mp4 --output out.mp4 \
        --size 1.2 --x 0.08 --rotate 3

    # no green screen? use person segmentation (needs: pip install mediapipe)
    python3 green_machine.py --input vlog.mp4 --bg office.jpg --output out.mp4 \
        --matte person

Only OpenCV, NumPy and FFmpeg are required. MediaPipe is optional and used
solely by `--matte person`.
"""

from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Callable, Iterator

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import (  # noqa: E402
    FFMPEG,
    PipelineError,
    ensure_dir,
    human_size,
    parse_time,
    probe,
    require_tools,
    timecode,
)

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}

# Digital green ("Chroma Key Green", the paint most cycloramas use) and the
# matching blue. Named so nobody has to remember the hex.
NAMED_COLORS: dict[str, str] = {
    "green": "#00B140",
    "blue": "#0047BB",
    "white": "#FFFFFF",
    "black": "#000000",
    "magenta": "#FF00FF",
}


# --------------------------------------------------------------------------- #
# colour
# --------------------------------------------------------------------------- #

def parse_color(value: str) -> tuple[int, int, int]:
    """Accept `green`, `#00B140`, `00b140` or `0,177,64` and return BGR."""
    text = str(value).strip().lower()
    # Lower again after the lookup: the table's hex values are uppercase.
    text = NAMED_COLORS.get(text, text).lower()

    if "," in text:
        parts = [part.strip() for part in text.split(",")]
        if len(parts) != 3 or not all(part.isdigit() for part in parts):
            raise PipelineError(f"Unrecognised colour: {value!r}")
        red, green, blue = (int(part) for part in parts)
    else:
        hexcode = text.lstrip("#")
        if len(hexcode) == 3:
            hexcode = "".join(char * 2 for char in hexcode)
        if len(hexcode) != 6 or any(char not in "0123456789abcdef" for char in hexcode):
            raise PipelineError(
                f"Unrecognised colour: {value!r}. Use a name "
                f"({', '.join(sorted(NAMED_COLORS))}), #RRGGBB, or R,G,B."
            )
        red, green, blue = (int(hexcode[i:i + 2], 16) for i in (0, 2, 4))

    for channel in (red, green, blue):
        if not 0 <= channel <= 255:
            raise PipelineError(f"Colour channels must be 0-255: {value!r}")
    return blue, green, red


# --------------------------------------------------------------------------- #
# matte extraction
# --------------------------------------------------------------------------- #

def chroma_matte(
    frame: np.ndarray,
    key_bgr: tuple[int, int, int],
    tolerance: float,
    softness: float,
) -> np.ndarray:
    """Alpha in 0..1 (1 = keep the pixel) from chroma distance to the key colour.

    Distance is measured in the Cr/Cb plane, which ignores luminance — that is
    what lets one setting survive a screen that is brighter at the top than at
    the feet. A hue/saturation threshold cannot do that, and a hard
    `mask > 0.5` throws away the soft edge that makes hair look real.
    """
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb).astype(np.float32)
    key_patch = np.array([[list(key_bgr)]], dtype=np.uint8)
    key = cv2.cvtColor(key_patch, cv2.COLOR_BGR2YCrCb).astype(np.float32)[0, 0]

    delta_cr = ycrcb[..., 1] - key[1]
    delta_cb = ycrcb[..., 2] - key[2]
    distance = np.sqrt(delta_cr * delta_cr + delta_cb * delta_cb) / 255.0

    span = max(softness, 1e-4)
    alpha = (distance - tolerance) / span
    return np.clip(alpha, 0.0, 1.0)


def suppress_spill(
    frame: np.ndarray,
    key_bgr: tuple[int, int, int],
    amount: float,
) -> np.ndarray:
    """Pull the key colour back out of the subject's edges.

    A green screen bounces onto shoulders and hair; without this the cut-out
    keeps a green rim that reads as fake no matter how good the matte is. The
    dominant key channel is clamped toward the other two, which neutralises the
    fringe while leaving genuinely green wardrobe mostly intact.
    """
    if amount <= 0:
        return frame

    working = frame.astype(np.float32)
    dominant = int(np.argmax(key_bgr))
    others = [index for index in range(3) if index != dominant]
    ceiling = np.maximum(working[..., others[0]], working[..., others[1]])
    excess = np.maximum(working[..., dominant] - ceiling, 0.0)
    working[..., dominant] -= excess * float(np.clip(amount, 0.0, 1.0))
    return np.clip(working, 0, 255).astype(np.uint8)


class PersonMatte:
    """MediaPipe selfie segmentation, imported only if actually requested."""

    def __init__(self) -> None:
        try:
            import mediapipe as mp  # noqa: PLC0415 - optional dependency
        except ImportError as error:  # pragma: no cover - depends on the host
            raise PipelineError(
                "--matte person needs MediaPipe, which is not installed.\n"
                "  Install it:  pip install mediapipe\n"
                "  Or key off a coloured screen instead:  --matte chroma"
            ) from error
        self._segmenter = mp.solutions.selfie_segmentation.SelfieSegmentation(
            model_selection=1
        )

    def __call__(self, frame: np.ndarray) -> np.ndarray:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mask = self._segmenter.process(rgb).segmentation_mask
        if mask is None:
            return np.ones(frame.shape[:2], dtype=np.float32)
        if mask.shape[:2] != frame.shape[:2]:
            mask = cv2.resize(mask, (frame.shape[1], frame.shape[0]),
                              interpolation=cv2.INTER_LINEAR)
        return np.clip(mask.astype(np.float32), 0.0, 1.0)


def feather(alpha: np.ndarray, radius: int) -> np.ndarray:
    """Soften matte edges. Radius is in pixels; 0 disables."""
    if radius <= 0:
        return alpha
    size = int(radius) * 2 + 1
    return cv2.GaussianBlur(alpha, (size, size), 0)


# --------------------------------------------------------------------------- #
# geometry
# --------------------------------------------------------------------------- #

def place(
    layer: np.ndarray,
    canvas: tuple[int, int],
    scale: float,
    rotate: float,
    offset_x: float,
    offset_y: float,
    *,
    border: float | tuple[float, float, float] = 0,
) -> np.ndarray:
    """Scale, rotate and offset `layer` onto a canvas of a fixed size.

    One affine warp does all three at the output resolution. Doing them as three
    separate `resize`/`warpAffine` calls changes the array's shape as it goes,
    which is how a scaled foreground ends up a different size from the
    background and the composite fails outright.

    Offsets are fractions of the canvas, so `--x 0.5` is half a screen right
    regardless of resolution.
    """
    canvas_width, canvas_height = canvas
    height, width = layer.shape[:2]

    matrix = cv2.getRotationMatrix2D((width / 2.0, height / 2.0), rotate, scale)
    matrix[0, 2] += (canvas_width - width) / 2.0 + offset_x * canvas_width
    matrix[1, 2] += (canvas_height - height) / 2.0 + offset_y * canvas_height

    return cv2.warpAffine(
        layer, matrix, (canvas_width, canvas_height),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=border,
    )


def fit_cover(image: np.ndarray, canvas: tuple[int, int]) -> np.ndarray:
    """Resize to fill the canvas, cropping the overflow — never stretch a plate."""
    canvas_width, canvas_height = canvas
    height, width = image.shape[:2]
    if (width, height) == (canvas_width, canvas_height):
        return image

    ratio = max(canvas_width / width, canvas_height / height)
    resized = cv2.resize(
        image, (max(1, int(round(width * ratio))), max(1, int(round(height * ratio)))),
        interpolation=cv2.INTER_AREA if ratio < 1 else cv2.INTER_LINEAR,
    )
    top = max(0, (resized.shape[0] - canvas_height) // 2)
    left = max(0, (resized.shape[1] - canvas_width) // 2)
    return resized[top:top + canvas_height, left:left + canvas_width]


# --------------------------------------------------------------------------- #
# compositing
# --------------------------------------------------------------------------- #

def composite(
    foreground: np.ndarray,
    background: np.ndarray,
    alpha: np.ndarray,
    opacity: float = 1.0,
) -> np.ndarray:
    """Standard over-operator: fg*a + bg*(1-a).

    `opacity` scales the matte, so 0.5 is a half-dissolved subject. It must not
    scale the two images independently — doing that darkens the background by
    (1 - opacity) and the plate comes out nearly black at the default setting.
    """
    if foreground.shape != background.shape:
        raise PipelineError(
            f"Composite size mismatch: foreground {foreground.shape[1]}x"
            f"{foreground.shape[0]} vs background {background.shape[1]}x"
            f"{background.shape[0]}."
        )

    blend = (alpha * float(np.clip(opacity, 0.0, 1.0)))[..., None]
    out = foreground.astype(np.float32) * blend + background.astype(np.float32) * (1.0 - blend)
    return np.clip(out, 0, 255).astype(np.uint8)


# --------------------------------------------------------------------------- #
# sources
# --------------------------------------------------------------------------- #

@dataclass
class Source:
    """A foreground provider plus everything the encoder needs to match it."""
    frames: Iterator[np.ndarray]
    width: int
    height: int
    fps: float
    count: int
    is_video: bool
    audio_from: Path | None
    # Where the kept audio starts in `audio_from`, and how much of it to keep.
    # Without these a windowed key would silently mux the audio from 0:00.
    audio_offset: float = 0.0
    audio_duration: float | None = None


def _video_frames(capture: cv2.VideoCapture, limit: int | None) -> Iterator[np.ndarray]:
    emitted = 0
    try:
        while limit is None or emitted < limit:
            ok, frame = capture.read()
            if not ok:
                break
            emitted += 1
            yield frame
    finally:
        capture.release()


def open_source(
    path: str,
    limit: int | None,
    fps_override: float | None,
    *,
    start: float = 0.0,
    duration: float | None = None,
) -> Source:
    """Open a still, a video file, or a webcam index as the foreground.

    `start`/`duration` key only a window of the clip. The pipeline needs this:
    a scene using six seconds of a one-hour source must not pay to composite
    the other fifty-nine minutes.
    """
    if path.isdigit() or path == "webcam":
        index = int(path) if path.isdigit() else 0
        capture = cv2.VideoCapture(index)
        if not capture.isOpened():
            raise PipelineError(
                f"No camera at index {index}. On a headless machine there is no "
                "webcam to open — pass a file instead."
            )
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        return Source(
            frames=_video_frames(capture, limit),
            width=width, height=height,
            fps=fps_override or capture.get(cv2.CAP_PROP_FPS) or 30.0,
            count=limit or 0, is_video=True, audio_from=None,
        )

    source = Path(path).expanduser()
    if not source.is_file():
        raise PipelineError(f"Input not found: {source}")

    if source.suffix.lower() in IMAGE_SUFFIXES:
        image = cv2.imread(str(source), cv2.IMREAD_COLOR)
        if image is None:
            raise PipelineError(f"Could not decode image: {source}")
        return Source(
            frames=iter([image]),
            width=image.shape[1], height=image.shape[0],
            fps=fps_override or 30.0, count=1, is_video=False, audio_from=None,
        )

    facts = probe(source)
    if not facts["has_video"]:
        raise PipelineError(f"No video stream in {source.name}.")
    capture = cv2.VideoCapture(str(source))
    if not capture.isOpened():
        raise PipelineError(f"Could not open video: {source}")

    fps = fps_override or facts["fps"] or capture.get(cv2.CAP_PROP_FPS) or 30.0
    if start > 0:
        if start >= facts["duration"]:
            raise PipelineError(
                f"--start {timecode(start)} is past the end of {source.name} "
                f"({timecode(facts['duration'])})."
            )
        capture.set(cv2.CAP_PROP_POS_MSEC, start * 1000.0)

    budget = int(round(duration * fps)) if duration else None
    if limit:
        budget = min(budget, limit) if budget else limit

    total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    if total and start > 0:
        total = max(0, total - int(round(start * fps)))
    if budget:
        total = min(total, budget) if total else budget

    return Source(
        frames=_video_frames(capture, budget),
        width=facts["width"] or int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)),
        height=facts["height"] or int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        fps=fps,
        count=total,
        is_video=True,
        audio_from=source if facts["has_audio"] else None,
        audio_offset=start,
        audio_duration=duration,
    )


def open_background(spec: str, canvas: tuple[int, int]) -> Callable[[], np.ndarray]:
    """Return a puller that yields one canvas-sized background frame per call.

    Videos loop forever, so the plate never runs out before the subject does.
    """
    width, height = canvas

    is_path = Path(spec).expanduser().exists()
    if not is_path and (spec.startswith("#") or "," in spec or spec.lower() in NAMED_COLORS):
        blue, green, red = parse_color(spec)
        flat = np.full((height, width, 3), (blue, green, red), dtype=np.uint8)
        return lambda: flat

    plate = Path(spec).expanduser()
    if not plate.is_file():
        raise PipelineError(
            f"Background not found: {plate}. Pass an image, a video, or a "
            f"colour like '#101010' or 'green'."
        )

    if plate.suffix.lower() in IMAGE_SUFFIXES:
        image = cv2.imread(str(plate), cv2.IMREAD_COLOR)
        if image is None:
            raise PipelineError(f"Could not decode background image: {plate}")
        fitted = fit_cover(image, canvas)
        return lambda: fitted

    capture = cv2.VideoCapture(str(plate))
    if not capture.isOpened():
        raise PipelineError(f"Could not open background video: {plate}")
    last: dict[str, np.ndarray] = {}

    def pull() -> np.ndarray:
        ok, frame = capture.read()
        if not ok:
            capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ok, frame = capture.read()
        if not ok:
            # A plate that cannot be rewound must not abort a long composite.
            if "frame" in last:
                return last["frame"]
            raise PipelineError(f"Background video has no readable frames: {plate}")
        fitted = fit_cover(frame, canvas)
        last["frame"] = fitted
        return fitted

    return pull


# --------------------------------------------------------------------------- #
# encoding
# --------------------------------------------------------------------------- #

class Encoder:
    """Raw BGR frames piped into ffmpeg, with the source audio muxed back in.

    Writing through cv2.VideoWriter would mean a second lossy encode and would
    silently drop the audio track.
    """

    def __init__(
        self,
        output: Path,
        width: int,
        height: int,
        fps: float,
        *,
        crf: int,
        preset: str,
        audio_from: Path | None,
        audio_offset: float = 0.0,
        audio_duration: float | None = None,
    ) -> None:
        command = [
            FFMPEG, "-hide_banner", "-y", "-loglevel", "error",
            "-f", "rawvideo", "-pix_fmt", "bgr24",
            "-s", f"{width}x{height}", "-r", f"{fps:.6f}", "-i", "pipe:0",
        ]
        if audio_from is not None:
            # -ss/-t go BEFORE -i so ffmpeg seeks instead of decoding and
            # discarding, and so the audio window matches the keyed frames.
            if audio_offset > 0:
                command += ["-ss", f"{audio_offset:.3f}"]
            if audio_duration:
                command += ["-t", f"{audio_duration:.3f}"]
            command += ["-i", str(audio_from), "-map", "0:v:0", "-map", "1:a:0",
                        "-c:a", "aac", "-b:a", "192k", "-shortest"]
        command += [
            "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output),
        ]

        self._errors = tempfile.TemporaryFile("w+", encoding="utf-8", errors="replace")
        self._process = subprocess.Popen(
            command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=self._errors
        )
        self._command = command

    def write(self, frame: np.ndarray) -> None:
        assert self._process.stdin is not None
        try:
            self._process.stdin.write(np.ascontiguousarray(frame).tobytes())
        except BrokenPipeError as error:
            raise PipelineError(f"ffmpeg stopped early:\n{self._tail()}") from error

    def close(self) -> None:
        if self._process.stdin is not None:
            try:
                self._process.stdin.close()
            except BrokenPipeError:
                pass
        code = self._process.wait()
        tail = self._tail()
        self._errors.close()
        if code != 0:
            raise PipelineError(
                f"ffmpeg failed (exit {code}):\n{tail}\n"
                f"  command: {shlex.join(self._command)}"
            )

    def _tail(self) -> str:
        try:
            self._errors.seek(0)
            return "\n".join(self._errors.read().strip().splitlines()[-15:])
        except ValueError:
            return ""


# --------------------------------------------------------------------------- #
# pipeline
# --------------------------------------------------------------------------- #

def run(
    args: argparse.Namespace,
    on_progress: Callable[[int, int], None] | None = None,
) -> None:
    """Composite according to `args`. `on_progress(done, total)` is optional and
    lets a caller (the pipeline) report frame progress into its own status file.
    """
    require_tools()

    source = open_source(args.input, args.limit, args.fps,
                         start=args.start, duration=args.duration)
    canvas = (source.width, source.height)
    background = open_background(args.bg, canvas)
    key_bgr = parse_color(args.key_color)

    matte: Callable[[np.ndarray], np.ndarray]
    if args.matte == "person":
        matte = PersonMatte()
    else:
        matte = lambda frame: chroma_matte(  # noqa: E731 - one-line adapter
            frame, key_bgr, args.tolerance, args.softness
        )

    output = Path(args.output).expanduser()
    ensure_dir(output.parent)

    # The OUTPUT decides stills, not the input: keying one frame of a long take
    # to a PNG is how you check the settings before committing to the whole
    # thing. Going by the source alone pushed raw frames at an image encoder
    # and failed with an ffmpeg muxer error nobody could act on.
    wants_still = output.suffix.lower() in IMAGE_SUFFIXES
    # Checked before anything is written: a single image cannot fill a video,
    # and finding out via a raw OpenCV "no writer for this extension" error
    # tells the operator nothing about what to change.
    if not source.is_video and not wants_still:
        raise PipelineError(
            f"{Path(args.input).name} is one still image but {output.name} is a "
            f"video. Give the output an image extension (.png/.jpg), or pass a "
            f"video or webcam index as --input."
        )

    print(f"green-machine · {Path(args.input).name} over {Path(args.bg).name}")
    print(f"  {canvas[0]}x{canvas[1]} · matte {args.matte}"
          + (f" · key {args.key_color}" if args.matte == "chroma" else ""))

    # ---- stills ---------------------------------------------------------- #
    if wants_still or not source.is_video:
        frame = next(source.frames, None)
        if frame is None:
            raise PipelineError(f"No frames were readable from {args.input}.")
        result = _compose_one(frame, background(), matte, key_bgr, canvas, args)
        if not cv2.imwrite(str(output), result):
            raise PipelineError(
                f"Could not write image: {output} (is {output.suffix!r} a format "
                f"OpenCV can write?)"
            )
        if on_progress is not None:
            on_progress(1, 1)
        print(f"\n✔ {output}  ({human_size(output.stat().st_size)})")
        return

    # ---- video ----------------------------------------------------------- #
    encoder = Encoder(
        output, canvas[0], canvas[1], source.fps,
        crf=args.crf, preset=args.preset,
        audio_from=None if args.mute else source.audio_from,
        audio_offset=source.audio_offset,
        audio_duration=source.audio_duration,
    )
    written = 0
    try:
        for frame in source.frames:
            encoder.write(_compose_one(frame, background(), matte, key_bgr, canvas, args))
            written += 1
            if on_progress is not None:
                on_progress(written, source.count)
            if written % 10 == 0 or written == source.count:
                total = f"/{source.count}" if source.count else ""
                sys.stdout.write(f"\r  composited {written}{total} frames   ")
                sys.stdout.flush()
    finally:
        encoder.close()
    sys.stdout.write("\n")

    if written == 0:
        raise PipelineError(f"No frames were readable from {args.input}.")

    size = output.stat().st_size if output.is_file() else 0
    print(f"✔ {output}  ({human_size(size)} · {written} frames · "
          f"{timecode(written / max(source.fps, 1e-6))}"
          + ("" if args.mute or source.audio_from is None else " · audio kept") + ")")


def _compose_one(
    frame: np.ndarray,
    plate: np.ndarray,
    matte: Callable[[np.ndarray], np.ndarray],
    key_bgr: tuple[int, int, int],
    canvas: tuple[int, int],
    args: argparse.Namespace,
) -> np.ndarray:
    """Matte, de-spill, place and composite a single frame."""
    alpha = matte(frame)
    alpha = feather(alpha, args.feather)

    cleaned = frame
    if args.matte == "chroma":
        cleaned = suppress_spill(frame, key_bgr, args.despill)

    moved = (args.size != 1.0 or args.rotate != 0.0 or args.x != 0.0 or args.y != 0.0)
    if moved:
        cleaned = place(cleaned, canvas, args.size, args.rotate, args.x, args.y)
        alpha = place(alpha, canvas, args.size, args.rotate, args.x, args.y, border=0.0)
    elif cleaned.shape[:2] != (canvas[1], canvas[0]):
        cleaned = cv2.resize(cleaned, canvas, interpolation=cv2.INTER_LINEAR)
        alpha = cv2.resize(alpha, canvas, interpolation=cv2.INTER_LINEAR)

    return composite(cleaned, plate, alpha, args.blend)


def key_one_frame(
    input_path: str,
    *,
    start: float = 0.0,
    background: str = "#101010",
    key_color: str = "green",
    tolerance: float = 0.16,
    softness: float = 0.08,
    despill: float = 0.8,
    feather: int = 2,
    size: float = 1.0,
    x: float = 0.0,
    y: float = 0.0,
    rotate: float = 0.0,
    blend: float = 1.0,
    max_width: int | None = None,
) -> tuple[np.ndarray, tuple[int, int]]:
    """Key exactly ONE frame and return it (BGR) with the full-size canvas.

    The bridge uses this for the phone's "check my key" preview: one frame at a
    chosen second, pushed through the same matte, spill and placement code a
    full render runs — never a simplified copy that could disagree with it.
    `max_width` downscales the RESULT for the trip back, after the key is
    computed at full size, so tolerance is judged on real pixels.
    """
    require_tools()

    for name, value in (("tolerance", tolerance), ("softness", softness),
                        ("despill", despill), ("blend", blend)):
        if not 0.0 <= value <= 1.0:
            raise PipelineError(f"{name} must be between 0 and 1 (got {value}).")
    if size <= 0:
        raise PipelineError(f"size must be greater than 0 (got {size}).")
    if feather < 0:
        raise PipelineError(f"feather cannot be negative (got {feather}).")
    if start < 0:
        raise PipelineError(f"start cannot be negative (got {start}).")

    args = SimpleNamespace(
        input=input_path, bg=background, matte="chroma", key_color=key_color,
        tolerance=tolerance, softness=softness, despill=despill,
        feather=feather, size=size, rotate=rotate, x=x, y=y, blend=blend,
    )

    source = open_source(input_path, limit=1, fps_override=None, start=start)
    canvas = (source.width, source.height)
    plate = open_background(background, canvas)()
    key_bgr = parse_color(key_color)
    matte = lambda frame: chroma_matte(  # noqa: E731 - same adapter run() uses
        frame, key_bgr, tolerance, softness
    )

    frame = next(source.frames, None)
    if frame is None:
        raise PipelineError(f"No frames were readable from {input_path}.")
    result = _compose_one(frame, plate, matte, key_bgr, canvas, args)

    if max_width is not None and result.shape[1] > max_width:
        height = max(1, round(result.shape[0] * max_width / result.shape[1]))
        result = cv2.resize(result, (max_width, height), interpolation=cv2.INTER_AREA)
    return result, canvas


# --------------------------------------------------------------------------- #
# cli
# --------------------------------------------------------------------------- #

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="green_machine.py",
        description="Chroma key / person cut-out and background compositing.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--input", required=True,
                        help="Foreground image, video, or a webcam index (0)")
    parser.add_argument("--bg", required=True,
                        help="Background image, video, or colour (#101010, 'green')")
    parser.add_argument("--output", required=True, help="Output .png / .mp4")

    keying = parser.add_argument_group("keying")
    keying.add_argument("--matte", choices=("chroma", "person"), default="chroma",
                        help="chroma = key a screen colour; person = MediaPipe cut-out")
    keying.add_argument("--key-color", default="green",
                        help="Screen colour to remove: name, #RRGGBB or R,G,B")
    keying.add_argument("--tolerance", type=float, default=0.16,
                        help="How close to the key counts as background (0-1)")
    keying.add_argument("--softness", type=float, default=0.08,
                        help="Width of the partial-transparency ramp (0-1)")
    keying.add_argument("--despill", type=float, default=0.8,
                        help="Remove key-colour bounce from edges (0-1)")
    keying.add_argument("--feather", type=int, default=2,
                        help="Matte edge blur in pixels (0 = hard edge)")

    layout = parser.add_argument_group("layout")
    layout.add_argument("--size", type=float, default=1.0, help="Scale (1.0 = original)")
    layout.add_argument("--rotate", type=float, default=0.0, help="Rotation in degrees")
    layout.add_argument("--x", type=float, default=0.0, help="Offset, fraction of width")
    layout.add_argument("--y", type=float, default=0.0, help="Offset, fraction of height")
    layout.add_argument("--blend", type=float, default=1.0,
                        help="Foreground opacity (1 = solid)")

    encode = parser.add_argument_group("output")
    encode.add_argument("--crf", type=int, default=18, help="x264 quality, lower is better")
    encode.add_argument("--preset", default="medium", help="x264 speed preset")
    encode.add_argument("--fps", type=float, default=None, help="Override output frame rate")
    encode.add_argument("--mute", action="store_true", help="Drop the source audio")
    encode.add_argument("--limit", type=int, default=None,
                        help="Only process the first N frames (quick look)")
    encode.add_argument("--start", default=None,
                        help="Key from this point in the source (e.g. 12 or 00:00:12)")
    encode.add_argument("--duration", default=None,
                        help="Key only this much of the source (e.g. 6 or 00:00:06)")

    args = parser.parse_args(argv)

    for name in ("start", "duration"):
        raw = getattr(args, name)
        if raw is None:
            setattr(args, name, 0.0 if name == "start" else None)
            continue
        try:
            setattr(args, name, float(parse_time(raw)))
        except PipelineError as error:
            parser.error(f"--{name}: {error}")
    if args.start < 0:
        parser.error(f"--start cannot be negative (got {args.start})")
    if args.duration is not None and args.duration <= 0:
        parser.error(f"--duration must be greater than 0 (got {args.duration})")

    for name in ("tolerance", "softness", "despill", "blend"):
        value = getattr(args, name)
        if not 0.0 <= value <= 1.0:
            parser.error(f"--{name} must be between 0 and 1 (got {value})")
    if args.size <= 0:
        parser.error(f"--size must be greater than 0 (got {args.size})")
    if args.feather < 0:
        parser.error(f"--feather cannot be negative (got {args.feather})")
    if args.limit is not None and args.limit < 1:
        parser.error(f"--limit must be at least 1 (got {args.limit})")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        run(args)
    except PipelineError as error:
        print(f"\n✖ {error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\n… stopped", file=sys.stderr)
        return 130
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
