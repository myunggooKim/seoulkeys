/**
 * Writes a Latin-script personal name the way it sounds in Hangul, e.g.
 * "John Smith" → "존 스미스". Used to greet members in the script they came here
 * to learn.
 *
 * Scope, deliberately: Latin script only. A name already written in Hangul is
 * returned unchanged, and so is a name in any other script (Japanese, Chinese,
 * Cyrillic, Arabic, Thai …) — guessing at those from their spelling would give
 * a worse result than simply showing the name the member typed.
 */

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const JUNG = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function compose(onset: string, nucleus: string, coda = ""): string {
  const cho = CHO.indexOf(onset);
  const jung = JUNG.indexOf(nucleus);
  const jong = JONG.indexOf(coda);
  if (cho < 0 || jung < 0 || jong < 0) return "";
  return String.fromCharCode(0xac00 + cho * 588 + jung * 28 + jong);
}

/** Consonant clusters, longest first so "tch" beats "ch". */
const ONSETS: Array<[string, string]> = [
  ["tch", "ㅊ"], ["sch", "ㅅ"],
  ["ch", "ㅊ"], ["sh", "ㅅ"], ["ph", "ㅍ"], ["th", "ㅅ"], ["wh", "ㅇ"],
  ["ck", "ㅋ"], ["kn", "ㄴ"], ["wr", "ㄹ"], ["gn", "ㄴ"], ["ps", "ㅅ"],
  ["rh", "ㄹ"], ["zh", "ㅈ"], ["gh", "ㄱ"],
  ["b", "ㅂ"], ["c", "ㅋ"], ["d", "ㄷ"], ["f", "ㅍ"], ["g", "ㄱ"], ["h", "ㅎ"],
  ["j", "ㅈ"], ["k", "ㅋ"], ["l", "ㄹ"], ["m", "ㅁ"], ["n", "ㄴ"], ["p", "ㅍ"],
  ["q", "ㅋ"], ["r", "ㄹ"], ["s", "ㅅ"], ["t", "ㅌ"], ["v", "ㅂ"], ["w", "ㅇ"],
  ["x", "ㅋ"], ["z", "ㅈ"],
];

/** Vowel clusters mapped to one or more medial jamo, longest pattern first. */
const NUCLEI: Array<[string, string[]]> = [
  ["eau", ["ㅗ"]], ["iou", ["ㅕ"]],
  ["ai", ["ㅔ", "ㅣ"]], ["ay", ["ㅔ", "ㅣ"]], ["ea", ["ㅣ"]], ["ee", ["ㅣ"]],
  ["ei", ["ㅔ", "ㅣ"]], ["ey", ["ㅣ"]], ["ie", ["ㅣ"]], ["oa", ["ㅗ"]],
  ["oo", ["ㅜ"]], ["ou", ["ㅏ", "ㅜ"]], ["ow", ["ㅗ", "ㅜ"]], ["oi", ["ㅗ", "ㅣ"]],
  ["oy", ["ㅗ", "ㅣ"]], ["au", ["ㅗ"]], ["aw", ["ㅗ"]], ["ue", ["ㅜ"]],
  ["ui", ["ㅜ", "ㅣ"]], ["ia", ["ㅣ", "ㅏ"]], ["io", ["ㅣ", "ㅗ"]], ["eu", ["ㅠ"]],
  ["ya", ["ㅑ"]], ["ye", ["ㅖ"]], ["yo", ["ㅛ"]], ["yu", ["ㅠ"]], ["yi", ["ㅣ"]],
  ["wa", ["ㅘ"]], ["we", ["ㅞ"]], ["wi", ["ㅟ"]], ["wo", ["ㅝ"]],
  ["a", ["ㅏ"]], ["e", ["ㅔ"]], ["i", ["ㅣ"]], ["o", ["ㅗ"]], ["u", ["ㅓ"]], ["y", ["ㅣ"]],
];

/** How a single vowel sounds when a silent final "e" lengthens it. */
const LONG_VOWEL: Record<string, string[]> = {
  a: ["ㅔ", "ㅣ"],
  e: ["ㅣ"],
  i: ["ㅏ", "ㅣ"],
  o: ["ㅗ", "ㅜ"],
  u: ["ㅠ"],
};

/** Consonants Korean carries as a coda without needing a supporting vowel. */
const CODA_FOR: Record<string, string> = { "ㄴ": "ㄴ", "ㅁ": "ㅁ", "ㄹ": "ㄹ", "ㅇ": "ㅇ" };

