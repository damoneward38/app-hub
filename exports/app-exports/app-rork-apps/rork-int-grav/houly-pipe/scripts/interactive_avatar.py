#!/usr/bin/env python3
"""Interactive avatar — a keyed subject that reacts to things in the background.

Pulls the subject off a coloured screen (the same keyer `green_machine.py` uses),
tracks where their hands reach, and lights up a hotspot when a hand arrives —
writing a timeline of those moments and, optionally, mixing a cue sound onto the
finished video at each one.

    # subject over a plate, with two things they can reach for
    python3 interactive_avatar.py --input take.mp4 --bg desk.jpg --output out.mp4 \
        --hotspot "mug:0.72,0.58,0.09" --hotspot "laptop:0.28,0.62,0.12"

    # hear it as well as see it
    python3 interactive_avatar.py --input take.mp4 --bg desk.jpg --output out.mp4 \
        --hotspot "mug:0.72,0.58,0.09" --cue assets/tap.wav

    # let a detector place the hotspots (needs: pip install ultralytics)
    python3 interactive_avatar.py --input take.mp4 --bg desk.jpg --output out.mp4 \
        --detect yolo

Reach tracking works with nothing but OpenCV: the keyed silhouette already knows
where the subject ends, and the points furthest from their centre of mass are
their hands. MediaPipe gives true finger landmarks and is used only when asked
for with `--hands mediapipe`; a detector is only imported for `--detect yolo`.
Neither is required, and neither is imported unless requested.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Sequence

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

import green_machine as gm  # noqa: E402
from utils import (  # noqa: E402
    PipelineError,
    ensure_dir,
    human_size,
    parse_time,
    require_tools,
    run_ffmpeg,
    timecode,
)

# Overlay colours, BGR. Everything in this file stays BGR from decode to encode:
# converting to RGB for one library and forgetting to convert back is what turns
# a subject's skin blue.
IDLE_COLOR = (210, 200, 190)
ACTIVE_COLOR = (249, 121, 232)   # Intégrav magenta
REACH_COLOR = (246, 92, 139)     # Intégrav violet


# --------------------------------------------------------------------------- #
# hotspots
# --------------------------------------------------------------------------- #

@dataclass
class Hotspot:
    """Something in the background the subject can reach for.

    Position and radius are fractions of the canvas, so the same hotspot lands
    in the same place whether the composite is 720p or 4K.
    """
    label: str
    x: float
    y: float
    radius: float

    def centre(self, canvas: tuple[int, int]) -> tuple[int, int]:
        return int(round(self.x * canvas[0])), int(round(self.y * canvas[1]))

    def pixel_radius(self, canvas: tuple[int, int]) -> int:
        return max(6, int(round(self.radius * canvas[0])))

    @classmethod
    def parse(cls, text: str) -> "Hotspot":
        """`label:x,y,radius` — e.g. `mug:0.72,0.58,0.09`."""
        label, separator, numbers = text.partition(":")
        if not separator:
            raise PipelineError(
                f"Bad --hotspot {text!r}. Use label:x,y,radius — e.g. 'mug:0.72,0.58,0.09'."
            )
        parts = [part.strip() for part in numbers.split(",")]
        if len(parts) != 3:
            raise PipelineError(
                f"Bad --hotspot {text!r}: expected three numbers (x,y,radius), got {len(parts)}."
            )
        try:
            x, y, radius = (float(part) for part in parts)
        except ValueError as error:
            raise PipelineError(f"Bad --hotspot {text!r}: {parts} are not all numbers.") from error

        label = label.strip() or "object"
        for name, value in (("x", x), ("y", y)):
            if not 0.0 <= value <= 1.0:
                raise PipelineError(
                    f"--hotspot {label!r}: {name} must be between 0 and 1 (got {value:g}). "
                    f"These are fractions of the frame, not pixels."
                )
        if not 0.0 < radius <= 1.0:
            raise PipelineError(
                f"--hotspot {label!r}: radius must be between 0 and 1 (got {radius:g})."
            )
        return cls(label=label, x=x, y=y, radius=radius)


def detect_hotspots(plate: np.ndarray, confidence: float) -> list[Hotspot]:
    """Place hotspots on whatever a detector finds in the background plate.

    Run once on the plate rather than per frame: a detector on every frame of a
    long take costs more than the whole composite, and a background that does
    not move has nothing new to find.
    """
    try:
        from ultralytics import YOLO  # noqa: PLC0415 - optional dependency
    except ImportError as error:
        raise PipelineError(
            "--detect yolo needs Ultralytics, which is not installed.\n"
            "  Install it:  pip install ultralytics\n"
            "  Or place the hotspots yourself:  --hotspot 'mug:0.72,0.58,0.09'"
        ) from error

    height, width = plate.shape[:2]
    model = YOLO("yolov8n.pt")
    results = model.predict(plate, conf=confidence, verbose=False)

    spots: list[Hotspot] = []
    for result in results:
        names = getattr(result, "names", {}) or {}
        for box in getattr(result, "boxes", []) or []:
            left, top, right, bottom = (float(value) for value in box.xyxy[0])
            label = str(names.get(int(box.cls[0]), "object"))
            spots.append(Hotspot(
                label=label,
                x=((left + right) / 2) / width,
                y=((top + bottom) / 2) / height,
                # Half the box's largest side, as a fraction of width.
                radius=max(right - left, bottom - top) / 2 / width,
            ))
    return spots


# --------------------------------------------------------------------------- #
# reach tracking
# --------------------------------------------------------------------------- #

def reach_points(alpha: np.ndarray, limit: int = 3) -> list[tuple[int, int]]:
    """Where the subject reaches, from the matte alone.

    The keyed silhouette already says exactly where the subject stops, and the
    points on its outline furthest from the centre of mass are the extremities:
    hands, and usually the head. No model, no download, works on any machine
    that can run the keyer. `--hands mediapipe` swaps in true finger landmarks.
    """
    mask = (alpha > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return []

    biggest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(biggest) < 64:  # a few stray pixels are not a person
        return []

    hull = cv2.convexHull(biggest).reshape(-1, 2).astype(np.float32)
    if hull.shape[0] == 0:
        return []

    # Where the silhouette meets the frame edge it has been cropped, not ended.
    # Those points are usually the furthest from the centre — a subject framed
    # at the waist would otherwise "reach" with the bottom corners of their
    # torso forever, and a real hand would never rank high enough to count.
    height, width = mask.shape[:2]
    margin = max(2.0, min(height, width) * 0.01)
    inside = hull[
        (hull[:, 0] > margin) & (hull[:, 0] < width - 1 - margin)
        & (hull[:, 1] > margin) & (hull[:, 1] < height - 1 - margin)
    ]
    # A subject who fills the frame leaves nothing inside; fall back rather
    # than report no reach at all.
    if inside.shape[0] >= 2:
        hull = inside

    centre = hull.mean(axis=0)
    distances = np.linalg.norm(hull - centre, axis=1)
    order = np.argsort(-distances)

    # Extremities must be far enough apart to be different limbs, or both
    # "hands" end up being two pixels on the same fingertip.
    separation = max(12.0, float(np.sqrt(cv2.contourArea(biggest))) * 0.35)
    picked: list[tuple[int, int]] = []
    for index in order:
        point = hull[index]
        if all(np.linalg.norm(point - np.array(other)) > separation for other in picked):
            picked.append((int(point[0]), int(point[1])))
        if len(picked) >= limit:
            break
    return picked


class HandTracker:
    """MediaPipe hand landmarks, imported only when `--hands mediapipe` is used."""

    def __init__(self) -> None:
        try:
            import mediapipe as mp  # noqa: PLC0415 - optional dependency
        except ImportError as error:
            raise PipelineError(
                "--hands mediapipe needs MediaPipe, which is not installed.\n"
                "  Install it:  pip install mediapipe\n"
                "  Or track reach from the cut-out instead:  --hands matte"
            ) from error
        self._hands = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def __call__(self, frame: np.ndarray) -> list[tuple[int, int]]:
        height, width = frame.shape[:2]
        result = self._hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        landmarks = getattr(result, "multi_hand_landmarks", None)
        if not landmarks:
            return []
        points: list[tuple[int, int]] = []
        for hand in landmarks:
            # 8 is the index fingertip — the part that actually touches things.
            tip = hand.landmark[8]
            points.append((int(tip.x * width), int(tip.y * height)))
        return points


# --------------------------------------------------------------------------- #
# events
# --------------------------------------------------------------------------- #

@dataclass
class Contact:
    """One unbroken stretch of the subject touching a hotspot."""
    label: str
    start_frame: int
    end_frame: int
    fps: float

    @property
    def start_seconds(self) -> float:
        return self.start_frame / max(self.fps, 1e-6)

    @property
    def end_seconds(self) -> float:
        return (self.end_frame + 1) / max(self.fps, 1e-6)

    def as_dict(self) -> dict[str, Any]:
        return {
            "label": self.label,
            "startFrame": self.start_frame,
            "endFrame": self.end_frame,
            "start": round(self.start_seconds, 3),
            "end": round(self.end_seconds, 3),
            "startLabel": timecode(self.start_seconds),
            "durationFrames": self.end_frame - self.start_frame + 1,
        }


@dataclass
class ContactLog:
    """Turns per-frame hits into contiguous contacts.

    A hand hovering on the edge of a hotspot flickers in and out; `gap` frames of
    tolerance keep that from becoming forty separate events (and forty cue sounds).
    """
    fps: float
    gap: int = 4
    closed: list[Contact] = field(default_factory=list)
    _open: dict[str, list[int]] = field(default_factory=dict)

    def record(self, labels: Sequence[str], frame_index: int) -> set[str]:
        """Log this frame's hits; returns the labels that started on it."""
        started: set[str] = set()
        for label in labels:
            if label in self._open:
                self._open[label][1] = frame_index
            else:
                self._open[label] = [frame_index, frame_index]
                started.add(label)

        for label in list(self._open):
            if label in labels:
                continue
            start, last = self._open[label]
            if frame_index - last > self.gap:
                self.closed.append(Contact(label, start, last, self.fps))
                del self._open[label]
        return started

    def finish(self) -> list[Contact]:
        for label, (start, last) in self._open.items():
            self.closed.append(Contact(label, start, last, self.fps))
        self._open.clear()
        self.closed.sort(key=lambda contact: contact.start_frame)
        return self.closed


