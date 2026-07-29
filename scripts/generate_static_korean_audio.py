"""Generate Hangeul Pop's finite Korean lesson audio with Supertonic 3.

The generated MP3 files are committed as static site assets, so lesson playback
does not call a metered TTS API. Model code is MIT; weights are OpenRAIL-M.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from supertonic import TTS


# The (slug, text) pairs used to live here as a hand-copied list. It fell out of
# step with the app twice over: two sentences had been reworded on screen but
# never re-synthesized, and the list covered 14 of the 52 sentences the app maps,
# so everything past the fifth lesson requested an MP3 that did not exist and
# dropped to the device voice. The list is generated from the app's own arrays
# now — regenerate it with:
#
#     npx tsx scripts/build-korean-audio-manifest.mts
MANIFEST = Path(__file__).resolve().parent / "korean-audio-lines.json"

VOICES = {"female": "F1", "male": "M5"}


def load_lines() -> list[tuple[str, str]]:
    if not MANIFEST.exists():
        raise SystemExit(
            f"{MANIFEST.name} is missing — run: npx tsx scripts/build-korean-audio-manifest.mts"
        )
    return [(slug, text) for slug, text in json.loads(MANIFEST.read_text(encoding="utf-8"))]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("public/audio/ko"))
    parser.add_argument("--ffmpeg", type=Path)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", action="append", default=[])
    parser.add_argument(
        "--prefix",
        action="append",
        default=[],
        help="Generate only manifest slugs beginning with this prefix (repeatable).",
    )
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    lines = load_lines()
    ffmpeg = args.ffmpeg or (Path(found) if (found := shutil.which("ffmpeg")) else None)
    if ffmpeg is None:
        raise SystemExit("ffmpeg was not found; install it or pass --ffmpeg PATH")

    tts = TTS(auto_download=True)
    with tempfile.TemporaryDirectory(prefix="hangeul-pop-tts-") as temp_dir:
        temp = Path(temp_dir)
        for gender, voice_name in VOICES.items():
            style = tts.get_voice_style(voice_name=voice_name)
            for slug, text in lines:
                if args.only and slug not in args.only:
                    continue
                if args.prefix and not any(slug.startswith(f"{prefix}-") for prefix in args.prefix):
                    continue
                destination = output / f"{slug}-{gender}.mp3"
                if not args.force and destination.exists() and destination.stat().st_size > 0:
                    print(f"skip {destination.name}")
                    continue
                wav, _duration = tts.synthesize(
                    text=text,
                    lang="ko",
                    voice_style=style,
                    total_steps=10,
                    speed=0.9,
                )
                wav_path = temp / f"{slug}-{gender}.wav"
                tts.save_audio(wav, wav_path)
                subprocess.run(
                    [
                        str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error",
                        "-i", str(wav_path), "-codec:a", "libmp3lame", "-b:a", "64k",
                        "-ar", "44100", str(destination),
                    ],
                    check=True,
                )
                print(f"wrote {destination.name}")


if __name__ == "__main__":
    main()