/** Some consonants take ㅣ rather than ㅡ when they need a support vowel. */
const NEEDS_I = new Set(["ㅈ", "ㅊ"]);

const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u", "y"]);

/**
 * English spelling is irregular enough that rules alone mangle common names
 * ("Thomas" would come out 소마스, "Michael" 미차엘). These are the spellings
 * frequent enough among visitors to be worth stating outright; everything else
 * falls through to the rules below.
 */
const LEXICON: Record<string, string> = {
  michael: "마이클", thomas: "토마스", david: "데이비드", james: "제임스",
  john: "존", robert: "로버트", william: "윌리엄", richard: "리처드",
  joseph: "조셉", charles: "찰스", christopher: "크리스토퍼", daniel: "다니엘",
  matthew: "매튜", anthony: "앤서니", andrew: "앤드류", joshua: "조슈아",
  george: "조지", stephen: "스티븐", steven: "스티븐", paul: "폴",
  kenneth: "케네스", kevin: "케빈", brian: "브라이언", edward: "에드워드",
  ronald: "로널드", timothy: "티모시", jason: "제이슨", jeffrey: "제프리",
  ryan: "라이언", jacob: "제이콥", gary: "게리", nicholas: "니콜라스",
  eric: "에릭", jonathan: "조나단", stephanie: "스테파니", larry: "래리",
  justin: "저스틴", scott: "스콧", brandon: "브랜든", benjamin: "벤자민",
  samuel: "새뮤얼", gregory: "그레고리", alexander: "알렉산더", patrick: "패트릭",
  jack: "잭", dennis: "데니스", jerry: "제리", tyler: "타일러",
  aaron: "에런", henry: "헨리", douglas: "더글러스", peter: "피터",
  adam: "아담", nathan: "네이선", zachary: "재커리", walter: "월터",
  kyle: "카일", harold: "해럴드", carl: "칼", jeremy: "제레미",
  keith: "키스", roger: "로저", gerald: "제럴드", ethan: "이든",
  arthur: "아서", terry: "테리", christian: "크리스천", sean: "션",
  lawrence: "로렌스", austin: "오스틴", joe: "조", noah: "노아",
  jesse: "제시", albert: "앨버트", bryan: "브라이언", billy: "빌리",
  bruce: "브루스", willie: "윌리", jordan: "조던", dylan: "딜런",
  alan: "앨런", ralph: "랄프", gabriel: "가브리엘", roy: "로이",
  juan: "후안", wayne: "웨인", eugene: "유진", logan: "로건",
  randy: "랜디", louis: "루이스", russell: "러셀", vincent: "빈센트",
  philip: "필립", bobby: "바비", johnny: "조니", bradley: "브래들리",
  chris: "크리스", mike: "마이크", tom: "톰", mary: "메리",
  patricia: "패트리샤", jennifer: "제니퍼", linda: "린다", elizabeth: "엘리자베스",
  barbara: "바바라", susan: "수잔", jessica: "제시카", sarah: "사라",
  karen: "카렌", nancy: "낸시", lisa: "리사", betty: "베티",
  margaret: "마가렛", sandra: "산드라", ashley: "애슐리", kimberly: "킴벌리",
  emily: "에밀리", donna: "도나", michelle: "미셸", carol: "캐롤",
  amanda: "아만다", dorothy: "도로시", melissa: "멜리사", deborah: "데보라",
  stephany: "스테파니", rebecca: "레베카", sharon: "샤론", laura: "로라",
  cynthia: "신시아", kathleen: "캐슬린", amy: "에이미", angela: "안젤라",
  shirley: "셜리", anna: "안나", brenda: "브렌다", pamela: "파멜라",
  nicole: "니콜", ruth: "루스", katherine: "캐서린", samantha: "사만다",
  christine: "크리스틴", emma: "엠마", catherine: "캐서린", debra: "데브라",
  virginia: "버지니아", rachel: "레이첼", carolyn: "캐롤린", janet: "자넷",
  maria: "마리아", heather: "헤더", diane: "다이앤", julie: "줄리",
  joyce: "조이스", victoria: "빅토리아", kelly: "켈리", christina: "크리스티나",
  joan: "조앤", evelyn: "에블린", olivia: "올리비아", sophia: "소피아",
  isabella: "이사벨라", mia: "미아", charlotte: "샬럿", amelia: "아멜리아",
  grace: "그레이스", chloe: "클로이", smith: "스미스", johnson: "존슨",
  williams: "윌리엄스", brown: "브라운", jones: "존스", garcia: "가르시아",
  miller: "밀러", martinez: "마르티네즈", davis: "데이비스", rodriguez: "로드리게스",
  lopez: "로페스", gonzalez: "곤잘레스", wilson: "윌슨", anderson: "앤더슨",
  taylor: "테일러", moore: "무어", jackson: "잭슨", martin: "마틴",
  lee: "리", perez: "페레즈", thompson: "톰슨", white: "화이트",
  harris: "해리스", sanchez: "산체스", clark: "클라크", ramirez: "라미레즈",
  lewis: "루이스", robinson: "로빈슨", walker: "워커", young: "영",
  allen: "앨런", king: "킹", wright: "라이트", torres: "토레스",
  nguyen: "응우옌", hill: "힐", flores: "플로레스", green: "그린",
  adams: "아담스", nelson: "넬슨", baker: "베이커", hall: "홀",
  rivera: "리베라", campbell: "캠벨", mitchell: "미첼", carter: "카터",
  roberts: "로버츠", parker: "파커", evans: "에반스", edwards: "에드워즈",
  collins: "콜린스", stewart: "스튜어트", morris: "모리스", murphy: "머피",
  cook: "쿡", rogers: "로저스", morgan: "모건", peterson: "피터슨",
  cooper: "쿠퍼", reed: "리드", bailey: "베일리", bell: "벨",
  howard: "하워드", ward: "워드", cox: "콕스", diaz: "디아즈",
  richardson: "리처드슨", wood: "우드", watson: "왓슨", brooks: "브룩스",
  bennett: "베넷", gray: "그레이", price: "프라이스", myers: "마이어스",
  long: "롱", foster: "포스터", sanders: "샌더스", ross: "로스",
  morales: "모랄레스", powell: "파월", sullivan: "설리반", ortiz: "오르티즈",
  jenkins: "젠킨스", perry: "페리", butler: "버틀러", barnes: "반스",
  fisher: "피셔", mueller: "뮐러", muller: "뮐러", schmidt: "슈미트",
  schneider: "슈나이더", fischer: "피셔", weber: "베버", meyer: "마이어",
  wagner: "바그너", becker: "베커", hoffmann: "호프만", dubois: "뒤부아",
  martinet: "마르티네", rossi: "로시", russo: "루소", ferrari: "페라리",
  esposito: "에스포지토", ivanov: "이바노프", ivanova: "이바노바", petrov: "페트로프",
  smirnov: "스미르노프", silva: "실바", santos: "산토스", oliveira: "올리베이라",
  souza: "소자",
};

