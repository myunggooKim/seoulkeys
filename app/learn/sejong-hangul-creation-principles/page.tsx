import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Scientific Principles of Hangul Creation & Articulatory Phonetics (훈민정음 창제 원리와 발음기관 상형 구조 교재) · Seoul Keys",
  description: "Explore how King Sejong designed Hangul consonants after vocal-tract anatomy and vowels around Cheon-Ji-In vowel harmony, and how this logical structure accelerates touch-typing.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/sejong-hangul-creation-principles",
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
            {"Scientific Principles of Hangul Creation & Articulatory Phonetics (훈민정음 창제 원리와 발음기관 상형 구조 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Explore how King Sejong designed Hangul consonants after vocal-tract anatomy and vowels around Cheon-Ji-In vowel harmony, and how this logical structure accelerates touch-typing."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"세종대왕의 훈민정음 제자 원리(상형·가획·합용)와 천지인 모음 조화 체계를 이해하고, 자모 결합 규칙이 두벌식 타자 리듬으로 이어지는 원리를 학습합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Articulatory Iconicity: Consonants Modeled After Speech Organs (발음기관 상형과 가획의 원리)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Unlike scripts that evolved pictographically over millennia, Hangul (promulgated in 1446 in the Hunminjeongeum Haeryebon) was engineered from articulatory phonetics. Five basic consonant shapes directly mirror the physical configuration of the human vocal tract when pronouncing each sound class."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"아음(어금니소리 ㄱ), 설음(혓소리 ㄴ), 순음(입술소리 ㅁ), 치음(잇소리 ㅅ), 후음(목구멍소리 ㅇ)의 다섯 기본 자음은 발음할 때 혀·입술·목구멍의 모양을 그대로 본떠 만들었습니다. 여기에 소리의 세기(예사소리 → 거센소리 → 된소리)에 따라 획을 더하는 '가획(加劃)' 원리가 적용되어 학습자가 글자 모양만 보고도 조음 위치와 발음 세기를 동시에 추론할 수 있습니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Three-Tier Consonant Progression & Left-Hand Keyboard Mapping (가획 체계와 왼손 자판 배열의 상관관계)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"On the standard Korean Dubeolsik (2-set) keyboard, this phonological grouping translates directly into finger ergonomics: basic lax consonants occupy the home and top rows (ㅂ, ㅈ, ㄷ, ㄱ, ㅅ / ㅁ, ㄴ, ㅇ, ㄹ, ㅎ), while aspirated counterparts (ㅋ, ㅌ, ㅊ, ㅍ) sit cleanly on the bottom row (Z, X, C, V)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"두벌식 자판은 훈민정음의 가획 체계를 인체공학적으로 반영하고 있습니다. 사용 빈도가 가장 높은 기본 자음(ㅁ, ㄴ, ㅇ, ㄹ, ㅎ)은 왼손 기본자리(A, S, D, F, G)에, 예사소리(ㅂ, ㅈ, ㄷ, ㄱ, ㅅ)는 윗글쇠(Q, W, E, R, T)에, 거센소리(ㅋ, ㅌ, ㅊ, ㅍ)는 아랫글쇠(Z, X, C, V)에 배치되어 조음 계열별로 손가락 이동 경로가 자연스럽게 일치합니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Cheon-Ji-In Vowel Construction & Sequential Compound Typing (천지인 삼재 원리와 복합모음 연타 규칙)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"All Hangul vowels are built from three philosophical and phonetic primitives: the rounded sky dot (ㆍ, now a short stroke), the flat earth line (ㅡ), and the upright human line (ㅣ). Bright vowels (ㅏ, ㅗ) pair together in compound vowels (ㅘ, ㅚ, ㅙ), while dark vowels (ㅓ, ㅜ) pair together (ㅝ, ㅟ, ㅞ) under Korean vowel harmony (모음조화)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"이러한 모음조화 법칙 덕분에 한국어 타자에서 복합모음을 입력할 때 '양성모음은 양성모음끼리(ㅗ+ㅏ=ㅘ, ㅗ+ㅐ=ㅙ)', '음성모음은 음성모음끼리(ㅜ+ㅓ=ㅝ, ㅜ+ㅔ=ㅞ)' 결합한다는 규칙만 기억하면 오타율을 절반 이하로 줄일 수 있습니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Sound Class (조음 위치)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Basic Shape (기본자)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Add-Stroke / Aspirated (가획·거센소리)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Tensed (병서·된소리)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Dubeolsik Keys (두벌식 영문 키)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Velar (어금니소리·아음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄱ [g/k]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅋ [kʰ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄲ [k͈]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"R / Z / Shift+R"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Coronal/Alveolar (혓소리·설음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄴ [n]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄷ [d/t], ㅌ [tʰ], ㄹ [r/l]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㄸ [t͈]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"S / E / X / F / Shift+E"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Bilabial (입술소리·순음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅁ [m]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅂ [b/p], ㅍ [pʰ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅃ [p͈]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"A / Q / V / Shift+Q"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Sibilant/Dental (잇소리·치음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅅ [s]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅈ [j], ㅊ [tɕʰ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅆ [s͈], ㅉ [t͈ɕ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"T / W / C / Shift+T / Shift+W"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Glottal (목구멍소리·후음)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅇ [∅/ŋ]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"ㅎ [h]"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"—"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"D / G"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"가나다라마바사 아자차카타파하 — 기본 14자음과 ㅏ 모음의 교차 타자 리듬 훈련"}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"고노도로모보소 오조초코토포호 — 수평 모음(ㅗ) 결합 시 오른손 검지(H) 연타 훈련"}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"구누두루무부수 우주추쿠투푸후 — 하향 모음(ㅜ) 결합 시 오른손 검지(N) 이동 훈련"}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"훈민정음은 발음기관의 모양을 본떠 만든 과학적인 문자입니다. — 실전 문장 정확도 훈련"}</li>
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
