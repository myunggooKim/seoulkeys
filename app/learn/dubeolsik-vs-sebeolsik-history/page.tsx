import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dubeolsik vs. Sebeolsik Korean Keyboards: Ergonomics, Speed & IME Architecture (두벌식과 세벌식 한글 자판의 구조·역사·타자 역학 비교 교재) · Seoul Keys",
  description: "Understand the engineering behind Korea's national Dubeolsik standard, how automaton syllable assembly works, and how to optimize your CPM.",
  alternates: {
    canonical: "https://seoulkeys.com/learn/dubeolsik-vs-sebeolsik-history",
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
            {"Dubeolsik vs. Sebeolsik Korean Keyboards: Ergonomics, Speed & IME Architecture (두벌식과 세벌식 한글 자판의 구조·역사·타자 역학 비교 교재)"}
          </h1>
          <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{"Understand the engineering behind Korea's national Dubeolsik standard, how automaton syllable assembly works, and how to optimize your CPM."}</p>
          <p style={{ fontSize: '0.98rem', opacity: 0.9 }}>{"대한민국 국가 표준인 두벌식 자판과 공병우 세벌식 자판의 역사적 배경과 오토마타 조합 원리를 비교하고, 분당 타수(CPM)를 극대화하는 손가락 운지법을 다룹니다."}</p>
        </header>

        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"1. What Does '2-Set (두벌식)' vs. '3-Set (세벌식)' Mean? (두벌식과 세벌식의 구조적 차이)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Hangul syllables consist of three positional slots: Initial Consonant (초성), Medial Vowel (중성), and Final Consonant (종성/받침). A 'Dubeolsik (2-set)' keyboard uses only two sets of keys—one set of consonants (shared between initial and final positions) on the left hand, and one set of vowels on the right hand. The computer's Input Method Editor (IME) automatically determines whether a consonant is an initial or a final based on context."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"반면 공병우 박사가 고안한 '세벌식(3-set)' 자판은 초성 자음(오른손), 중성 모음(왼손), 종성 받침(왼손 아래)을 각각 별도의 키로 분리하여 타자기 시절부터 글자 네모틀이 찌그러지지 않고 초·중·종성 리듬이 일정하도록 설계된 방식입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"2. Why Dubeolsik Became the Global Standard (두벌식이 표준 자판으로 정착한 이유와 장점)"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"Because Dubeolsik requires only 26 letter keys (matching the 26 keys of the Latin QWERTY alphabet), it maps 1-to-1 onto standard laptop and mobile keyboards worldwide without encroaching on the number row. Moreover, placing all consonants on the left hand and all vowels on the right hand creates a natural 'Left-Right-Left' alternating rhythm."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"두벌식은 영문 QWERTY 자판의 26개 알파벳 영역 안에 모든 기본 자모가 들어오므로 숫자열을 침범하지 않으며, 스마트폰(천지인·두벌식 단모음)과 PC 모두에서 동일한 시각적 배열을 유지할 수 있어 외국인 학습자와 입문자에게 가장 효율적인 표준입니다."}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{"3. Mastering the Dubeolsik Automaton: Avoiding the 'Goblin Fire (도깨비불)' Phenomenon"}</h2>
          <p style={{ marginBottom: '0.75rem' }}>{"In Dubeolsik typing, when you type ㄱ-ㅏ-ㄴ (간) and then type ㅏ, the IME shifts the final ㄴ into the next syllable to produce 가나. If you accidentally type two vowels in a row or press a consonant out of order, the syllable splits unexpectedly. Keeping a steady alternating left-hand (consonant) then right-hand (vowel) cadence eliminates 90% of automaton assembly errors."}</p>
          <p style={{ marginBottom: '0.75rem' }}>{"오타 없이 분당 400타(CPM) 이상으로 진입하려면 왼손 자음 타건 후 오른손 모음 타건 사이의 간격을 균일하게 유지하고, 쌍자음 입력 시 Shift 키를 누른 채 모음까지 잘못 누르지 않도록 왼손 새끼손가락 도약 타이밍을 정확히 끊어주어야 합니다."}</p>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.85rem' }}>Core Reference Table (핵심 정리표)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.35)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>{"Comparison Criterion (비교 항목)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Dubeolsik (표준 두벌식 자판)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Sebeolsik 390 / Final (세벌식 자판)"}</th><th style={{ padding: '0.65rem 0.5rem' }}>{"Learner Impact (학습자 체감 특징)"}</th>
                </tr>
              </thead>
              <tbody>
                
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Key Layout Structure (벌수 구조)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Consonants (Left) + Vowels (Right)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Initials (Right) + Vowels/Finals (Left)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Dubeolsik is intuitive & easy to memorize"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Key Count Required (사용 키 개수)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"26 alphabet keys (+7 with Shift)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Uses all 4 rows including number row"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Dubeolsik works seamlessly on any laptop/phone"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Batchim Handling (받침 처리)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Automatic IME context shifting"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Dedicated final-consonant keys"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Dubeolsik requires clean L-R rhythm"}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.18)' }}>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{"Hand Alternation (양손 교차율)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"High on CV syllables (Left then Right)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"High on CVC syllables (Right then Left)"}</td><td style={{ padding: '0.65rem 0.5rem' }}>{"Both support 500+ CPM with proper form"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Typing Practice Sentences (실전 타자 연습 문장)</h2>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"두벌식 자판은 왼손으로 자음을 치고 오른손으로 모음을 칩니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"정확한 손가락 위치와 일정한 박자가 빠른 타자 속도를 만듭니다."}</li>
            <li style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{"매일 십 분씩 꾸준히 연습하면 한글 자판 배열이 손끝에 익습니다."}</li>
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