function longestMatch<T>(word: string, at: number, table: Array<[string, T]>): [string, T] | null {
  for (const [pattern, value] of table) {
    if (word.startsWith(pattern, at)) return [pattern, value];
  }
  return null;
}

type Piece = { onset: string; nucleus: string; coda: string };

function supportVowel(sound: string): string {
  return NEEDS_I.has(sound) ? "ㅣ" : "ㅡ";
}

function normalize(input: string): { word: string; silentE: boolean } {
  let word = input.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return { word, silentE: false };

  // Collapse doubled consonants: "Rossi" is 로시, not 로스시. Doubled l/m/n/r
  // survive because Korean can carry them as a coda plus a fresh onset.
  word = word.replace(/([bcdfgkpstvz])\1/g, "$1");

  // "h" is silent after a vowel: John → 존, Sarah → 사라, Anh → 안.
  word = word.replace(/([aeiouy])h(?![aeiouy])/g, "$1");

  const silentE = word.length > 2 && /[b-df-hj-np-tv-z]e$/.test(word);
  if (silentE) word = word.slice(0, -1);

  return { word, silentE };
}

function transliterateWord(raw: string): string {
  const known = LEXICON[raw.toLowerCase().replace(/[^a-z]/g, "")];
  if (known) return known;

  const { word, silentE } = normalize(raw);
  if (!word) return "";

  const pieces: Piece[] = [];
  let index = 0;
  let pendingOnset = "";

  const pushConsonantBefore = (sound: string) => {
    const previous = pieces[pieces.length - 1];
    if (previous && !previous.coda && CODA_FOR[sound]) {
      previous.coda = CODA_FOR[sound];
      return;
    }
    pieces.push({ onset: sound, nucleus: supportVowel(sound), coda: "" });
  };

  while (index < word.length) {
    // "ng" closes the syllable rather than starting a new one.
    if (word.startsWith("ng", index) && pieces.length && !pendingOnset) {
      const previous = pieces[pieces.length - 1];
      if (!previous.coda) {
        previous.coda = "ㅇ";
        index += 2;
        continue;
      }
    }

    // An English "-er/-ar/-or/-ir/-ur" ending is one vowel sound, not a vowel
    // plus a coda: Miller is 밀러 and Parker is 파커, never 밀레러 / 팔케러.
    if (index === word.length - 2 && /^[aeiou]r$/.test(word.slice(index))) {
      pieces.push({ onset: pendingOnset || "ㅇ", nucleus: "ㅓ", coda: "" });
      pendingOnset = "";
      index += 2;
      continue;
    }

    // A single "l" between two vowels doubles in Korean: Emily is 에밀리.
    if (
      word[index] === "l"
      && !pendingOnset
      && pieces.length
      && !pieces[pieces.length - 1].coda
      && VOWEL_LETTERS.has(word[index + 1] ?? "")
    ) {
      pieces[pieces.length - 1].coda = "ㄹ";
      pendingOnset = "ㄹ";
      index += 1;
      continue;
    }

    const isLastVowel = silentE && !word.slice(index + 1).split("").some((c) => VOWEL_LETTERS.has(c));
    const longVowel = isLastVowel ? LONG_VOWEL[word[index]] : undefined;
    const vowel = longVowel ? ([word[index], longVowel] as [string, string[]]) : longestMatch(word, index, NUCLEI);

    if (vowel) {
      const [pattern, jamo] = vowel;
      pieces.push({ onset: pendingOnset || "ㅇ", nucleus: jamo[0], coda: "" });
      for (const extra of jamo.slice(1)) {
        pieces.push({ onset: "ㅇ", nucleus: extra, coda: "" });
      }
      pendingOnset = "";
      index += pattern.length;
      continue;
    }

    // "c" is soft before e/i/y: Garcia → 가르시아.
    const consonant = longestMatch(word, index, ONSETS);
    if (!consonant) { index += 1; continue; }
    const [pattern, initialSound] = consonant;
    let sound = initialSound;
    if (pattern === "c" && VOWEL_LETTERS.has(word[index + 1] ?? "") && "eiy".includes(word[index + 1])) {
      sound = "ㅅ";
    }
    if (pattern === "g" && "eiy".includes(word[index + 1] ?? "")) {
      sound = "ㅈ"; // George → 조지
    }

    if (pendingOnset) pushConsonantBefore(pendingOnset);
    pendingOnset = sound;
    index += pattern.length;
  }

  if (pendingOnset) {
    const previous = pieces[pieces.length - 1];
    if (!silentE && previous && !previous.coda && CODA_FOR[pendingOnset]) {
      previous.coda = CODA_FOR[pendingOnset];
    } else {
      // A final consonant Korean cannot close on takes a supporting ㅡ, which is
      // why "Smith" ends 스미스 and "Kate" ends 케이트.
      pieces.push({ onset: pendingOnset, nucleus: supportVowel(pendingOnset), coda: "" });
    }
  }

  return pieces.map((piece) => compose(piece.onset, piece.nucleus, piece.coda)).join("");
}

const HAS_HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const LATIN_NAME = /^[A-Za-z][A-Za-z'’.\- ]*$/;

/**
 * The member's name in Hangul, or null when it is already Hangul or is written
 * in a script this cannot honestly transliterate.
 */
export function toHangulName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || HAS_HANGUL.test(trimmed)) return null;
  if (!LATIN_NAME.test(trimmed)) return null;

  const words = trimmed.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  if (!words.length) return null;

  const converted = words.map(transliterateWord);
  if (converted.some((word) => !word)) return null;
  return converted.join(" ");
}

/**
 * What to greet a member with: their full name in Hangul when we can render it,
 * otherwise exactly the name they signed up with. Never just the surname.
 */
export function displayNameForGreeting(fullName: string): {
  display: string;
  original: string;
  romanized: boolean;
} {
  const original = fullName.trim();
  const hangul = toHangulName(original);
  return hangul
    ? { display: hangul, original, romanized: true }
    : { display: original, original, romanized: false };
}
