/* Preview art for the activity cards.
 *
 * Inline SVG rather than image files: the cards sit above the fold, the art has
 * to flip with the theme, and a sprite would be one more request before the page
 * is usable. Everything is drawn from the theme tokens, so dark mode needs no
 * second copy.
 *
 * Each drawing shows the *mechanic*, not a logo — a learner who has never opened
 * the activity should be able to guess what happens in it. */

type Props = { activity: string };

const stroke = "var(--edge)";
const paper = "var(--paper)";
const surface = "var(--surface-2, #eef2f8)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 64" className="activity-preview" aria-hidden="true" focusable="false">
      <rect x="0.75" y="0.75" width="118.5" height="62.5" rx="9" fill={surface} stroke={stroke} strokeWidth="1.5" />
      {children}
    </svg>
  );
}

/* Home row: the row of keys with one lit up and a fingertip on it. */
function HomeRow() {
  const keys = [12, 27, 42, 57, 72, 87];
  return (
    <Frame>
      {keys.map((x, i) => (
        <rect key={x} x={x} y={22} width="13" height="13" rx="3"
          fill={i === 2 ? "var(--yellow)" : paper} stroke={stroke} strokeWidth="1.4" />
      ))}
      <circle cx="48.5" cy="45" r="5" fill="var(--pink)" stroke={stroke} strokeWidth="1.4" />
      <path d="M48.5 40v-4" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <text x="45.5" y="32" fontSize="9" fontWeight="900" fill={stroke}>ㅁ</text>
    </Frame>
  );
}

/* Word rain: syllables dropping onto a skyline. */
function WordRain() {
  return (
    <Frame>
      <rect x="10" y="10" width="17" height="12" rx="3" fill="var(--cyan)" stroke={stroke} strokeWidth="1.4" />
      <text x="14" y="19.5" fontSize="8" fontWeight="900" fill={stroke}>가</text>
      <rect x="46" y="20" width="17" height="12" rx="3" fill="var(--lime)" stroke={stroke} strokeWidth="1.4" />
      <text x="50" y="29.5" fontSize="8" fontWeight="900" fill={stroke}>나</text>
      <rect x="82" y="13" width="17" height="12" rx="3" fill="var(--purple)" stroke={stroke} strokeWidth="1.4" />
      <text x="86" y="22.5" fontSize="8" fontWeight="900" fill={paper}>다</text>
      <path d="M6 54h14V44h10v10h12V38h12v16h14V46h12v8h14" fill={paper} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
    </Frame>
  );
}

/* Missing letter: a word with one empty tile. */
function MissingLetter() {
  return (
    <Frame>
      {[22, 45, 68].map((x, i) => (
        <rect key={x} x={x} y={20} width="20" height="24" rx="4"
          fill={i === 1 ? paper : "var(--lime)"} stroke={stroke}
          strokeWidth="1.6" strokeDasharray={i === 1 ? "4 3" : undefined} />
      ))}
      <text x="25" y="37" fontSize="12" fontWeight="900" fill={stroke}>강</text>
      <text x="73" y="37" fontSize="12" fontWeight="900" fill={stroke}>지</text>
      <text x="52" y="38" fontSize="13" fontWeight="900" fill="var(--pink)">?</text>
    </Frame>
  );
}

/* Crossword: the real game in miniature — an irregular connected board,
 * an active whole word, and its clue/input panel. */
