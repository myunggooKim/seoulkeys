from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = ROOT / "scripts" / "generate-static-i18n-packs.py"
SPEC = importlib.util.spec_from_file_location("generate_static_i18n_packs", GENERATOR_PATH)
if SPEC is None or SPEC.loader is None:  # pragma: no cover - import setup guard
    raise RuntimeError(f"Unable to load {GENERATOR_PATH}")
GENERATOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = GENERATOR
SPEC.loader.exec_module(GENERATOR)


class ProtectedMarkerTests(unittest.TestCase):
    def test_pua_markers_round_trip_with_tokenizer_style_spacing(self) -> None:
        source = (
            "Type Q–K–Q for 밥, keep ㅇ + ㅏ = 아, and use Seoul Keys on QWERTY."
        )
        protected, replacements = GENERATOR.protect_text(source, learning_content=True)

        self.assertNotIn("밥", protected)
        self.assertNotIn("Seoul Keys", protected)
        self.assertEqual(len(replacements), len(set(replacements)))
        self.assertTrue(all(len(marker) == 3 for marker in replacements))

        spaced = protected
        for marker in replacements:
            spaced = spaced.replace(marker, " ".join(marker))

        restored = GENERATOR.restore_text(spaced, replacements)
        self.assertEqual(restored, source)
        self.assertEqual(
            GENERATOR.invalid_translation_reasons(source, restored, True),
            (),
        )

    def test_unrestored_or_missing_marker_fails_closed(self) -> None:
        source = "Type ㅇ + ㅏ to make 아."
        protected, replacements = GENERATOR.protect_text(source, learning_content=True)
        marker = next(iter(replacements))
        broken = protected.replace(marker, "")

        reasons = GENERATOR.invalid_translation_reasons(source, broken, True)
        self.assertTrue(any(reason.startswith("missing protected values") for reason in reasons))

        leaked_reasons = GENERATOR.invalid_translation_reasons(source, protected, True)
        self.assertIn("unrestored PUA marker", leaked_reasons)

    def test_segment_reassembly_preserves_spacing_and_punctuation(self) -> None:
        source = "Before (밥), press Q–K–Q; then ㅇ + ㅏ = 아!"
        parts, replacements, jobs = GENERATOR.segment_translation_plan(
            source,
            learning_content=True,
        )

        translated = GENERATOR.apply_segment_translations(
            parts,
            replacements,
            jobs,
            [f"!{core.upper()}.." for _index, _prefix, core, _suffix in jobs],
        )

        self.assertEqual(
            translated,
            "BEFORE (밥), PRESS Q–K–Q; THEN ㅇ + ㅏ = 아!",
        )
        self.assertNotIn("  ", translated)
        self.assertEqual(
            GENERATOR.invalid_translation_reasons(source, translated, True),
            (),
        )

    def test_rewrite_cannot_drop_a_protected_name(self) -> None:
        source = (
            "The Annals and Jeong Inji’s postface say that Sejong created the "
            "twenty-eight letters. Eight Hall of Worthies scholars wrote the "
            "Haerye explanations and helped prepare the publication. The surviving "
            "record therefore distinguishes the king’s creation from the scholars’ "
            "work of explanation and promulgation."
        )

        self.assertNotIn("Jeong Inji", GENERATOR.SOURCE_REWRITES[source])
        self.assertEqual(GENERATOR.translation_source_for(source, True), source)

    def test_internal_clause_spacing_and_possessive_are_preserved(self) -> None:
        source = "Jeong Inji’s note. Then Sejong spoke; keep 밥, too."
        parts, replacements, jobs = GENERATOR.segment_translation_plan(
            source,
            learning_content=True,
        )

        translated = GENERATOR.apply_segment_translations(
            parts,
            replacements,
            jobs,
            [core.upper() for _index, _prefix, core, _suffix in jobs],
        )

        self.assertEqual(
            translated,
            "Jeong Inji’s NOTE. THEN Sejong SPOKE; KEEP 밥, TOO.",
        )

    def test_unprotected_prose_stays_one_model_input(self) -> None:
        source = "A full sentence stays intact. Its context is not fragmented."
        parts, replacements, jobs = GENERATOR.segment_translation_plan(source, True)

        self.assertEqual(parts, [source])
        self.assertEqual(replacements, {})
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0][2], source[:-1])

    def test_decoder_limit_is_derived_from_source_length(self) -> None:
        generator_source = GENERATOR_PATH.read_text(encoding="utf-8")

        self.assertIn("longest_source * 3 + 16", generator_source)
        self.assertIn("min(512, max(32,", generator_source)
        self.assertIn("max_decoding_length=decoding_limit", generator_source)


if __name__ == "__main__":
    unittest.main()
