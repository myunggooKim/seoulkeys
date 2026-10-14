import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mastering Korean Particles: Complete Textbook on 은/는 vs. 이/가, 을/를, 에/에서 (한국어 핵심 조사 완벽 정리 교재) · Seoul Keys",
  description: "Clear up the #1 grammar confusion in Korean: topic markers (은/는) vs. subject markers (이/가), object markers (을/를), and location markers (에 vs. 에서).",
  alternates: {
    canonical: "https://seoulkeys.com/learn/korean-particles-eun-neun-i-ga-guide",
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
            {"Mastering Korean Particles: Complete Textbook on 은/는 vs. 이/가, 을/를, 에/에서 (한국어 핵심 조사 완벽 정리 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Clear up the #1 grammar confusion in Korean: topic markers (은/는) vs. subject markers (이/가), object markers (을/를), and location markers (에 vs. 에서)."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"외국인 한국어 학습자가 가장 어려워하는 주제 보조사(은/는)와 주격 조사(이/가)의 미묘한 뉘앙스 차이, 받침 유무에 따른 이형태 선택 규칙, 그리고 장소 조사(에 vs 에서)를 명쾌하게 정리합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Allomorph Selection by Batchim: Vowel-Final vs. Consonant-Final (받침 유무에 따른 조사 결합 원리)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Korean particles come in phonetic pairs so speech flows without awkward consonant clusters. After a noun ending in a batchim (consonant), choose the vowel-initial particle (은, 이, 을, 과, 으로) to trigger smooth liaison. After a noun ending in a vowel (no batchim), choose the consonant-initial particle (는, 가, 를, 와, 로)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"앞 단어의 마지막 글자에 받침이 있으면 모음(ㅇ)으로 시작하는 조사(은, 이, 을, 과)를 붙여 연음이 일어나게 하고, 받침이 없으면 자음으로 시작하는 조사(는, 가, 를, 와)를 붙여 모음 충돌을 피하는 것이 한국어 조사의 대원칙입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Topic Marker (은/는) vs. Subject Marker (이/가): Contrast & Known Info vs. New Focus"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Use 은/는 to establish the overarching topic ('As for X...'), state general truths, or draw a contrast between two things (형은 키가 크지만 동생은 작아요). Use 이/가 to introduce brand-new information into the discourse, answer 'Who/What?' questions (누가 왔어요? 민수가 왔어요), or pair with descriptive/existential predicates (있다/없다/되다/아니다)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"'은/는'은 이미 알고 있는 화제를 제시하거나 다른 대상과 대조할 때 쓰이며, 서술어 부분에 핵심 정보가 놓입니다. 반면 '이/가'는 새로운 대상을 처음 언급하거나 주어 자체를 강조하여 지정할 때 쓰입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Static Destination (에) vs. Dynamic Action Venue (에서) (장소 조사 '에'와 '에서'의 구분)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Attach 에 to mark static existence (집에 있어요), time (세 시에 만나요), or movement destination with 가다/오다 (학교에 가요). Attach 에서 to mark the active arena where a dynamic action takes place (도서관에서 공부해요, 카페에서 커피를 마셔요)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"'에'는 존재·도착점·시간의 고정된 기준점을 나타내고, '에서'는 구체적인 행동이나 사건이 이루어지는 활동 공간 및 출발점을 나타냅니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Particle Pair (조사 쌍)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"After Batchim (받침 있을 때)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"No Batchim (받침 없을 때)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Core Grammatical Function (핵심 문법 기능)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Example Sentence (예문)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Topic / Contrast (보조사)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"책은 (Chaek-eun)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"나는 (Na-neun)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Sets topic, general truth, or contrast"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"오늘은 날씨가 참 맑네요."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Subject / Focus (주격)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"꽃이 (Kkoch-i)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"비가 (Bi-ga)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"New subject focus, pairs with 있다/없다"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"창밖에 시원한 비가 내립니다."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Direct Object (목적격)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"밥을 (Bab-eul)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"커피를 (Keopi-reul)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Marks direct target of transitive verb"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"아침에 따뜻한 커피를 마셨어요."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Static / Goal (부사격 에)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"집에 / 학원에"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"학교에 / 회사에"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Static location, time, destination"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"주말에는 주로 집에 있어요."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Action Arena (부사격 에서)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"식당에서"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"도서관에서"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Place where active verb occurs"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"도서관에서 한국어 책을 읽어요."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Direction / Means (로/으로)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"지하철로 (ㄹ exception)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"버스로 / 한국어로"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Direction, tool, language, or method"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이메일로 자료를 보내 주세요."}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"저는 한국 음악은 자주 듣지만 한국 영화는 아직 많이 못 봤습니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"오늘 아침에 창문을 열어 보니 하얀 눈이 소복하게 내리고 있었습니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"조용한 도서관에서 한국어 문법책을 읽으며 열심히 타자 연습을 합니다."}</li>
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
