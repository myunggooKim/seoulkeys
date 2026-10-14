import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mastering Dual Korean Number Systems: Sino-Korean, Native Numbers & Counters (한국어 이원 숫자 체계 및 단위 명사 교재) · Seoul Keys",
  description: "Learn exactly when to use Sino-Korean (일·이·삼) vs. Native Korean (하나·둘·셋) numbers, how telling time combines both, and how counters work.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/korean-number-systems-sino-native",
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
            {"Mastering Dual Korean Number Systems: Sino-Korean, Native Numbers & Counters (한국어 이원 숫자 체계 및 단위 명사 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Learn exactly when to use Sino-Korean (일·이·삼) vs. Native Korean (하나·둘·셋) numbers, how telling time combines both, and how counters work."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"한국어의 두 가지 숫자 체계인 한자어 수(일·이·삼)와 고유어 수(하나·둘·셋)의 쓰임새를 구분하고, 시각 읽기(시·분)와 필수 단위 명사(개·명·잔·권·살) 결합법을 완성합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Why Korean Uses Two Complete Number Systems (한자어 수와 고유어 수의 역할 분담)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Korean uses Sino-Korean numbers (일, 이, 삼, 사, 오...) for dates, money, phone numbers, floor numbers, minutes, and numbers above 100. It uses Native Korean numbers (하나, 둘, 셋, 넷, 다섯...) for counting physical objects, people, age (살), and hours of the clock."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"날짜·화폐·전화번호·버스 노선·분(Minute)·초(Second)처럼 수학적이거나 제도적인 단위는 한자어 숫자를 쓰고, 사물의 개수(개)·사람 수(명)·나이(살)·시간(시)처럼 일상에서 손으로 세는 단위는 고유어 숫자를 씁니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. The Five Contracted Native Numbers Before Counters (단위 명사 앞 고유어 수사 형태 변화: 한·두·세·네·스무)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"When Native Korean numbers 1, 2, 3, 4, and 20 stand directly before a unit counter (개, 명, 잔, 마리, 시), they drop their final consonant/syllable: 하나 becomes 한, 둘 becomes 두, 셋 becomes 세, 넷 becomes 네, and 스물 becomes 스무 (e.g., 커피 두 잔, 사과 네 개, 스무 살)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"고유어 숫자 뒤에 단위 명사가 결합할 때 '하나·둘·셋·넷·스물'이 '한·두·세·네·스무'로 줄어드는 규칙은 한국어 맞춤법과 회화 시험에서 가장 자주 출제되는 핵심 포인트입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Telling Time & Reading Large Currency Figures (시각 읽기 및 큰 단위 금액 표기법)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Telling time combines both systems in a single phrase: Hours use Native Korean (한 시, 두 시, 세 시...) while Minutes use Sino-Korean (십오 분, 삼십 분, 사십오 분). Large numbers group by 10,000 (만) rather than 1,000 (천): 50,000 won is 오만 원."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"한국어의 큰 숫자는 천(1,000) 단위가 아니라 만(10,000)과 억(100,000,000) 단위로 끊어 읽으므로, 금액을 타이핑할 때도 만 단위를 기준으로 자리수를 파악하면 빠르고 정확합니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Number"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Sino-Korean (한자어 숫자)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Native Korean (고유어 숫자)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Before Counter (단위 명사 앞)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Real-Life Counter Example (실전 결합 예시)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"1"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"일 (il)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"하나 (hana)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"한 (han)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"일 층 (1st floor) / 커피 한 잔 (1 cup of coffee)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"2"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이 (i)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"둘 (dul)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"두 (du)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이월 (February) / 친구 두 명 (2 friends)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"3"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"삼 (sam)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"셋 (set)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"세 (se)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"삼십 분 (30 mins) / 오후 세 시 (3 o'clock PM)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"4"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"사 (sa)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"넷 (net)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"네 (ne)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"사만 원 (40,000 won) / 사과 네 개 (4 apples)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"5"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"오 (o)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"다섯 (daseot)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"다섯 (daseot)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"오 번 출구 (Exit 5) / 책 다섯 권 (5 books)"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"20"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이십 (isip)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"스물 (seumul)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"스무 (seumu)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이십 일 (20th day) / 스무 살 (20 years old)"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"오후 두 시 삼십 분에 지하철 삼 호선 안국역 네 번 출구 앞에서 만납시다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"따뜻한 아메리카노 두 잔이랑 블루베리 케이크 한 조각 포장해 주세요."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"서점에서 한국어 소설책 세 권을 이만 사천 원에 구매했습니다."}</li>
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