function Crossword() {
  const crosswordPreviewCells = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 4],
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    [3, 2], [3, 4],
    [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
    [5, 4], [5, 6],
  ];
  const activeAnswer = ["한", "국", "어", "공", "부"];
  const startNumbers = new Map(["0-2", "0-4", "2-0", "4-2"].map((key, index) => [key, index + 1]));

  return (
    <Frame>
      <rect x="6.5" y="6.5" width="63" height="50" rx="6" fill="var(--purple)" opacity=".55" />
      <rect x="4" y="4" width="63" height="50" rx="6" fill="var(--ink)" stroke={stroke} strokeWidth="1.4" />
      {crosswordPreviewCells.map(([row, col]) => {
        const key = `${row}-${col}`;
        const activeIndex = row === 2 && col <= 4 ? col : -1;
        const solved = row === 0;
        const selected = row === 2 && col === 2;
        const number = startNumbers.get(key);
        const x = 7 + col * 8;
        const y = 6.5 + row * 8;
        return (
          <g key={key}>
            <rect
              x={x}
              y={y}
              width="7"
              height="7"
              rx="1.2"
              fill={solved ? "var(--lime)" : activeIndex >= 0 ? "var(--yellow)" : paper}
              stroke={selected ? "var(--purple)" : stroke}
              strokeWidth={selected ? "1.5" : ".65"}
            />
            {number && <text x={x + .8} y={y + 2.4} fontSize="2.2" fontWeight="950" fill={stroke}>{number}</text>}
            {activeIndex >= 0 && (
              <text x={x + 3.5} y={y + 5.6} textAnchor="middle" fontSize="4.1" fontWeight="950" fill={stroke}>
                {activeAnswer[activeIndex]}
              </text>
            )}
          </g>
        );
      })}
      <rect x="74" y="8" width="41" height="24" rx="5" fill="var(--yellow)" stroke={stroke} strokeWidth="1.3" />
      <rect x="77" y="12" width="13" height="15" rx="3" fill="var(--ink)" />
      <text x="83.5" y="21.6" textAnchor="middle" fontSize="5" fontWeight="950" fill={paper}>3→</text>
      <path d="M94 14.5h16M94 19h12M94 23.5h9" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="74" y="36" width="41" height="12" rx="4" fill={paper} stroke={stroke} strokeWidth="1.3" />
      <text x="78" y="44" fontSize="5.2" fontWeight="900" fill={stroke}>한국어공부</text>
      <rect x="94" y="51" width="21" height="8" rx="3" fill="var(--ink)" />
      <text x="104.5" y="56.7" textAnchor="middle" fontSize="4" fontWeight="900" fill={paper}>Enter</text>
    </Frame>
  );
}

/* Travel: a signpost and a greeting bubble. */
function Travel() {
  return (
    <Frame>
      <path d="M30 50V18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 22h22l5 5-5 5H30z" fill="var(--cyan)" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M30 36H14l-5-5 5-5h16z" fill="var(--lime)" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="66" y="16" width="42" height="24" rx="8" fill={paper} stroke={stroke} strokeWidth="1.5" />
      <path d="M78 40l-4 8 10-8z" fill={paper} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <text x="72" y="32" fontSize="10" fontWeight="900" fill={stroke}>안녕</text>
    </Frame>
  );
}

/* K-POP: a lyric line under a bouncing note. */
function KpopLyrics() {
  return (
    <Frame>
      <path d="M44 40V16l16-4v24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="39" cy="41" r="5.5" fill="var(--pink)" stroke={stroke} strokeWidth="1.5" />
      <circle cx="55" cy="37" r="5.5" fill="var(--purple)" stroke={stroke} strokeWidth="1.5" />
      <path d="M14 52h92" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 52h38" stroke="var(--pink)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M18 20h14M18 26h9" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </Frame>
  );
}

/* K-drama: a clapper board with a subtitle strip. */
function DramaLines() {
  return (
    <Frame>
      <rect x="20" y="20" width="80" height="26" rx="4" fill={paper} stroke={stroke} strokeWidth="1.5" />
      <path d="M20 14l80-4v8l-80 4z" fill="var(--ink)" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M34 11.5l-5 7M52 10l-5 7M70 8.5l-5 7M88 7l-5 7" stroke={paper} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 33h42" stroke="var(--cyan)" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 40h26" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </Frame>
  );
}

/* Proverbs: an open book with one highlighted line and quotation marks. */
function Proverbs() {
  return (
    <Frame>
      <path d="M15 17c17-4 30 1 45 9v29c-15-8-28-12-45-8z" fill={paper} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M105 17c-17-4-30 1-45 9v29c15-8 28-12 45-8z" fill={paper} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M60 26v29" stroke={stroke} strokeWidth="1.5" />
      <path d="M24 31h25M24 37h20M71 31h25M71 37h18" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      <path d="M24 43h27" stroke="var(--pink)" strokeWidth="3.3" strokeLinecap="round" />
      <text x="43" y="24" fontSize="15" fontWeight="950" fill="var(--purple)">“</text>
      <text x="68" y="25" fontSize="15" fontWeight="950" fill="var(--cyan)">”</text>
    </Frame>
  );
}

const byActivity: Record<string, () => React.ReactElement> = {
  home: HomeRow,
  tetris: WordRain,
  missing: MissingLetter,
  crossword: Crossword,
  travel: Travel,
  kpop: KpopLyrics,
  screen: DramaLines,
  proverb: Proverbs,
};

export function ActivityPreview({ activity }: Props) {
  const Art = byActivity[activity];
  if (!Art) return null;
  return <Art />;
}
