import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Essential Travel Korean Textbook: Airport, Subway, Restaurant & Shopping Dialogues (한국 여행 실전 회화 교재) · Seoul Keys",
  description: "Practice typing and speaking authentic Korean phrases for Incheon Airport, T-money subway transit, ordering at local restaurants, and tax-free shopping.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/travel-korean-essential-dialogues",
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
        <span style={{ opacity: 0.85 }}>{"제2분류 · 실전 여행·비즈니스·일상 교류 회화 교재"}</span>
      </nav>

      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(128,128,128,0.25)', paddingBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
            {"2. Real-Life Situational Korean Textbooks · 제2분류 · 실전 여행·비즈니스·일상 교류 회화 교재"}
          </p>
          <h1 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.15rem)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {"Essential Travel Korean Textbook: Airport, Subway, Restaurant & Shopping Dialogues (한국 여행 실전 회화 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Practice typing and speaking authentic Korean phrases for Incheon Airport, T-money subway transit, ordering at local restaurants, and tax-free shopping."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"인천공항 입국부터 지하철·택시 이동, 식당 주문 및 메뉴 요청, 쇼핑·환불까지 한국 여행 현장에서 즉시 쓰는 핵심 문장을 상황별 대사로 익히고 타이핑합니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. Airport & Transit: Getting from Incheon to Downtown Seoul (공항 입국 및 대중교통 이동 회화)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Navigating Korea's public transit requires knowing key location nouns (역 station, 출구 exit, 갈아타다 transfer) and polite directional requests (-로 가 주세요 'please go to...', 어디에서 타요? 'where do I board?')."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"공항철도(AREX)나 지하철, 택시를 이용할 때는 목적지 이름 뒤에 '역(Station)', '번 출구(Exit number)', '호텔 앞(In front of the hotel)'을 정확히 붙여 말하는 것이 핵심입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Dining Out: Seating, Ordering, Side Dishes & Dietary Requests (식당 입장·주문·반찬 리필 회화)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"In Korean restaurants, you call staff politely with 저기요 (Excuse me over there) or 주문할게요 (I'd like to order). Counting people uses Native Korean numbers plus 명 (한 명, 두 명, 세 명), while counting menu portions uses Sino-Korean numbers plus 인분 (일 인분, 이 인분)."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"반찬이나 물을 더 요청할 때는 '이거 조금만 더 주세요(Please give me a little more of this)', 매운 음식을 조절할 때는 '안 맵게 해 주세요(Please make it not spicy)'라는 표현이 가장 널리 쓰입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Café, Shopping & Emergency Assistance (카페 주문·쇼핑·긴급 도움 요청)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Whether ordering an iced Americano (아이스 아메리카노 한 잔 테이크아웃이요), asking to try on clothes (이거 입어 봐도 돼요?), or requesting tax-free processing (택스 리펀드 되나요?), short polite -요 endings sound warm and natural."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"길을 잃거나 도움이 필요할 때는 '실례합니다, 혹시 말씀 좀 여쭤봐도 될까요?'로 정중히 운을 뗀 뒤 스마트폰 지도를 보여주며 질문하면 언제든 친절한 안내를 받을 수 있습니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Situation (상황)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Korean Expression (한국어 실전 문장)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Pronunciation (발음 가이드)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"English Meaning (영어 의미)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Transit (교통)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"서울역까지 가려면 어디에서 갈아타야 해요?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Seoulyeok-kkaji garyeomyeon eodieseo garataya haeyo?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Where should I transfer to get to Seoul Station?"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Taxi (택시)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"기사님, 광화문 사거리 근처에서 내려 주세요."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Gisanim, Gwanghwamun sageori geuncheo-eseo naeryeo juseyo."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Driver, please drop me off near Gwanghwamun intersection."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Restaurant (식당)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"두 명인데 창가 자리에 앉을 수 있을까요?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Du myeong-inde changga jarie anjeul su isseulkkayo?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Party of two—could we sit by the window?"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Ordering (주문)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"비빔밥 하나랑 김치찌개 하나 덜 맵게 주세요."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Bibimbap hanarang Kimchijjigae hana deol maepge juseyo."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"One Bibimbap and one Kimchi stew, less spicy please."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Café (카페)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"따뜻한 카페라떼 한 잔 여기서 마시고 갈게요."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Ttatteuthan kaperatte han jan yeogiseo masigo galgeyo."}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"One hot cafe latte, for here please."}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Shopping (쇼핑)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"이 옷 한 치수 더 큰 걸로 입어 봐도 될까요?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"I ot han chisu deo keun geollo ibeo bwado doelkkayo?"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"May I try this on in one size larger?"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"실례합니다, 경복궁으로 가려면 몇 번 출구로 나가야 하나요?"}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"여기 반찬이랑 시원한 물 조금만 더 주시면 감사하겠습니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"영수증 챙겨 주시고 카드로 일시불 결제 부탁드립니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"한국 여행이 처음인데 사람들이 정말 친절해서 기분이 좋습니다."}</li>
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
