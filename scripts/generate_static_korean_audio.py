"""Generate Hangeul Pop's finite Korean lesson audio with Supertonic 3.

The generated MP3 files are committed as static site assets, so lesson playback
does not call a metered TTS API. Model code is MIT; weights are OpenRAIL-M.
"""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

from supertonic import TTS


LINES = [
    ("lesson-01", "저는 음악을 좋아해요."),
    ("lesson-02", "오늘은 기분이 좋아요."),
    ("lesson-03", "저는 매일 한국어를 연습해요."),
    ("lesson-04", "천천히 말씀해 주세요."),
    ("lesson-05", "친구와 함께 여행하고 싶어요."),
    ("travel-korea-01", "화장실이 어디예요?"),
    ("travel-korea-02", "이 주소로 가 주세요."),
    ("travel-korea-03", "이거 얼마예요?"),
    ("travel-welcome-01", "한국에서 오셨어요?"),
    ("travel-welcome-02", "제가 도와드릴까요?"),
    ("travel-welcome-03", "우리 동네 맛집을 소개해 드릴게요."),
    ("scene-01", "오늘도 잘해냈어. 내일은 더 빛날 거야."),
    ("scene-02", "포기하지 마. 우리의 이야기는 아직 끝나지 않았어."),
    ("scene-03", "인연이라면 어디에 있든 결국 다시 만나게 돼."),
]

VOICES = {"female": "F1", "male": "M5"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("public/audio/ko"))
    parser.add_argument("--ffmpeg", type=Path, required=True)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", action="append", default=[])
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)

    tts = TTS(auto_download=True)
    with tempfile.TemporaryDirectory(prefix="hangeul-pop-tts-") as temp_dir:
        temp = Path(temp_dir)
        for gender, voice_name in VOICES.items():
            style = tts.get_voice_style(voice_name=voice_name)
            for slug, text in LINES:
                if args.only and slug not in args.only:
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
                        str(args.ffmpeg), "-y", "-hide_banner", "-loglevel", "error",
                        "-i", str(wav_path), "-codec:a", "libmp3lame", "-b:a", "64k",
                        "-ar", "44100", str(destination),
                    ],
                    check=True,
                )
                print(f"wrote {destination.name}")


if __name__ == "__main__":
    main()
