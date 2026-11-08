#!/usr/bin/env python3
"""Generate demo assets so houly-pipe can run an end-to-end render.

Creates, relative to this file's parent (the pipeline root):
  raw/intro.mp4   raw/mid.mp4   raw/finale.mp4   — 8s test clips each
  assets/color_lut.cube                             — gentle warm LUT
  assets/logo.png                                   — watermark
  raw/merged.vtt                                    — two-line subtitle track

Requires ffmpeg on PATH. Safe to re-run: overwrites only these files.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CLIPS = {
    "intro.mp4": ("0x0000FF", "INTRO"),
    "mid.mp4": ("0x00CC00", "MAIN PROGRAMME"),
    "finale.mp4": ("0xFF5500", "FINALE"),
}


def run(args: list[str]) -> None:
    subprocess.run(args, check=True, capture_output=True)


def make_clip(name: str, color: str, label: str) -> None:
    # NOTE: brew's ffmpeg 9 build ships without drawtext (no freetype), so the
    # label is not burned in; the colored frame identifies the clip instead.
    out = ROOT / "raw" / name
    run([
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"testsrc2=size=1280x720:rate=30:duration=8",
        "-f", "lavfi",
        "-i", "anullsrc=r=48000:cl=stereo:d=8",
        "-vf", (
            "drawbox=x=40:y=40:w=1200:h=640:color="
            + color
            + "@0.55:t=fill"
        ),
        "-map", "0:v", "-map", "1:a",
        "-shortest",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        str(out),
    ])
    print("wrote", out)


def make_lut() -> None:
    lines = ['TITLE "houly warm demo"', "LUT_3D_SIZE 4", "DOMAIN_MIN 0 0 0", "DOMAIN_MAX 1 1 1", ""]
    for b in range(4):
        for g in range(4):
            for r in range(4):
                rr, gg, bb = r / 3, g / 3, b / 3
                # gentle warm tint: lift red, cool blue slightly
                lines.append(f"{min(1, rr * 1.05 + 0.02):.6f} {gg:.6f} {bb * 0.97:.6f}")
    out = ROOT / "assets" / "color_lut.cube"
    out.write_text("\n".join(lines) + "\n")
    print("wrote", out)


def make_logo() -> None:
    # Textless semi-transparent mark (drawtext unavailable in brew ffmpeg 9).
    out = ROOT / "assets" / "logo.png"
    run([
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0xE8EDF7@0.85:s=240x80,format=rgba",
        "-vf", "drawbox=x=8:y=8:w=224:h=64:color=0x080B12@0.9:t=fill",
        "-frames:v", "1", str(out),
    ])
    print("wrote", out)


def make_subs() -> None:
    # Subtitle burning needs the `subtitles` filter (libass), which brew's
    # ffmpeg 9 build does not include. The .vtt is still written for future
    # use once an ffmpeg with libass is available.
    out = ROOT / "raw" / "merged.vtt"
    out.write_text(
        "WEBVTT\n\n"
        "00:00:00.500 --> 00:00:03.500\n"
        "houly-pipe demo render — generated assets\n\n"
        "00:00:04.000 --> 00:00:07.500\n"
        "Subtitles burn in once ffmpeg has libass.\n"
    )
    print("wrote", out)


def main() -> int:
    if not subprocess.run(["ffmpeg", "-version"], capture_output=True).returncode == 0:
        print("ffmpeg is not on PATH — install it first (brew install ffmpeg)")
        return 1
    (ROOT / "raw").mkdir(exist_ok=True)
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "out").mkdir(exist_ok=True)
    for name, (color, label) in CLIPS.items():
        make_clip(name, color, label)
    make_lut()
    make_logo()
    make_subs()
    print("demo assets complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
