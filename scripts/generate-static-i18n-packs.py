"""Generate checked-in locale packs with a local MIT-licensed M2M100 model.

The source strings never leave this machine. Existing hand-reviewed translations
always win; the local model fills only missing entries.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scratchpad" / "translator-packages"))

import ctranslate2
import sentencepiece as spm
from opencc import OpenCC


SOURCE_PATH = ROOT / "scratchpad" / "i18n-source.json"
LEARNING_SOURCE_PATH = ROOT / "scratchpad" / "learning-i18n-source.json"
MODEL_PATH = ROOT / "scratchpad" / "translation-models" / "m2m100-418m-ct2"
MODEL_RELATIVE_PATH = Path("scratchpad") / "translation-models" / "m2m100-418m-ct2"
CACHE_ROOT = ROOT / "scratchpad" / "i18n-cache"
LEARNING_CACHE_ROOT = ROOT / "scratchpad" / "i18n-cache" / "learn"
OUTPUT_ROOT = ROOT / "public" / "i18n"
LEARNING_OUTPUT_ROOT = ROOT / "public" / "i18n" / "learn"

LANGUAGE_CODES = {
    "ko": "ko",
    "es": "es",
    "pt-BR": "pt",
    "ja": "ja",
    "zh-Hans": "zh",
    "fr": "fr",
    "de": "de",
    "it": "it",
    "pl": "pl",
    "nl": "nl",
    "ru": "ru",
    "tr": "tr",
    "ar": "ar",
    "fa": "fa",
    "ur": "ur",
    "fil": "tl",
    "th": "th",
    "id": "id",
    "ms": "ms",
    "vi": "vi",
    "my": "my",
    "km": "km",
    "lo": "lo",
    "hi": "hi",
    "bn": "bn",
    "ta": "ta",
    "ne": "ne",
    "si": "si",
    "kk": "kk",
    "uz": "uz",
    "mn": "mn",
}

PROTECTED_TERMS = (
    "Seoul Keys",
    # The script's own name. Left unprotected, the model rendered "How Hangul
    # Works" as "how the clothes hanger works" in Japanese and "how the hamburger
    # works" in Chinese — it is a rare enough token that the decoder reaches for
    # whatever is nearest.
    "Hangul",
    "Hunminjeongeum",
    "K-POP",
    "K-Drama",
    "Cloudflare",
    "Cloudflare Web Analytics",
    "Microsoft Clarity",
    "Google AdSense",
    "King Sejong",
    "Sejong",
    "Jeong Inji",
    "Choe Malli",
    "Jiphyeonjeon",
    "Haerye",
    "Hangeul Day",
    "Gagyanal",
    "UNESCO",
    "Alt+P",
    "Enter",
    "CPM",
    "TTS",
    "XP",
)
TOKEN_PATTERN = re.compile(r"\{\{[^{}]+\}\}|https?://\S+")
LEARNING_PROTECTED_TERMS = (
    "Dubeolsik", "Unicode", "QWERTY", "AZERTY", "QWERTZ", "2-set",
    "Shift", "Caps Lock", "IME", "macOS",
)
LEARNING_TOKEN_PATTERN = re.compile(
    r"\{\{[^{}]+\}\}|https?://\S+|[가-힣ㄱ-ㅎㅏ-ㅣ]+|"
    r"(?:Shift|Control|Windows)\+[A-Za-z]+|\b[A-Z](?:[–—-][A-Z])+\b|"
    r"\b(?:[A-Za-z]\s*\+\s*)+[A-Za-z]\b"
)
# Three private-use code points form an internal marker. These markers are used
# only to split and reassemble source text in Python; they are never sent to the
# translation decoder, which is free to drop even tokenizer-safe PUA symbols.
PROTECTED_MARKER_OPEN = "\ue000"
PROTECTED_MARKER_CLOSE = "\ue001"
PROTECTED_MARKER_INDEX_BASE = 0xE100
PROTECTED_MARKER_INDEX_MAX = 0xF8FF
SOURCE_REWRITES = {
    "Amenities": "Hotel amenities and services",
    "Check-in": "Hotel arrival registration",
    "Comfort": "A feeling of comfort",
    "CONTACT & PUBLIC-LAUNCH GATE": "CONTACT AND PUBLIC LAUNCH REQUIREMENTS",
    "Home": "Home page",
    "Intro": "Introduction",
    "Performance": "Stage performance",
    "Romance drama": "A romantic drama",
    "Sightseeing": "Visiting tourist attractions",
    "Takeout": "Food to take away",
    "Teacher dashboard": "Control panel for teachers",
    "Correct!": "That is correct!",
    "Privacy by minimization": "Collect as little personal data as possible",
    "Private preview · no ads": "Private beta version · no advertising",
    "check-out": "Hotel departure process",
    "comma": "The comma punctuation mark",
    "snowman": "A snowman made of snow",
    # The Hangul guide uses short editorial headings in English. Feed the
    # translator literal, unambiguous equivalents so words such as "script"
    # are not mistaken for a screenplay and "ending" is understood as a
    # grammatical ending rather than the end of a story.
    "Korean grammar": "Grammar of the Korean language",
    "Hangul is the script; Korean has the grammar": (
        "Hangul is a writing system; Korean is a language with grammar"
    ),
    "The verb waits at the end": "The verb comes at the end of the sentence",
    "Small endings show each role": "Particles show the grammatical role of each word",
    "The ending carries time and tone": "Verb endings express tense and politeness",
    "Known information can disappear": "Information clear from context may be omitted",
    "The safest first speaking style": "A polite speech style for beginners",
    "A script made for people — with its birth recorded": (
        "A writing system created for ordinary people, with historical records of its creation"
    ),
    "The creator named in the record is King Sejong": (
        "Historical documents identify King Sejong as the creator"
    ),
    "Its maker, date, purpose and principles survive together": (
        "Historical records preserve the creator, date, purpose and design principles"
    ),
    "The letters are completed": "The new alphabet is completed",
    "Opposition reaches the throne": "Some officials formally oppose the new alphabet",
    "A Memory of the World": "Registered in the UNESCO Memory of the World",
    "A country that celebrates the birth of its script": (
        "A country that celebrates the creation of its writing system"
    ),
    "Blocks — a letter fills one square": "Syllable blocks: letters fit inside one square",
    "Hangul tells you how Korean sounds are written. Korean grammar tells you how those written words work together. Start with four patterns and you can already see the skeleton of an everyday sentence.": (
        "Hangul explains how to write Korean sounds. Korean grammar explains how words form sentences. These four basic patterns show the structure of everyday Korean sentences."
    ),
    "A common Korean sentence follows subject–object–verb order. The action or state closes the sentence.": (
        "A basic Korean sentence usually follows subject, object, predicate order. The predicate comes at the end of the sentence."
    ),
    "은/는 marks a topic, 이/가 a subject, 을/를 an object, and 에/에서 a place or setting. That is why Korean word order can sometimes move.": (
        "The particle 은/는 marks the topic. 이/가 marks the grammatical subject. 을/를 marks the object. 에/에서 marks a place. Particles allow Korean words to change order without losing their grammatical roles."
    ),
    "Use the polite -요 style first: 안녕하세요, 감사해요, 먹어요. It works in most everyday situations without sounding either too stiff or too casual. Formal -습니다 and casual speech can come after this foundation.": (
        "Begin with polite speech ending in -요: 안녕하세요, 감사해요, 먹어요. This style is appropriate in most everyday situations. Learn the formal -습니다 style and casual speech later."
    ),
    "The Annals and Jeong Inji’s postface say that Sejong created the twenty-eight letters. Eight Hall of Worthies scholars wrote the Haerye explanations and helped prepare the publication. The surviving record therefore distinguishes the king’s creation from the scholars’ work of explanation and promulgation.": (
        "Historical documents say King Sejong created the twenty-eight letters. Eight Jiphyeonjeon scholars wrote the explanations in the Haerye and helped publish the book. The records distinguish King Sejong's creation of the alphabet from the scholars' explanation and publication work."
    ),
    "Korean speech did not fit Classical Chinese writing, and learning Chinese characters demanded time that most ordinary people did not have. King Sejong created a writing system that people could learn and use for their own words.": (
        "The Korean language was structurally different from Classical Chinese. Learning Chinese characters required long education that many ordinary people could not receive. King Sejong created a writing system that ordinary people could learn and use to write Korean."
    ),
    "South Korea marks 9 October as Hangeul Day, a national holiday honoring the promulgation of Hunminjeongeum and the value of Hangul. The first modern celebration was held in 1926 under the name Gagyanal; the discovery of the Haerye manuscript later provided the basis for today’s date.": (
        "South Korea celebrates Hangeul Day as a national holiday every year on 9 October. It honors the publication of Hunminjeongeum and the value of Hangul. The first modern celebration took place in 1926 and was called Gagyanal. After the Haerye manuscript was discovered, its date record became the basis for the current date."
    ),
}
MANUAL_OVERRIDES = {
    "ko": {"Home": "홈", "comma": "쉼표", "Correct!": "정답!"},
    "es": {"Home": "Inicio", "comma": "coma", "Correct!": "¡Correcto!"},
    "pt-BR": {"Home": "Início", "comma": "vírgula", "Correct!": "Correto!"},
    "ja": {"Home": "ホーム", "comma": "コンマ", "Correct!": "正解！"},
    "zh-Hans": {"Home": "首页", "comma": "逗号", "Correct!": "正确！"},
    "zh-Hant": {"Home": "首頁", "comma": "逗號", "Correct!": "正確！"},
    "fr": {
        "Home": "Accueil", "comma": "virgule", "Correct!": "Correct !",
        "Email": "Courriel", "Hours": "Heures", "Join": "Rejoindre",
        "Pets": "Animaux", "Pronunciation": "Prononciation",
        "Shopping": "Achats", "Wave": "Vague",
    },
    "de": {
        "Home": "Startseite", "comma": "Komma", "Correct!": "Richtig!",
        "Content": "Inhalt", "Details": "Einzelheiten", "Forms": "Formulare",
        "Seoul Station": "Bahnhof Seoul", "Tickets": "Fahrkarten",
        "Training": "Übung", "Transit": "Durchreise",
    },
    "it": {
        "Home": "Pagina iniziale", "comma": "virgola", "Correct!": "Corretto!",
        "Privacy": "Riservatezza", "date": "data", "discount": "sconto",
    },
    "pl": {
        "Home": "Strona główna", "comma": "przecinek", "Correct!": "Dobrze!",
        "Customs": "Odprawa celna", "PUZZLE": "ŁAMIGŁÓWKA",
        "Pets": "Zwierzęta", "Spacing": "Odstępy", "transfer": "przesiadka",
    },
    "nl": {
        "Home": "Startpagina", "comma": "komma", "Correct!": "Juist!",
        "Content": "Inhoud", "Forms": "Formulieren",
        "Late-night transit": "Nachtelijk vervoer", "Spacing": "Spatiëring",
        "Recruiting": "Werving", "consonant": "medeklinker",
        "deadline": "uiterste datum", "metric": "metriek",
    },
    "ru": {"Home": "Главная", "comma": "запятая", "Correct!": "Правильно!"},
    "tr": {
        "Home": "Ana sayfa", "comma": "virgül", "Correct!": "Doğru!",
        "transfer": "aktarma",
    },
    "ar": {"Home": "الرئيسية", "comma": "فاصلة", "Correct!": "صحيح!", "PUZZLE": "لغز"},
    "fa": {"Home": "خانه", "comma": "ویرگول", "Correct!": "درست است!"},
    "ur": {"Home": "صفحۂ اول", "comma": "کوما", "Correct!": "درست!"},
    "fil": {
        "Home": "Tahanan", "comma": "kuwit", "Correct!": "Tama!",
        "I made a reservation — please check it.": "Nagpareserba ako — pakisuri po.",
        "I'm studying Korean, please teach me more!": "Nag-aaral ako ng Korean, turuan mo pa ako!",
    },
    "th": {"Home": "หน้าหลัก", "comma": "เครื่องหมายจุลภาค", "Correct!": "ถูกต้อง!"},
    "id": {
        "Home": "Beranda", "comma": "koma", "Correct!": "Benar!",
        "Email": "Surel", "Subway": "kereta bawah tanah", "Target": "Sasaran",
    },
    "ms": {
        "Home": "Laman utama", "comma": "koma", "Correct!": "Betul!",
        "Subway": "kereta api bawah tanah",
    },
    "vi": {
        "Home": "Trang chủ", "comma": "dấu phẩy", "Correct!": "Chính xác!",
        "Content": "Nội dung", "Email": "Thư điện tử", "Logistics": "Hậu cần",
        "Menu": "Thực đơn", "Shield hit!": "Khiên bị trúng!",
        "check-in": "nhận phòng", "picnic": "dã ngoại",
    },
    "my": {"Home": "ပင်မစာမျက်နှာ", "comma": "ကော်မာ", "Correct!": "မှန်ပါတယ်!"},
    "km": {"Home": "ទំព័រដើម", "comma": "សញ្ញាក្បៀស", "Correct!": "ត្រឹមត្រូវ!"},
    "lo": {
        "Home": "ໜ້າຫຼັກ", "comma": "ຈຸດຈ້ຳ", "Correct!": "ຖືກຕ້ອງ!",
        "PUZZLE": "ເກມປິດສະໜາ",
    },
    "hi": {"Home": "मुखपृष्ठ", "comma": "अल्पविराम", "Correct!": "सही!"},
    "bn": {
        "Home": "হোম", "comma": "কমা", "Correct!": "সঠিক!",
        "pronunciation": "উচ্চারণ",
    },
    "ta": {
        "Home": "முகப்பு", "comma": "காற்புள்ளி", "Correct!": "சரி!",
        "Advertising": "விளம்பரம்", "Introduction": "அறிமுகம்", "PUZZLE": "புதிர்",
        "Reactions": "எதிர்வினைகள்", "Tickets": "பயணச்சீட்டுகள்",
        "appointment": "சந்திப்பு", "interpretation": "விளக்கம்", "picnic": "சுற்றுலா",
    },
    "ne": {"Home": "गृहपृष्ठ", "comma": "अल्पविराम", "Correct!": "सही!"},
    "si": {
        "Home": "මුල් පිටුව", "comma": "කොමාව", "Correct!": "නිවැරදියි!",
        "Allergy": "අසාත්මිකතාව", "Forms": "පෝරම", "PUZZLE": "ප්‍රහේලිකාව",
        "Privacy, terms, cookies, advertising, copyright, child safety, and operating disclosures for Seoul Keys.": "Seoul Keys සඳහා පෞද්ගලිකත්වය, භාවිත නියම, කුකී, වෙළඳ දැන්වීම්, ප්‍රකාශන හිමිකම්, ළමා ආරක්ෂාව සහ මෙහෙයුම් හෙළිදරව් කිරීම්.",
        "Reactions": "ප්‍රතිචාර", "pronunciation": "උච්චාරණය",
    },
    "kk": {"Home": "Басты бет", "comma": "үтір", "Correct!": "Дұрыс!"},
    "uz": {
        "Home": "Bosh sahifa", "comma": "vergul", "Correct!": "To‘g‘ri!",
        "Email": "Elektron pochta", "Hotel": "Mehmonxona",
        "Legal & Safety Center": "Huquq va xavfsizlik markazi",
        "Legal & Safety Center — Seoul Keys": "Huquq va xavfsizlik markazi — Seoul Keys",
        "Menu": "Menyu", "Microsoft Privacy Statement": "Microsoft maxfiylik bayonoti",
        "Safety": "Xavfsizlik", "Seoul Station": "Seul vokzali",
        "Subway": "Metro", "Taxi": "Taksi", "Transit": "Tranzit",
    },
    "mn": {"Home": "Нүүр", "comma": "таслал", "Correct!": "Зөв!"},
}


def protected_marker(index: int) -> str:
    codepoint = PROTECTED_MARKER_INDEX_BASE + index
    if index < 0 or codepoint > PROTECTED_MARKER_INDEX_MAX:
        raise ValueError(f"Too many protected values for one source string: {index + 1}")
    return f"{PROTECTED_MARKER_OPEN}{chr(codepoint)}{PROTECTED_MARKER_CLOSE}"


def protect_text(text: str, learning_content: bool = False) -> tuple[str, dict[str, str]]:
    replacements: dict[str, str] = {}
    protected = text
    pattern = LEARNING_TOKEN_PATTERN if learning_content else TOKEN_PATTERN
    protected_terms = (
        (*PROTECTED_TERMS, *LEARNING_PROTECTED_TERMS)
        if learning_content
        else PROTECTED_TERMS
    )
    values = [*pattern.findall(text)]
    values.extend(term for term in protected_terms if term in text)
    # Replace longer values first. For example, the short token `요` occurs
    # inside `안녕하세요`; replacing it first would leave the Korean stem
    # exposed to translation and produce hybrids such as `Hola요`.
    unique_values = sorted(dict.fromkeys(values), key=len, reverse=True)
    for index, value in enumerate(unique_values):
        marker = protected_marker(index)
        protected = protected.replace(value, marker)
        replacements[marker] = value
    return protected, replacements


def required_protected_values(text: str, learning_content: bool = False) -> tuple[str, ...]:
    """Return source fragments that a cached translation must preserve exactly."""
    pattern = LEARNING_TOKEN_PATTERN if learning_content else TOKEN_PATTERN
    protected_terms = (
        (*PROTECTED_TERMS, *LEARNING_PROTECTED_TERMS)
        if learning_content
        else PROTECTED_TERMS
    )
    values = [*pattern.findall(text)]
    values.extend(term for term in protected_terms if term in text)
    return tuple(sorted(dict.fromkeys(values), key=len, reverse=True))


def restore_text(text: str, replacements: dict[str, str]) -> str:
    restored = text
    for marker, value in replacements.items():
        restored = re.sub(
            r"[\s,._-]*".join(re.escape(character) for character in marker),
            lambda _match: value,
            restored,
        )
    return restored.strip()


def invalid_translation_reasons(
    source: str,
    translated: str,
    learning_content: bool = False,
) -> tuple[str, ...]:
    reasons: list[str] = []
    missing_values = tuple(
        value
        for value in required_protected_values(source, learning_content)
        if value not in translated
    )
    if missing_values:
        reasons.append(f"missing protected values: {missing_values!r}")
    if any(
        character in translated
        for character in (PROTECTED_MARKER_OPEN, PROTECTED_MARKER_CLOSE)
    ) or any(
        PROTECTED_MARKER_INDEX_BASE <= ord(character) <= PROTECTED_MARKER_INDEX_MAX
        for character in translated
    ):
        reasons.append("unrestored PUA marker")
    if re.search(r"(?:ZXQ|QXZ|8675309)", translated, flags=re.IGNORECASE):
        reasons.append("legacy marker fragment")
    return tuple(reasons)


def translation_source_for(source: str, learning_content: bool = False) -> str:
    rewritten = SOURCE_REWRITES.get(source, source)
    # A clarification rewrite must never erase an author name, Hangul example,
    # key sequence, or other literal that the published source promises to show.
    if any(
        value not in rewritten
        for value in required_protected_values(source, learning_content)
    ):
        return source
    return rewritten


def protected_only(text: str, learning_content: bool = False) -> bool:
    remainder = text
    protected_terms = (
        (*PROTECTED_TERMS, *LEARNING_PROTECTED_TERMS)
        if learning_content
        else PROTECTED_TERMS
    )
    for term in sorted(protected_terms, key=len, reverse=True):
        remainder = remainder.replace(term, "")
    return not re.sub(r"[\s+&·/|,;:()\-]+", "", remainder)


SEGMENT_BOUNDARY_CHARACTERS = frozenset(
    " \t\r\n,.;:!?()[]{}\"“”‘’'+&/|—–-"
)
CLAUSE_DELIMITER_PATTERN = re.compile(r"([.!?;:,]+(?:\s+|$))")


def segment_translation_plan(
    text: str,
    learning_content: bool = False,
) -> tuple[list[str], dict[str, str], list[tuple[int, str, str, str]]]:
    """Split protected text into model-safe prose jobs and exact delimiters."""
    protected, replacements = protect_text(text, learning_content)
    if replacements:
        marker_expression = "(" + "|".join(
            re.escape(marker) for marker in replacements
        ) + ")"
        parts = re.split(marker_expression, protected)
        # The model also occasionally removes the blank after a full stop or
        # comma. In protected sentences, keep clause delimiters in Python so
        # punctuation and following spacing remain byte-for-byte stable around
        # independently translated prose chunks.
        expanded_parts: list[str] = []
        for part in parts:
            if part in replacements:
                expanded_parts.append(part)
            else:
                expanded_parts.extend(
                    piece
                    for piece in CLAUSE_DELIMITER_PATTERN.split(part)
                    if piece
                )
        parts = expanded_parts
    else:
        # Ordinary prose should retain full-sentence context and the original
        # one-input-per-source performance profile.
        parts = [protected]

    jobs: list[tuple[int, str, str, str]] = []
    for part_index, part in enumerate(parts):
        if part in replacements or not part:
            continue
        # Preserve English possessive spelling when a protected proper name is
        # followed by 's/’s. Translating the orphaned `s` can fuse the next word
        # directly onto the name (for example `Jeong InjiEl`).
        start = 3 if part.startswith(("'s ", "’s ")) else 0
        while start < len(part) and part[start] in SEGMENT_BOUNDARY_CHARACTERS:
            start += 1
        end = len(part)
        while end > start and part[end - 1] in SEGMENT_BOUNDARY_CHARACTERS:
            end -= 1
        core = part[start:end]
        if not re.search(r"[A-Za-z]", core):
            continue
        jobs.append((part_index, part[:start], core, part[end:]))
    return parts, replacements, jobs


def apply_segment_translations(
    parts: list[str],
    replacements: dict[str, str],
    jobs: list[tuple[int, str, str, str]],
    translations: list[str],
) -> str:
    if len(jobs) != len(translations):
        raise ValueError(
            f"Segment translation count mismatch: {len(jobs)} jobs, "
            f"{len(translations)} translations"
        )
    assembled = list(parts)
    for (part_index, prefix, source_core, suffix), translated in zip(
        jobs, translations
    ):
        # Clause punctuation and whitespace are retained in `parts`. Discard
        # punctuation the decoder invents at a translated fragment's edges so
        # it cannot produce duplicates such as `..` when the exact source full
        # stop is reinserted immediately afterwards.
        translated_core = translated.strip().strip(
            "".join(SEGMENT_BOUNDARY_CHARACTERS)
        )
        assembled[part_index] = prefix + (translated_core or source_core) + suffix
    return restore_text("".join(assembled), replacements)


def translate_model_batch(
    texts: list[str],
    language_code: str,
    translator: ctranslate2.Translator,
    tokenizer: spm.SentencePieceProcessor,
) -> list[str]:
    if not texts:
        return []
    source_tokens = [
        ["__en__", *tokenizer.encode(text, out_type=str), "</s>"]
        for text in texts
    ]
    longest_source = max(len(tokens) - 2 for tokens in source_tokens)
    # A fixed 512-token decoder ceiling lets a degenerate translation of a very
    # short fragment repeat for minutes. Three times the longest source length
    # is generous for these target languages while retaining the historical cap
    # for genuinely long prose.
    decoding_limit = min(512, max(32, longest_source * 3 + 16))
    results = translator.translate_batch(
        source_tokens,
        target_prefix=[[f"__{language_code}__"]] * len(source_tokens),
        # Let CTranslate2 sort by sequence length and form token-budgeted
        # micro-batches instead of padding every sentence to the longest one.
        max_batch_size=2048,
        batch_type="tokens",
        beam_size=1,
        max_decoding_length=decoding_limit,
        repetition_penalty=1.08,
        disable_unk=True,
    )
    return [
        tokenizer.decode(
            [
                token
                for token in result.hypotheses[0]
                if token not in {"</s>", "<pad>", f"__{language_code}__"}
            ]
        )
        for result in results
    ]


def translate_segmented_batch(
    sources: list[str],
    language_code: str,
    translator: ctranslate2.Translator,
    tokenizer: spm.SentencePieceProcessor,
    learning_content: bool = False,
) -> list[str]:
    documents: list[
        tuple[list[str], dict[str, str], list[tuple[int, str, str, str]]]
    ] = []
    model_inputs: list[str] = []
    job_ranges: list[tuple[int, int]] = []

    for source in sources:
        translation_source = translation_source_for(source, learning_content)
        plan = segment_translation_plan(translation_source, learning_content)
        start = len(model_inputs)
        model_inputs.extend(core for _index, _prefix, core, _suffix in plan[2])
        job_ranges.append((start, len(model_inputs)))
        documents.append(plan)

    translated_segments = translate_model_batch(
        model_inputs,
        language_code,
        translator,
        tokenizer,
    )
    return [
        apply_segment_translations(
            parts,
            replacements,
            jobs,
            translated_segments[start:end],
        )
        for (parts, replacements, jobs), (start, end) in zip(documents, job_ranges)
    ]


def save_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(f"{path.suffix}.tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary, path)


def translate_locale(
    locale: str,
    language_code: str,
    keys: list[str],
    reviewed: dict[str, str],
    translator: ctranslate2.Translator,
    tokenizer: spm.SentencePieceProcessor,
    batch_size: int,
    refresh_rewrites: bool,
    cache_root: Path = CACHE_ROOT,
    cache_seed: dict[str, str] | None = None,
    learning_content: bool = False,
) -> dict[str, str]:
    cache_path = cache_root / f"{locale}.json"
    cached: dict[str, str] = {}
    if cache_path.exists():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
    if cache_seed:
        # A newer locale-level cache wins over migrated per-bundle values.
        cached = {**cache_seed, **cached}

    completed = {**cached, **reviewed}
    cache_was_pruned = False
    for key, value in list(completed.items()):
        # Human-reviewed values are authoritative, even when a translator chose
        # to explain a protected source token differently in the target text.
        if key in reviewed:
            continue
        if invalid_translation_reasons(key, value, learning_content):
            completed.pop(key, None)
            cache_was_pruned = True
            continue
    for key in keys:
        if protected_only(key, learning_content):
            completed[key] = key
    if refresh_rewrites:
        for key in SOURCE_REWRITES:
            if locale != "ko" or key not in reviewed:
                if key in completed:
                    completed.pop(key)
                    cache_was_pruned = True
    completed.update(MANUAL_OVERRIDES.get(locale, {}))
    if cache_was_pruned:
        # Persist only the cleaned cache before inference. If marker restoration
        # later fails, a subsequent run must not resurrect an older bad value.
        save_json(cache_path, completed)
    # Keep similarly sized sentences in the same inference batch. Alphabetical
    # source order mixes one-word labels with long guide paragraphs, forcing
    # the shorter inputs to pay the padding cost of the longest sequence.
    missing = sorted(
        (key for key in keys if key not in completed),
        key=lambda key: (len(key), key),
    )
    if not missing:
        return {key: completed[key] for key in keys}

    print(f"{locale}: translating {len(missing)} missing strings", flush=True)
    for start in range(0, len(missing), batch_size):
        batch = missing[start : start + batch_size]
        candidates = translate_segmented_batch(
            batch,
            language_code,
            translator,
            tokenizer,
            learning_content,
        )

        validated_batch: dict[str, str] = {}
        failures: list[tuple[str, tuple[str, ...]]] = []
        for source, translated in zip(batch, candidates):
            candidate = translated or source
            reasons = invalid_translation_reasons(source, candidate, learning_content)
            if reasons:
                failures.append((source, reasons))
                continue
            validated_batch[source] = candidate

        completed.update(validated_batch)
        if failures:
            # Good translations from the same inference batch may be retained,
            # but malformed results are never written to cache or route packs.
            save_json(cache_path, completed)
            details = "; ".join(
                f"{source!r}: {', '.join(reasons)}" for source, reasons in failures
            )
            raise RuntimeError(
                f"{locale}: protected content validation failed; refusing to cache/output: "
                f"{details}"
            )

        save_json(cache_path, completed)
        done = min(start + batch_size, len(missing))
        print(f"  {locale}: {done}/{len(missing)}", flush=True)

    return {key: completed[key] for key in keys}


def generate_locale_set(
    *,
    keys: list[str],
    existing: dict[str, dict[str, str]],
    requested: list[str],
    translator: ctranslate2.Translator,
    tokenizer: spm.SentencePieceProcessor,
    batch_size: int,
    refresh_rewrites: bool,
    cache_root: Path,
    include_all_manual_overrides: bool = False,
    output_root: Path | None = None,
    cache_seed_by_locale: dict[str, dict[str, str]] | None = None,
    learning_content: bool = False,
) -> dict[str, dict[str, str]]:
    generated: dict[str, dict[str, str]] = {}
    base_requested = [locale for locale in requested if locale != "zh-Hant"]
    if "zh-Hant" in requested and "zh-Hans" not in base_requested:
        base_requested.append("zh-Hans")

    for locale in base_requested:
        generated[locale] = translate_locale(
            locale,
            LANGUAGE_CODES[locale],
            keys,
            existing.get(locale, {}),
            translator,
            tokenizer,
            batch_size,
            refresh_rewrites,
            cache_root,
            (cache_seed_by_locale or {}).get(locale),
            learning_content,
        )
        if output_root is not None:
            save_json(output_root / f"{locale}.json", generated[locale])

    if "zh-Hant" in requested:
        converter = OpenCC("s2twp")
        simplified = generated["zh-Hans"]
        traditional = {
            key: existing.get("zh-Hant", {}).get(key, converter.convert(simplified[key]))
            for key in keys
        }
        traditional.update(
            MANUAL_OVERRIDES["zh-Hant"]
            if include_all_manual_overrides
            else {
                key: value
                for key, value in MANUAL_OVERRIDES["zh-Hant"].items()
                if key in traditional
            }
        )
        save_json(cache_root / "zh-Hant.json", traditional)
        generated["zh-Hant"] = traditional
        if output_root is not None:
            save_json(output_root / "zh-Hant.json", traditional)

    return generated


def generate_bundle(
    *,
    keys: list[str],
    existing: dict[str, dict[str, str]],
    requested: list[str],
    translator: ctranslate2.Translator,
    tokenizer: spm.SentencePieceProcessor,
    batch_size: int,
    refresh_rewrites: bool,
    cache_root: Path,
    output_root: Path,
    include_all_manual_overrides: bool = False,
) -> None:
    generate_locale_set(
        keys=keys,
        existing=existing,
        requested=requested,
        translator=translator,
        tokenizer=tokenizer,
        batch_size=batch_size,
        refresh_rewrites=refresh_rewrites,
        cache_root=cache_root,
        include_all_manual_overrides=include_all_manual_overrides,
        output_root=output_root,
    )


def merge_learning_bundles(
    source_bundles: dict[str, dict[str, object]],
) -> tuple[
    list[str],
    dict[str, dict[str, str]],
    dict[str, dict[str, str]],
]:
    """Build one translation job while retaining already-created bundle caches.

    Earlier versions cached each guide separately. Treat those values as warm
    input for the new locale-level cache, then let reviewed source translations
    win whenever both exist.
    """
    union_keys = sorted({
        key
        for source_bundle in source_bundles.values()
        for key in source_bundle["keys"]
    })
    all_locales = [*LANGUAGE_CODES, "zh-Hant"]
    existing: dict[str, dict[str, str]] = {locale: {} for locale in all_locales}
    legacy_cache: dict[str, dict[str, str]] = {locale: {} for locale in all_locales}

    for name, source_bundle in source_bundles.items():
        bundle_keys: list[str] = source_bundle["keys"]
        bundle_existing: dict[str, dict[str, str]] = source_bundle["existing"]
        for locale in all_locales:
            legacy_cache_path = LEARNING_CACHE_ROOT / name / f"{locale}.json"
            if legacy_cache_path.exists():
                legacy = json.loads(legacy_cache_path.read_text(encoding="utf-8"))
                legacy_cache[locale].update({
                    key: legacy[key]
                    for key in bundle_keys
                    if key in legacy
                })
            existing[locale].update(bundle_existing.get(locale, {}))

    return union_keys, existing, legacy_cache


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--locale", action="append", dest="locales")
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--threads", type=int, default=1)
    parser.add_argument("--refresh-rewrites", action="store_true")
    parser.add_argument(
        "--scope",
        choices=("application", "learning"),
        default="application",
        help="Generate the existing application pack or route-scoped learning packs.",
    )
    args = parser.parse_args()

    os.chdir(ROOT)
    requested = args.locales or list(LANGUAGE_CODES)

    unknown = [locale for locale in requested if locale not in LANGUAGE_CODES and locale != "zh-Hant"]
    if unknown:
        raise SystemExit(f"Unsupported locales: {', '.join(unknown)}")

    tokenizer = spm.SentencePieceProcessor(
        model_file=str(MODEL_RELATIVE_PATH / "sentencepiece.bpe.model"),
    )
    translator = ctranslate2.Translator(
        str(MODEL_RELATIVE_PATH),
        device="cpu",
        compute_type="int8",
        # Learning packs contain hundreds of independent sentences. Multiple
        # translation workers handle those micro-batches more efficiently than
        # assigning every core to one sentence batch. Keep the long-standing
        # application-pack setting unchanged.
        inter_threads=args.threads if args.scope == "learning" else 1,
        intra_threads=1 if args.scope == "learning" else args.threads,
    )

    source_path = LEARNING_SOURCE_PATH if args.scope == "learning" else SOURCE_PATH
    source = json.loads(source_path.read_text(encoding="utf-8"))
    if args.scope == "learning":
        source_bundles = source["bundles"]
        union_keys, union_existing, legacy_cache = merge_learning_bundles(source_bundles)
        print(
            f"learning: translating {len(union_keys)} unique strings once per locale",
            flush=True,
        )
        generated = generate_locale_set(
            keys=union_keys,
            existing=union_existing,
            requested=requested,
            translator=translator,
            tokenizer=tokenizer,
            batch_size=args.batch_size,
            refresh_rewrites=args.refresh_rewrites,
            cache_root=LEARNING_CACHE_ROOT,
            cache_seed_by_locale=legacy_cache,
            learning_content=True,
        )
        for name, source_bundle in source_bundles.items():
            bundle_keys = source_bundle["keys"]
            for locale, translations in generated.items():
                save_json(
                    LEARNING_OUTPUT_ROOT / name / f"{locale}.json",
                    {key: translations[key] for key in bundle_keys},
                )
        key_count = len(union_keys)
        output_root = LEARNING_OUTPUT_ROOT
    else:
        generate_bundle(
            keys=source["keys"],
            existing=source["existing"],
            requested=requested,
            translator=translator,
            tokenizer=tokenizer,
            batch_size=args.batch_size,
            refresh_rewrites=args.refresh_rewrites,
            cache_root=CACHE_ROOT,
            output_root=OUTPUT_ROOT,
            include_all_manual_overrides=True,
        )
        key_count = len(source["keys"])
        output_root = OUTPUT_ROOT

    print(
        json.dumps(
            {
                "scope": args.scope,
                "keys": key_count,
                "generated": requested,
                "output": str(output_root),
            },
            ensure_ascii=False,
            indent=2,
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
