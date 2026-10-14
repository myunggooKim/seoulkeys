import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Essential Korean Sound Change Rules: Liaison, Nasalization & Tensification (한국어 필수 음운 변동: 연음·비음화·경음화 실전 교재) · Seoul Keys",
  description: "Learn why Korean words are spelled morphologically rather than phonetically, and master the 4 core pronunciation rules so dictation and typing become effortless.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/korean-sound-change-rules-liaison",
  },
};

export default function TextbookArticlePage() {
  return (
    <main style={{ maxWidth: '880px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem', lineHeight: 1.75 }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem', fontSize: '0.92rem' }}>
        <a href="/" style={{ textDecoration: 'underline', marginRight: '0.5rem' }}>Home</a>
        <span>›</span>
        <a href="/learn" style={{ textDecoration: 'underline', margin: '0 0.5rem' }}>Learn &amp; Textbooks (교재 목록)</a>
        <span>›</span>
        <span style={{ opacity: 0.85 }}>{"제1분류 · 한글 창제 원리·음운 변동·자판 공학 교재"}</span>
      </nav>

      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(128,128,128,0.25)', paddingBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
            {"1. Hangul Phonology & Keyboard Mechanics · 제1분류 · 한글 창제 원리·음운 변동·자판 공학 교재"}
          </p>
          <h1 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.15rem)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {"Essential Korean Sound Change Rules: Liaison, Nasalization & Tensification (한국어 필수 음운 변동: 연음·비음화·경음화 실전 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Learn why Korean words are spelled morphologically rather than phonetically, and master the 4 core pronunciation rules so dictation and typing become effortless."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"한국어 맞춤법이 소리 나는 대로 적지 않고 어원을 밝혀 적는(형태음소적 표기) 이유를 이해하고, 연음·비음화·유음화·경음화 4대 규칙을 통해 받아쓰기와 타자 정확도를 높입니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Morphophonemic Spelling vs. Spoken Pronunciation (표음주의와 형태주의 맞춤법의 이해)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Beginners often wonder why 한국어 (Korean language) is pronounced [한구거 / han-gu-geo] but typed as 한-국-어, or why 해돋이 (sunrise) is pronounced [해도지 / hae-do-ji]. Modern Korean orthography preserves the root morpheme (국, 돋) so readers instantly grasp meaning, while spoken Korean applies automatic phonological assimilation."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"한국어 타자 연습, 특히 오디오 받아쓰기(Dictation) 단계에서 가장 중요한 능력은 '귀로 들리는 연음·변동 발음'을 '실제 형태소 받침 표기'로 역추적하여 타이핑하는 것입니다. 아래 4가지 핵심 음운 변동 규칙만 익히면 95% 이상의 발음-철자 불일치를 정확히 해결할 수 있습니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. The Four Core Phonological Rules for Typing & Dictation (4대 필수 음운 변동 규칙)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"1) Liaison (연음법칙): When a syllable ending in a batchim is followed by a vowel-initial grammatical particle (marked with initial ㅇ), the batchim consonant slides over to become the onset of the next syllable (e.g., 음악을 becomes [으마글], 꽃이 becomes [꼬치])."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"2) Nasalization (비음화): Plosive finals (ㄱ, ㄷ, ㅂ) assimilate into nasals (ㅇ, ㄴ, ㅁ) before nasal initials ㄴ or ㅁ (e.g., 박물관 becomes [방물관], 감사합니다 becomes [감사함니다]). 3) Liquidization (유음화): ㄴ + ㄹ or ㄹ + ㄴ merges into [ㄹ+ㄹ] (e.g., 신라 becomes [실라], 설날 becomes [설랄]). 4) Tensification (경음화): Lax consonants following plosive batchims become tense (e.g., 학교 becomes [학꾜], 국밥 becomes [국빱])."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Keyboard Strategy: Type the Root Morpheme, Not the Surface Sound (어근 중심 타이핑 전략)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"When practicing dictation or fast sentence typing, train your fingers to recognize common suffixes and particles (-이/-가, -을/-를, -에/-에서, -입니다). Even when your ears hear [함니다], your fingers automatically execute ㅂ(Q)-ㄴ(S)-ㅣ(L)-ㄷ(E)-ㅏ(K) for 합니다."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"소리 나는 대로 [으마글]이나 [감사함니다]로 치는 실수를 방지하려면, 명사 어근(음악, 꽃, 부엌)과 조사(을, 이, 에)의 경계를 의식하며 왼손 받침 키를 먼저 확정하는 습관을 들여야 합니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Rule Name (음운 규칙)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Spelled Form (실제 타이핑 표기)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Spoken Sound (실제 발음)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Phonetic Mechanism (변동 원리)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Key Typing Point (타자 주의점)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Liaison (연음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"음악을 / 꽃이"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[으마글] / [꼬치]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Batchim moves to empty ㅇ onset"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Keep original batchim ㄱ / ㅊ on first block"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Nasalization (비음화)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"박물관 / 국물"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[방물관] / [궁물]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄱ + ㅁ becomes [ㅇ + ㅁ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Type ㄱ(R) batchim, not ㅇ(D)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Nasalization (비음화)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"합니다 / 학년"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[함니다] / [항년]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅂ + ㄴ becomes [ㅁ + ㄴ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Type ㅂ(Q) in -ㅂ니다 endings"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Liquidization (유음화)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"설날 / 연락"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[설랄] / [열락]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄹ + ㄴ or ㄴ + ㄹ becomes [ㄹ + ㄹ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Distinguish ㄴ(S) vs ㄹ(F) by root word"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Palatalization (구개음화)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"같이 / 해돋이"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[가치] / [해도지]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅌ/ㄷ + 이 becomes [치/지]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Retain ㅌ(X) or ㄷ(E) on stem"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Aspiration (격음화)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"좋다 / 입학"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"[조타] / [이팍]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅎ + ㄱ/ㄷ/ㅂ/ㅈ becomes [ㅋ/ㅌ/ㅍ/ㅊ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Type ㅎ(G) batchim or initial explicitly"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"음악을 들으면서 한국어 발음과 맞춤법을 함께 연습합니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"국립박물관에서 아름다운 전통 문화유산을 관람했습니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"설날 아침에 가족들과 같이 따뜻한 떡국을 먹었습니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"입학식을 마치고 새로운 친구들에게 먼저 연락을 했습니다."}</li>
          </ol>
          <div style={{ marginTop: '1.1rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <a href="/" style={{ fontWeight: 600, textDecoration: 'underline' }}>Open Interactive Korean Typing Practice (타자 연습장으로 이동)</a>
            <a href="/learn" style={{ fontWeight: 600, textDecoration: 'underline' }}>Browse All Categorized Textbooks (전체 교재 목록 보기)</a>
          </div>
        </section>
      </article>
    </main>
  );
}