# --------------------------------------------------------------------------- #
# drawing
# --------------------------------------------------------------------------- #

def draw_hotspot(frame: np.ndarray, spot: Hotspot, canvas: tuple[int, int],
                 active: bool, pulse: float) -> None:
    centre = spot.centre(canvas)
    radius = spot.pixel_radius(canvas)
    colour = ACTIVE_COLOR if active else IDLE_COLOR
    thickness = 3 if active else 1

    if active:
        # A second, breathing ring reads as "held" even in a still frame.
        cv2.circle(frame, centre, int(radius * (1.0 + 0.18 * pulse)), colour, 1, cv2.LINE_AA)
    cv2.circle(frame, centre, radius, colour, thickness, cv2.LINE_AA)

    scale = max(0.4, canvas[0] / 1600)
    text_origin = (centre[0] - radius, centre[1] - radius - int(8 * scale * 2))
    cv2.putText(frame, spot.label, text_origin, cv2.FONT_HERSHEY_SIMPLEX,
                scale, (0, 0, 0), int(3 * scale) + 2, cv2.LINE_AA)
    cv2.putText(frame, spot.label, text_origin, cv2.FONT_HERSHEY_SIMPLEX,
                scale, colour, max(1, int(scale * 2)), cv2.LINE_AA)


def draw_reach(frame: np.ndarray, points: Sequence[tuple[int, int]],
               canvas: tuple[int, int]) -> None:
    radius = max(3, canvas[0] // 160)
    for point in points:
        cv2.circle(frame, point, radius, REACH_COLOR, -1, cv2.LINE_AA)
        cv2.circle(frame, point, radius + 2, (255, 255, 255), 1, cv2.LINE_AA)


# --------------------------------------------------------------------------- #
# audio cues
# --------------------------------------------------------------------------- #

def mix_cues(video: Path, cue: Path, contacts: Sequence[Contact],
             *, has_audio: bool, dry_run: bool) -> None:
    """Lay a short sound over the finished video at each contact.

    Done as a second, audio-only pass with `-c:v copy`: re-encoding the picture
    to add a click would throw away quality for nothing.
    """
    if not contacts:
        print("  · no contacts, so no cues to mix")
        return
    if not cue.is_file():
        raise PipelineError(f"Cue sound not found: {cue}")

    # ffmpeg caps how many inputs a filtergraph can juggle comfortably; a take
    # with hundreds of touches does not need hundreds of clicks either.
    usable = list(contacts[:24])
    if len(contacts) > len(usable):
        print(f"  ! {len(contacts)} contacts, cueing the first {len(usable)}")

    args: list[str] = ["-i", str(video)]
    for _ in usable:
        args += ["-i", str(cue)]

    parts: list[str] = []
    tags: list[str] = []
    for index, contact in enumerate(usable, start=1):
        delay = int(round(contact.start_seconds * 1000))
        parts.append(f"[{index}:a]adelay={delay}|{delay},volume=0.9[cue{index}]")
        tags.append(f"[cue{index}]")

    if has_audio:
        tags.insert(0, "[0:a]")
    total = len(tags)
    parts.append(f"{''.join(tags)}amix=inputs={total}:duration=first:"
                 f"dropout_transition=0:normalize=0[aout]")

    output = video.with_name(f"{video.stem}_cued{video.suffix}")
    args += ["-filter_complex", ";".join(parts),
             "-map", "0:v:0", "-map", "[aout]",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-movflags", "+faststart", str(output)]

    run_ffmpeg(args, label="cues", dry_run=dry_run)
    if not dry_run:
        output.replace(video)


# --------------------------------------------------------------------------- #
# pipeline
# --------------------------------------------------------------------------- #

def run(args: argparse.Namespace) -> None:
    require_tools()

    source = gm.open_source(args.input, args.limit, args.fps,
                            start=args.start, duration=args.duration)
    canvas = (source.width, source.height)
    background = gm.open_background(args.bg, canvas)
    key_bgr = gm.parse_color(args.key_color)

    hotspots = [Hotspot.parse(text) for text in (args.hotspot or [])]
    if args.detect == "yolo":
        found = detect_hotspots(background(), args.confidence)
        print(f"  detector placed {len(found)} hotspot(s): "
              f"{', '.join(spot.label for spot in found) or 'none'}")
        hotspots.extend(found)
    if not hotspots:
        raise PipelineError(
            "No hotspots to react to. Add one with --hotspot 'mug:0.72,0.58,0.09' "
            "(x, y and radius are fractions of the frame), or use --detect yolo."
        )

    tracker: Callable[[np.ndarray], list[tuple[int, int]]] | None = None
    if args.hands == "mediapipe":
        tracker = HandTracker()

    output = Path(args.output).expanduser()
    ensure_dir(output.parent)

    # As in green_machine: the output extension decides stills, so keying one
    # frame to a PNG to check hotspot placement is a first-class move.
    wants_still = output.suffix.lower() in gm.IMAGE_SUFFIXES
    if not source.is_video and not wants_still:
        raise PipelineError(
            f"{Path(args.input).name} is one still image but {output.name} is a "
            f"video. Give the output an image extension (.png/.jpg), or pass a "
            f"video or webcam index as --input."
        )

    print(f"interactive-avatar · {Path(args.input).name} over {Path(args.bg).name}")
    print(f"  {canvas[0]}x{canvas[1]} · key {args.key_color} · "
          f"reach from {args.hands} · {len(hotspots)} hotspot(s)")

    log = ContactLog(fps=source.fps, gap=args.hold)
    encoder: gm.Encoder | None = None
    still: np.ndarray | None = None
    written = 0

    if source.is_video and not wants_still:
        encoder = gm.Encoder(
            output, canvas[0], canvas[1], source.fps,
            crf=args.crf, preset=args.preset,
            audio_from=None if args.mute else source.audio_from,
            audio_offset=source.audio_offset,
            audio_duration=source.audio_duration,
        )

    try:
        for frame in source.frames:
            alpha = gm.chroma_matte(frame, key_bgr, args.tolerance, args.softness)
            alpha = gm.feather(alpha, args.feather)
            cleaned = gm.suppress_spill(frame, key_bgr, args.despill)

            if cleaned.shape[:2] != (canvas[1], canvas[0]):
                cleaned = cv2.resize(cleaned, canvas, interpolation=cv2.INTER_LINEAR)
                alpha = cv2.resize(alpha, canvas, interpolation=cv2.INTER_LINEAR)

            picture = gm.composite(cleaned, background(), alpha, args.blend)

            points = tracker(frame) if tracker else reach_points(alpha, args.reach_points)
            hit = [
                spot.label for spot in hotspots
                if any(
                    (point[0] - spot.centre(canvas)[0]) ** 2
                    + (point[1] - spot.centre(canvas)[1]) ** 2
                    <= spot.pixel_radius(canvas) ** 2
                    for point in points
                )
            ]
            log.record(hit, written)

            pulse = abs(((written % 24) / 12.0) - 1.0)
            for spot in hotspots:
                draw_hotspot(picture, spot, canvas, spot.label in hit, pulse)
            if args.show_reach:
                draw_reach(picture, points, canvas)

            if encoder is not None:
                encoder.write(picture)
            else:
                still = picture
            written += 1

            # One frame is all a still needs; do not walk the whole take for it.
            if wants_still:
                break

            if written % 10 == 0 or written == source.count:
                total = f"/{source.count}" if source.count else ""
                sys.stdout.write(f"\r  {written}{total} frames · "
                                 f"{len(log.closed) + len(hit)} contacts   ")
                sys.stdout.flush()
    finally:
        if encoder is not None:
            encoder.close()

    if written == 0:
        raise PipelineError(f"No frames were readable from {args.input}.")
    sys.stdout.write("\n")

    if still is not None:
        if not cv2.imwrite(str(output), still):
            raise PipelineError(
                f"Could not write image: {output} (is {output.suffix!r} a format "
                f"OpenCV can write?)"
            )

    contacts = log.finish()
    if args.cue and encoder is not None:
        mix_cues(output, Path(args.cue).expanduser(), contacts,
                 has_audio=not args.mute and source.audio_from is not None,
                 dry_run=False)

    events_path = output.with_name(f"{output.stem}_events.json")
    events_path.write_text(json.dumps({
        "source": str(args.input),
        "background": str(args.bg),
        "frames": written,
        "fps": round(source.fps, 3),
        "hotspots": [
            {"label": spot.label, "x": spot.x, "y": spot.y, "radius": spot.radius}
            for spot in hotspots
        ],
        "contacts": [contact.as_dict() for contact in contacts],
    }, indent=2), encoding="utf-8")

    size = output.stat().st_size if output.is_file() else 0
    print(f"\n✔ {output}  ({human_size(size)} · {written} frames)")
    print(f"✔ {events_path}  ({len(contacts)} contact(s))")
    for contact in contacts[:6]:
        print(f"    {timecode(contact.start_seconds)}  {contact.label}"
              f"  ({contact.end_seconds - contact.start_seconds:.2f}s)")


# --------------------------------------------------------------------------- #
# cli
# --------------------------------------------------------------------------- #

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="interactive_avatar.py",
        description="Keyed avatar that reacts to hotspots in the background.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--input", required=True,
                        help="Foreground image, video, or a webcam index (0)")
    parser.add_argument("--bg", required=True,
                        help="Background image, video, or colour (#101010, 'green')")
    parser.add_argument("--output", required=True, help="Output .png / .mp4")

    world = parser.add_argument_group("world")
    world.add_argument("--hotspot", action="append", metavar="LABEL:X,Y,R",
                       help="Reachable thing, as fractions of the frame. Repeatable.")
    world.add_argument("--detect", choices=("none", "yolo"), default="none",
                       help="Place hotspots automatically (yolo needs ultralytics)")
    world.add_argument("--confidence", type=float, default=0.4,
                       help="Detector confidence floor (0-1)")
    world.add_argument("--hands", choices=("matte", "mediapipe"), default="matte",
                       help="matte = reach from the cut-out; mediapipe = finger landmarks")
    world.add_argument("--hold", type=int, default=4,
                       help="Frames of flicker tolerated before a contact ends")
    world.add_argument("--reach-points", type=int, default=3,
                       help="How many extremities to track when --hands matte")
    world.add_argument("--show-reach", action="store_true",
                       help="Draw the tracked reach points")
    world.add_argument("--cue", default=None,
                       help="Sound mixed in at each contact (video output only)")

    keying = parser.add_argument_group("keying")
    keying.add_argument("--key-color", default="green",
                        help="Screen colour to remove: name, #RRGGBB or R,G,B")
    keying.add_argument("--tolerance", type=float, default=0.16)
    keying.add_argument("--softness", type=float, default=0.08)
    keying.add_argument("--despill", type=float, default=0.8)
    keying.add_argument("--feather", type=int, default=2)
    keying.add_argument("--blend", type=float, default=1.0)

    encode = parser.add_argument_group("output")
    encode.add_argument("--crf", type=int, default=18)
    encode.add_argument("--preset", default="medium")
    encode.add_argument("--fps", type=float, default=None)
    encode.add_argument("--mute", action="store_true")
    encode.add_argument("--limit", type=int, default=None,
                        help="Only process the first N frames")
    encode.add_argument("--start", default=None, help="Start at this point in the source")
    encode.add_argument("--duration", default=None, help="Process only this much")

    args = parser.parse_args(argv)

    for name in ("tolerance", "softness", "despill", "blend", "confidence"):
        value = getattr(args, name)
        if not 0.0 <= value <= 1.0:
            parser.error(f"--{name} must be between 0 and 1 (got {value})")
    if args.feather < 0:
        parser.error(f"--feather cannot be negative (got {args.feather})")
    if args.hold < 0:
        parser.error(f"--hold cannot be negative (got {args.hold})")
    if args.reach_points < 1:
        parser.error(f"--reach-points must be at least 1 (got {args.reach_points})")
    if args.limit is not None and args.limit < 1:
        parser.error(f"--limit must be at least 1 (got {args.limit})")

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
