import React from 'react';

export function TextbookCatalogSection() {
  return (
    <section aria-label="Categorized Korean Textbooks" style={{ maxWidth: '1040px', margin: '2.5rem auto', padding: '1.5rem 1.25rem', borderTop: '1px solid rgba(128,128,128,0.22)' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Categorized Korean Textbooks &amp; Original Study Guides (분류별 한국어 독립 교재 라이브러리)
      </h2>
      <p style={{ marginBottom: '1.5rem', opacity: 0.88 }}>
        Each textbook below is published at its own dedicated URL for structured study, classroom reference, and step-by-step Korean typing mastery.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        <div style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h3 style={{ fontSize: '1.08rem', marginBottom: '0.35rem' }}>{"1. Hangul Phonology & Keyboard Mechanics"}</h3>
          <p style={{ fontSize: '0.88rem', opacity: 0.8, marginBottom: '0.85rem' }}>{"제1분류 · 한글 창제 원리·음운 변동·자판 공학 교재"}</p>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/sejong-hangul-creation-principles" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Scientific Principles of Hangul Creation & Articulatory Phonetics (훈민정음 창제 원리와 발음기관 상형 구조 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/korean-sound-change-rules-liaison" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Essential Korean Sound Change Rules: Liaison, Nasalization & Tensification (한국어 필수 음운 변동: 연음·비음화·경음화 실전 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/dubeolsik-vs-sebeolsik-history" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Dubeolsik vs. Sebeolsik Korean Keyboards: Ergonomics, Speed & IME Architecture (두벌식과 세벌식 한글 자판의 구조·역사·타자 역학 비교 교재)"}
              </a>
            </li>
          </ul>
        </div>
        <div style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h3 style={{ fontSize: '1.08rem', marginBottom: '0.35rem' }}>{"2. Real-Life Situational Korean Textbooks"}</h3>
          <p style={{ fontSize: '0.88rem', opacity: 0.8, marginBottom: '0.85rem' }}>{"제2분류 · 실전 여행·비즈니스·일상 교류 회화 교재"}</p>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/travel-korean-essential-dialogues" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Essential Travel Korean Textbook: Airport, Subway, Restaurant & Shopping Dialogues (한국 여행 실전 회화 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/business-korean-email-and-etiquette" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Business Korean & Workplace Etiquette: Honorifics, Titles & Professional Email Templates (비즈니스 한국어 실전 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/making-korean-friends-casual-speech" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Making Korean Friends: Navigating Polite Haeyo-che, Banmal & Natural Daily Expressions (한국인 친구 사귀기 교재)"}
              </a>
            </li>
          </ul>
        </div>
        <div style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h3 style={{ fontSize: '1.08rem', marginBottom: '0.35rem' }}>{"3. Grammar, Particles, Proverbs & Scene Scripts"}</h3>
          <p style={{ fontSize: '0.88rem', opacity: 0.8, marginBottom: '0.85rem' }}>{"제3분류 · 핵심 조사·전통 속담·창작 드라마 대본 교재"}</p>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/korean-particles-eun-neun-i-ga-guide" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Mastering Korean Particles: Complete Textbook on 은/는 vs. 이/가, 을/를, 에/에서 (한국어 핵심 조사 완벽 정리 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/korean-proverbs-and-maxims-guide" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Classic Korean Proverbs, Four-Character Idioms & Timeless Maxims Explained (한국 전통 속담·사자성어·격언 해설 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/original-kdrama-scene-dialogue-workbook" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Original Scene Dialogue Workbook: Mastering Emotional Nuance & Spoken Korean Rhythm (창작 드라마 장면 대사 교재)"}
              </a>
            </li>
          </ul>
        </div>
        <div style={{ padding: '1.15rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h3 style={{ fontSize: '1.08rem', marginBottom: '0.35rem' }}>{"4. Numbers, Conjugation & TOPIK Writing Drills"}</h3>
          <p style={{ fontSize: '0.88rem', opacity: 0.8, marginBottom: '0.85rem' }}>{"제4분류 · 이원 숫자 체계·용언 활용·TOPIK 서술형 교재"}</p>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/korean-number-systems-sino-native" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Mastering Dual Korean Number Systems: Sino-Korean, Native Numbers & Counters (한국어 이원 숫자 체계 및 단위 명사 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/korean-verb-conjugation-tenses" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"Korean Verb & Adjective Conjugation Textbook: Tenses, Irregular Stems & Connectors (한국어 용언 활용과 시제 완성 교재)"}
              </a>
            </li>
            <li style={{ marginBottom: '0.55rem' }}>
              <a href="/learn/topik-beginner-intermediate-typing-drills" style={{ textDecoration: 'underline', fontWeight: 500 }}>
                {"TOPIK I & II Core Vocabulary, Connectors & Long-Form Essay Typing Drills (TOPIK 한국어능력시험 어휘·작문 타자 교재)"}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
