import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Classic Korean Proverbs, Four-Character Idioms & Timeless Maxims Explained (한국 전통 속담·사자성어·격언 해설 교재) · Seoul Keys",
  description: "Build advanced Korean reading comprehension and sentence-typing fluency through 20 essential Korean proverbs (속담) and idioms with cultural commentary.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/korean-proverbs-and-maxims-guide",
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
        <span style={{ opacity: 0.85 }}>{"제3분류 · 핵심 조사·전통 속담·창작 드라마 대본 교재"}</span>
      </nav>

      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(128,128,128,0.25)', paddingBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
            {"3. Grammar, Particles, Proverbs & Scene Scripts · 제3분류 · 핵심 조사·전통 속담·창작 드라마 대본 교재"}
          </p>
          <h1 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.15rem)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {"Classic Korean Proverbs, Four-Character Idioms & Timeless Maxims Explained (한국 전통 속담·사자성어·격언 해설 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Build advanced Korean reading comprehension and sentence-typing fluency through 20 essential Korean proverbs (속담) and idioms with cultural commentary."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"한국인의 삶과 지혜가 담긴 필수 속담과 사자성어, 현대 격언의 유래와 속뜻을 깊이 있게 이해하고, 리듬감 있는 문장 타이핑으로 고급 어휘력을 완성합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Why Korean Proverbs (속담) Are Essential for Intermediate Fluency"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Korean proverbs condense centuries of agrarian, communal, and philosophical wisdom into vivid metaphors. Native speakers use them daily in news commentary, workplace conversations, and essays to express complex cause-and-effect truths in a single phrase."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"속담은 짧은 문장 안에 대조법, 대구법, 비유법이 압축되어 있어 한글 타자의 문장 리듬감과 어휘력을 동시에 기르기에 가장 이상적인 교재입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Proverbs of Speech, Effort & Perseverance (말의 품격과 꾸준한 노력을 다룬 속담)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"'가는 말이 고와야 오는 말이 곱다' (Outgoing words must be kind for incoming words to be kind) and '천 리 길도 한 걸음부터' (Even a thousand-ri journey begins with a single step) teach the twin pillars of Korean ethics: mutual courtesy and steady daily effort."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"'티끌 모아 태산(Dust gathered makes a great mountain)'이나 '시작이 반이다(Well begun is half done)'처럼 매일 조금씩 쌓아 올리는 성실함의 가치를 강조하는 속담들은 타자 연습의 학습 철학과도 깊이 맞닿아 있습니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Practical Maxims for Daily Typing Rhythm (일상 필사와 타자 리듬을 위한 명언)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Typing balanced, parallel clauses—such as 낮말은 새가 듣고 밤말은 쥐가 듣는다—trains your eyes to read ahead by two words while your hands finish the current syllable block."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"대구 구조로 이루어진 속담을 소리 내어 읽으며 타이핑하면 시선 처리가 빨라지고 조사와 어미에서 발생하는 오타가 자연스럽게 줄어듭니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Korean Proverb (한국어 속담)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Literal Translation (직역)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Idiomatic Meaning & Cultural Note (속뜻 및 영어 대응 표현)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"가는 말이 고와야 오는 말이 곱다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Outgoing words must be pretty for incoming words to be pretty."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Treat others with respect if you wish to be respected."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"천 리 길도 한 걸음부터"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Even a 1,000-ri journey starts from a single step."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Every great achievement begins with small, consistent action."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"시작이 반이다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"The beginning is half of the whole."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Well begun is half done; overcoming inertia is key."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"원숭이도 나무에서 떨어질 때가 있다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Even monkeys sometimes fall from trees."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Even experts make mistakes; stay humble and careful."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"티끌 모아 태산"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Gather specks of dust to form a great mountain."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Many a little makes a mickle; steady daily practice adds up."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"고생 끝에 낙이 온다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"At the end of hardship comes joy (고진감래)."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"No pain, no gain; perseverance brings sweet rewards."}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"가는 말이 고와야 오는 말이 곱다는 속담처럼 늘 따뜻한 말을 건네세요."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"천 리 길도 한 걸음부터 시작되니 오늘 열 분 타자 연습을 꾸준히 이어갑시다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"티끌 모아 태산이라는 말을 기억하며 매일 새로운 한국어 단어를 익힙니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"고생 끝에 낙이 온다는 믿음으로 포기하지 않고 끝까지 목표를 달성했습니다."}</li>
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
