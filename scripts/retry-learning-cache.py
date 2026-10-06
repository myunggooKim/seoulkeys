"""Retry audited fallback entries locally; write cache only, never public packs.

Results still require materialize-learning-cache.mts quality checks and semantic
review. Preventing decoder loops does not establish translation correctness.
"""
import argparse
import json
import importlib.util
import os
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("learning_generator", SCRIPT_DIR / "generate-static-i18n-packs.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)

parser = argparse.ArgumentParser()
parser.add_argument("--locale", required=True, choices=generator.LANGUAGE_CODES)
parser.add_argument("--limit", type=int, default=0)
args = parser.parse_args()
root = SCRIPT_DIR.parent
report = json.loads((root / "scratchpad/learning-translation-quality-report.json").read_text(encoding="utf-8"))
source = json.loads(generator.LEARNING_SOURCE_PATH.read_text(encoding="utf-8"))
reviewed = {}
for bundle in source["bundles"].values():
    reviewed.update(bundle["existing"][args.locale])
fallbacks = next(locale["englishFallbacks"] for locale in report["locales"] if locale["locale"] == args.locale)
keys = sorted((entry["source"] for entry in fallbacks if entry["source"] not in reviewed), key=lambda key: (len(key), key))
if args.limit:
    keys = keys[:args.limit]
cache_path = generator.LEARNING_CACHE_ROOT / f"{args.locale}.json"
cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
os.chdir(root)
tokenizer = generator.spm.SentencePieceProcessor(model_file=str(generator.MODEL_RELATIVE_PATH / "sentencepiece.bpe.model"))
backend = generator.ctranslate2.Translator(str(generator.MODEL_RELATIVE_PATH), device="cpu", compute_type="int8", inter_threads=4, intra_threads=1)


class RetryDecoder:
    def translate_batch(self, *inputs, **options):
        options.update(beam_size=2, no_repeat_ngram_size=3, repetition_penalty=1.15)
        return backend.translate_batch(*inputs, **options)


rejected = 0
print(f"{args.locale}: local retry of {len(keys)} audited fallback entries", flush=True)
for start in range(0, len(keys), 64):
    batch = keys[start:start + 64]
    values = generator.translate_segmented_batch(batch, generator.LANGUAGE_CODES[args.locale], RetryDecoder(), tokenizer, learning_content=True)
    for key, value in zip(batch, values):
        if not value or generator.invalid_translation_reasons(key, value, True):
            rejected += 1
            continue
        cache[key] = value
    generator.save_json(cache_path, cache)
    print(f"{args.locale}: {min(start + len(batch), len(keys))}/{len(keys)}, protected-value rejects: {rejected}", flush=True)
print("Cache only: validate before materializing; semantic review still pending.", flush=True)
