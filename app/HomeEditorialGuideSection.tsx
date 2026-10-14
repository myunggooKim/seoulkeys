import React from 'react';

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "name": "Seoul Keys Interactive Korean Hangul & Dubeolsik Touch-Typing Curriculum",
      "description": "A 16-stage structured Korean typing and Hangul literacy course covering Dubeolsik home-row keys, syllable assembly, batchim finals, travel and business dialogues, proverbs, and TOPIK writing.",
      "provider": {
        "@type": "Organization",
        "name": "Seoul Keys",
        "url": "https://seoulkeys.com"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is the Korean Dubeolsik (2-set) keyboard organized?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Korean national standard Dubeolsik layout places all 14 basic consonants on the left hand and all vowels on the right hand, creating a natural alternating left-right typing rhythm."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need physical Korean keyboard stickers or OS IME setup to start?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No external IME setup or physical stickers are required. Seoul Keys includes a built-in Hangul automaton that maps QWERTY, AZERTY, and QWERTZ hardware keys directly into Korean syllable blocks."
          }
        },
        {
          "@type": "Question",
          "name": "How do Hangul syllable blocks and Batchim (final consonants) work when typing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hangul groups letters into syllable blocks consisting of an initial consonant (Choseong), medial vowel (Jungseong), and optional final consonant (Jongseong/Batchim). If a batchim is followed by a vowel, it automatically shifts to become the initial consonant of the next syllable."
          }
        }
      ]
    }
  ]
};

export function HomeEditorialGuideSection() {
  return (
    <section aria-labelledby="editorial-curriculum-heading" style={{ maxWidth: '1040px', margin: '3rem auto', padding: '2rem 1.25rem', lineHeight: 1.75, borderTop: '1px solid rgba(128,128,128,0.22)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_SCHEMA) }} />
      <h2 id="editorial-curriculum-heading" style={{ fontSize: '1.55rem', marginBottom: '0.75rem' }}>
        Complete Guide to Korean Hangul Touch-Typing &amp; Structured Study Textbooks (한글 두벌식 타자 원리 및 단계별 학습 가이드)
      </h2>
      <p style={{ marginBottom: '1.25rem', opacity: 0.92 }}>
        Mastering Korean typing on the standard Dubeolsik (두벌식) keyboard builds simultaneous reading, listening, and spelling fluency. Because every Hangul syllable block is assembled phonetically from left-hand consonants (초성·종성) and right-hand vowels (중성), practicing 10 minutes a day develops automatic muscle memory without relying on romanization.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <article style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.22)' }}>
          <h3 style={{ fontSize: '1.12rem', marginBottom: '0.5rem' }}>1. Left-Right Alternating Ergonomics (좌우 교차 타건 역학)</h3>
          <p style={{ fontSize: '0.95rem', margin: 0 }}>
            All 14 basic Korean consonants sit under your left fingers (ㅂㅈㄷㄱㅅ / ㅁㄴㅇㄹㅎ / ㅋㅌㅊㅍ), while all 19 vowel keys sit under your right fingers (ㅛㅕㅑㅐㅔ / ㅗㅓㅏㅣ / ㅠㅜㅡ). This balanced division prevents single-hand fatigue and enables 300–500+ CPM typing speeds.
          </p>
        </article>
        <article style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.22)' }}>
          <h3 style={{ fontSize: '1.12rem', marginBottom: '0.5rem' }}>2. Morphophonemic Spelling &amp; Liaison (형태주의 맞춤법과 연음)</h3>
          <p style={{ fontSize: '0.95rem', margin: 0 }}>
            Spoken Korean links final batchim consonants into following vowel particles (e.g., 한국어 sounds like [한구거]), yet Korean orthography preserves the root word. Practicing words and sentences alongside audio trains you to type accurate root morphemes effortlessly.
          </p>
        </article>
        <article style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.22)' }}>
          <h3 style={{ fontSize: '1.12rem', marginBottom: '0.5rem' }}>3. Categorized Independent Textbooks (분류별 심화 창작 교재)</h3>
          <p style={{ fontSize: '0.95rem', margin: 0 }}>
            Explore our 21 dedicated study guides and textbooks covering King Sejong&apos;s Hangul phonology, travel and business Korean etiquette, particle nuance (은/는 vs. 이/가), classic proverbs, and TOPIK IBT essay drills in the <a href="/learn" style={{ textDecoration: 'underline', fontWeight: 600 }}>Learn &amp; Textbooks Library</a>.
          </p>
        </article>
      </div>
    </section>
  );
}
