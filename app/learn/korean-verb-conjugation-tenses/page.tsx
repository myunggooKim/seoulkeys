import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Korean Verb & Adjective Conjugation Textbook: Tenses, Irregular Stems & Connectors (한국어 용언 활용과 시제 완성 교재) · Seoul Keys",
  description: "Master Korean verb/adjective stem conjugation across present, past (-았/었-), future (-(으)ㄹ 것이다), and irregular stems (ㅂ, ㄷ, 르, ㅡ).",
  alternates: {
    canonical: "https://seoulkeys.com/learn/korean-verb-conjugation-tenses",
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
        <span style={{ opacity: 0.85 }}>{"제4분류 · 이원 숫자 체계·용언 활용·TOPIK 서술형 교재"}</span>
      </nav>

      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(128,128,128,0.25)', paddingBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
            {"4. Numbers, Conjugation & TOPIK Writing Drills · 제4분류 · 이원 숫자 체계·용언 활용·TOPIK 서술형 교재"}
          </p>
          <h1 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.15rem)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {"Korean Verb & Adjective Conjugation Textbook: Tenses, Irregular Stems & Connectors (한국어 용언 활용과 시제 완성 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Master Korean verb/adjective stem conjugation across present, past (-았/었-), future (-(으)ㄹ 것이다), and irregular stems (ㅂ, ㄷ, 르, ㅡ)."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"한국어 동사와 형용사의 어간·어미 결합 구조, 모음조화에 따른 '-아/어' 선택, 과거·현재·미래 시제 선어말어미, 그리고 ㅂ·ㄷ·르·ㅅ 불규칙 활용을 체계적으로 정리합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Stem + Ending Architecture & Vowel Harmony (-아/어 선택의 기준)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Every Korean dictionary verb or adjective ends in -다 (먹다, 가다, 예쁘다). Drop -다 to isolate the stem (어간). If the last vowel of the stem is bright ㅏ or ㅗ, attach -아 (가다 becomes 가요, 보다 becomes 봐요). For all other vowels (ㅓ, ㅜ, ㅡ, ㅣ, etc.), attach -어 (먹다 becomes 먹어요, 마시다 becomes 마셔요). Stems ending in 하- become 해- (공부하다 becomes 공부해요)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"용언 어간의 마지막 모음이 양성모음(ㅏ, ㅗ)이면 '-아' 계열 어미를, 그 밖의 모음이면 '-어' 계열 어미를 결합하고, '하다' 동사는 '하여(해)'로 축약한다는 세 가지 규칙이 모든 한국어 시제·연결어미 활용의 출발점입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Present, Past (-았/었-) & Future (-(으)ㄹ 거예요) Tenses (시제 체계 완벽 정리)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Past tense inserts -았/었- between the stem and the polite ending (갔어요, 먹었어요, 공부했어요). Future intention or supposition attaches -(으)ㄹ 거예요 to the stem (갈 거예요, 먹을 거예요)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"과거 시제는 '-았/었/했-'을 결합하고, 미래의 계획이나 추측은 어간 받침 유무에 따라 '-을 거예요(받침 있음)' 또는 '-ㄹ 거예요(받침 없음/ㄹ 받침)'를 붙여 표현합니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Top 4 Irregular Conjugations Every Typist Must Know (필수 4대 불규칙 활용: ㅂ·ㄷ·르·ㅡ)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"When followed by a vowel ending: 1) ㅂ-irregular stems turn ㅂ into 우 (춥다 becomes 추워요, 어렵다 becomes 어려워요; note 돕다 becomes 도와요, 곱다 becomes 고와요). 2) ㄷ-irregular action verbs turn ㄷ into ㄹ (듣다 becomes 들어요, 걷다 becomes 걸어요). 3) 르-irregular stems double ㄹ (모르다 becomes 몰라요, 빠르다 becomes 빨라요). 4) ㅡ-drop stems drop ㅡ (쓰다 becomes 써요, 바쁘다 becomes 바빠요)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"불규칙 활용은 타이핑할 때 앞 음절의 받침이 사라지거나 다른 자음(ㄹ)으로 바뀌므로, 자주 쓰이는 불규칙 어휘를 문장 단위로 반복 타건하여 손가락 기억으로 정착시키는 것이 중요합니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Conjugation Type (활용 유형)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Dictionary Form (기본형)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Present Polite (현재 해요체)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Past Polite (과거 -았/었어요)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Future Polite (미래 -(으)ㄹ 거예요)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Bright Vowel (ㅏ/ㅗ 어간)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"가다 / 보다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"가요 / 봐요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"갔어요 / 봤어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"갈 거예요 / 볼 거예요"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Dark Vowel (기타 모음 어간)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"먹다 / 읽다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"먹어요 / 읽어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"먹었어요 / 읽었어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"먹을 거예요 / 읽을 거예요"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Hada Verb (하다 용언)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"연습하다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"연습해요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"연습했어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"연습할 거예요"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"ㅂ Irregular (ㅂ 불규칙)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"어렵다 / 돕다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"어려워요 / 도와요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"어려웠어요 / 도왔어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"어려울 거예요 / 도울 거예요"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"ㄷ Irregular (ㄷ 불규칙)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"듣다 / 걷다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"들어요 / 걸어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"들었어요 / 걸었어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"들을 거예요 / 걸을 거예요"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"르 Irregular (르 불규칙)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"빠르다 / 고르다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"빨라요 / 골라요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"빨랐어요 / 골랐어요"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"빠를 거예요 / 고를 거예요"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"어제는 날씨가 무척 추웠는데 오늘은 따뜻한 봄바람이 불어서 걷기 좋아요."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"잘 모르는 단어가 나와도 당황하지 않고 문맥을 살피며 천천히 읽어 봅니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"주말에는 한강 공원을 산책하면서 좋아하는 음악을 들을 거예요."}</li>
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
