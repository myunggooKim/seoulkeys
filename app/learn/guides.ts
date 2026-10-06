export type GuideAccent = "lime" | "pink" | "purple" | "cyan" | "yellow";

export type GuideExample = {
  label: string;
  keys: string;
  result: string;
  note: string;
};

export type GuideTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  table?: GuideTable;
  examples?: GuideExample[];
  note?: {
    title: string;
    body: string;
  };
};

export type GuideReference = {
  title: string;
  publisher: string;
  url: string;
};

export type LearningGuide = {
  slug: string;
  title: string;
  cardTitle: string;
  description: string;
  eyebrow: string;
  readMinutes: number;
  published: string;
  updated: string;
  accent: GuideAccent;
  keywords: string[];
  learningGoals: string[];
  intro: string[];
  quickAnswer: string;
  sections: GuideSection[];
  drill: {
    title: string;
    instructions: string;
    items: GuideExample[];
    checkpoint: string;
  };
  mistakes: Array<{
    mistake: string;
    fix: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  references: GuideReference[];
  related: string[];
};

const unicodeHangul: GuideReference = {
  title: "The Unicode Standard, Chapter 3: Hangul syllable composition and decomposition",
  publisher: "Unicode Consortium",
  url: "https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/",
};

const microsoftKeyboard: GuideReference = {
  title: "Manage the language and keyboard/input layout settings in Windows",
  publisher: "Microsoft Support",
  url: "https://support.microsoft.com/windows/change-your-keyboard-layout-245c49b8-f856-7fd7-2cf5-41e54c66f5b3",
};

const appleMacKeyboard: GuideReference = {
  title: "Change Input Sources settings on Mac",
  publisher: "Apple Support",
  url: "https://support.apple.com/guide/mac-help/change-input-sources-settings-mchl84525d76/mac",
};

const appleIphoneKeyboard: GuideReference = {
  title: "Add or change keyboards on iPhone",
  publisher: "Apple Support",
  url: "https://support.apple.com/guide/iphone/add-or-change-keyboards-iph73b71eb/ios",
};

const gboardKeyboard: GuideReference = {
  title: "Type in a different language",
  publisher: "Gboard Help",
  url: "https://support.google.com/gboard/answer/7068494?hl=en",
};

export const guides: LearningGuide[] = [
  {
    slug: "korean-keyboard-layout",
    title: "Korean Keyboard Layout: Every 2-Set Key Explained",
    cardTitle: "The Korean keyboard map",
    description:
      "Learn the standard Korean 2-set keyboard layout, see which QWERTY key makes each Hangul letter, and practise reading key sequences without romanization.",
    eyebrow: "Keyboard map · Beginner",
    readMinutes: 9,
    published: "2026-09-03",
    updated: "2026-10-04",
    accent: "lime",
    keywords: [
      "Korean keyboard layout",
      "2-set Korean keyboard",
      "Dubeolsik keyboard",
      "Hangul keyboard map",
      "Korean typing keys",
    ],
    learningGoals: [
      "Recognise the three rows of the standard 2-set Korean keyboard.",
      "Understand why consonants sit mostly under the left hand and vowels under the right.",
      "Convert a short QWERTY key sequence into a composed Hangul word.",
      "Use Shift only for the five tense consonants and two shifted vowels.",
    ],
    intro: [
      "The Korean keyboard does not ask you to type a romanized spelling. It gives each physical key a Hangul letter. On the standard 2-set layout, called 두벌식 (dubeolsik), the left side is mostly consonants and the right side is vowels. Press the letters in spoken syllable order and the input method combines them into square Hangul blocks.",
      "That distinction matters. The English-looking sequence gks does not mean that 한 is pronounced “g-k-s.” It records the physical key positions for ㅎ, ㅏ, and ㄴ. Once you stop reading the Latin labels as sounds, the layout becomes a small, learnable map rather than a code to memorize word by word.",
    ],
    quickAnswer:
      "On a QWERTY-labelled keyboard, use Q–T, A–G, and Z–V for most consonants; use Y–P, H–L, and B–M for vowels. Type an initial consonant, a vowel, and an optional final consonant. The Korean input method composes the block for you.",
    sections: [
      {
        id: "shape-of-layout",
        title: "Read the layout as two working zones",
        paragraphs: [
          "The strongest shortcut is to learn zones before individual keys. Your left hand supplies the consonant frame of a syllable: the opening sound and, when present, the final consonant. Your right hand supplies the vowel in the middle. A simple block such as 한 therefore moves left–right–left: ㅎ on G, ㅏ on K, ㄴ on S.",
          "The top row contains the letters that require Shift as well as several common vowels. The home row carries high-frequency letters such as ㄴ, ㅇ, ㄹ, ㅏ, ㅓ, ㅗ, and ㅣ. The bottom row contains the aspirated consonants ㅋ, ㅌ, ㅊ, ㅍ and the vowels ㅠ, ㅜ, ㅡ. Learning those row patterns makes recall faster than studying twenty-six unrelated pairs.",
        ],
        note: {
          title: "Physical key, not printed letter",
          body:
            "The positions below use QWERTY labels as a shared reference. If your physical keyboard is AZERTY or QWERTZ, follow the key position shown by your operating system or Seoul Keys rather than guessing from romanization.",
        },
      },
      {
        id: "full-map",
        title: "The complete 2-set key map",
        paragraphs: [
          "Read each row from left to right. A capital Latin letter in a practice sequence means hold Shift while pressing that key; Caps Lock is unnecessary. The seven shifted Hangul letters are listed separately so the base map stays easy to scan.",
        ],
        table: {
          caption: "Standard Korean 2-set layout on QWERTY-labelled keys",
          headers: ["Row", "Latin keys", "Hangul output", "Pattern"],
          rows: [
            ["Top left", "Q W E R T", "ㅂ ㅈ ㄷ ㄱ ㅅ", "Consonants"],
            ["Top right", "Y U I O P", "ㅛ ㅕ ㅑ ㅐ ㅔ", "Vowels"],
            ["Home left", "A S D F G", "ㅁ ㄴ ㅇ ㄹ ㅎ", "Consonants"],
            ["Home right", "H J K L", "ㅗ ㅓ ㅏ ㅣ", "Vowels"],
            ["Bottom left", "Z X C V", "ㅋ ㅌ ㅊ ㅍ", "Aspirated consonants"],
            ["Bottom right", "B N M", "ㅠ ㅜ ㅡ", "Vowels"],
            ["With Shift", "Q W E R T O P", "ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ", "Tense consonants and shifted vowels"],
          ],
        },
      },
      {
        id: "from-keys-to-words",
        title: "Turn key positions into real words",
        paragraphs: [
          "Korean input is sequential even though the result is arranged in blocks. For 한, press G for ㅎ, K for ㅏ, then S for ㄴ. The input method first displays ㅎ, changes it to 하 when the vowel arrives, and completes 한 when the final consonant arrives. You do not move the cursor inside the block.",
          "Word spaces work normally. Finish every Hangul block in the word, then press Space once. Punctuation and numbers remain on their usual keys. If Latin letters appear instead of Hangul, switch the active input source before diagnosing the key sequence.",
        ],
        examples: [
          { label: "One closed block", keys: "gks", result: "한", note: "ㅎ + ㅏ + ㄴ" },
          { label: "One closed block", keys: "rmf", result: "글", note: "ㄱ + ㅡ + ㄹ" },
          { label: "Two blocks", keys: "tjdnf", result: "서울", note: "서 + 울" },
          { label: "Greeting", keys: "dkssud", result: "안녕", note: "안 + 녕" },
          { label: "Useful phrase", keys: "rkatkgkqslek", result: "감사합니다", note: "감 + 사 + 합 + 니 + 다" },
        ],
      },
      {
        id: "memory-method",
        title: "Memorise movement, not a poster",
        paragraphs: [
          "A keyboard poster is useful for checking, but repeated movement builds recall. Start with alternating pairs such as ㄴ–ㅏ (S–K), ㅇ–ㅓ (D–J), and ㄹ–ㅗ (F–H). Then add a final consonant and feel the left–right–left rhythm: 난, 언, 롤. Ten accurate repetitions are more useful than one fast run with corrections.",
          "Say the Hangul letter or syllable while pressing it. This links sound, shape, and finger movement without inserting a romanization step. Hide the map for one attempt, reveal it for the correction, and hide it again. That short retrieval cycle is what turns recognition into touch memory.",
        ],
        bullets: [
          "Learn the home row first because it supplies many frequent Korean letters.",
          "Practise two or three new keys with familiar ones instead of adding a whole row at once.",
          "Keep your eyes on the Hangul result, not the Latin labels.",
          "Return to accuracy whenever you start pressing several keys with one finger.",
        ],
      },
    ],
    drill: {
      title: "Five-sequence map check",
      instructions:
        "Switch to Korean input. Type each sequence exactly once, then compare the composed result. Capital letters mean Shift.",
      items: [
        { label: "Place", keys: "tjdnf", result: "서울", note: "Notice two right-hand vowel movements." },
        { label: "Country", keys: "gksrnr", result: "한국", note: "Both blocks end with a consonant." },
        { label: "Person", keys: "tkfka", result: "사람", note: "The hands alternate cleanly." },
        { label: "Thanks", keys: "rhakdnj", result: "고마워", note: "ㅝ is typed as ㅜ + ㅓ." },
        { label: "Tense consonant", keys: "Rna", result: "꿈", note: "Shift+R makes ㄲ." },
      ],
      checkpoint:
        "You are ready to move on when you can type four of the five results without looking down and can explain that the Latin sequence marks keys, not pronunciation.",
    },
    mistakes: [
      {
        mistake: "Reading QWERTY letters as romanization",
        fix: "Name the Hangul output of each key. G is the position for ㅎ; it is not a /g/ sound in this layout.",
      },
      {
        mistake: "Trying to place letters inside a square manually",
        fix: "Type letters in time order. The input method controls the two-dimensional block.",
      },
      {
        mistake: "Using Caps Lock for ordinary typing",
        fix: "Use Shift only for ㅃ, ㅉ, ㄸ, ㄲ, ㅆ, ㅒ, and ㅖ.",
      },
      {
        mistake: "Learning every key before typing a word",
        fix: "Use a small set immediately. Meaningful words give each movement a retrieval cue.",
      },
    ],
    faqs: [
      {
        question: "Is 2-set the same as dubeolsik?",
        answer:
          "Yes. 두벌식 means “two-set”: consonants form one set and vowels the other. It is the standard layout most learners encounter on Korean computers and phones.",
      },
      {
        question: "Do I need a Korean-labelled physical keyboard?",
        answer:
          "No. Adding a Korean input source changes what the existing keys produce. Stickers can help at first, but an on-screen map and short retrieval practice work without special hardware.",
      },
      {
        question: "Why does Seoul Keys show a different Latin letter from my keycap?",
        answer:
          "Your hardware may use AZERTY or QWERTZ. Follow physical positions and select the matching base layout in the practice controls so the visual guide corresponds to your keyboard.",
      },
    ],
    references: [microsoftKeyboard, appleMacKeyboard, unicodeHangul],
    related: ["add-korean-keyboard", "hangul-syllable-blocks", "korean-touch-typing"],
  },
  {
    slug: "add-korean-keyboard",
    title: "How to Add a Korean Keyboard on Windows, Mac, iPhone, and Android",
    cardTitle: "Add Korean input to any device",
    description:
      "Set up the Korean 2-set keyboard on Windows, macOS, iPhone, iPad, or Android, switch languages safely, and fix the most common setup problems.",
    eyebrow: "Device setup · All platforms",
    readMinutes: 10,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "cyan",
    keywords: [
      "add Korean keyboard",
      "Korean keyboard Windows",
      "Korean keyboard Mac",
      "Korean keyboard iPhone",
      "Korean keyboard Android",
    ],
    learningGoals: [
      "Add Korean input without changing the device display language.",
      "Choose the standard 2-set Korean layout when a device offers several options.",
      "Switch between Korean and Latin input with a reliable shortcut.",
      "Confirm the setup with a three-key composition test.",
    ],
    intro: [
      "You do not need a Korean computer, Korean keycaps, or a new app to type Hangul. Modern operating systems include a Korean input method. Adding it gives your current keyboard a second layer: the same physical keys can produce Latin letters in one mode and Hangul jamo in the other.",
      "Menu names move slightly between operating-system releases, so this guide describes the stable path and links to each platform owner’s current instructions. Adding an input source is separate from changing the display language. You can keep every menu in English—or any other language—and switch only the text you type.",
    ],
    quickAnswer:
      "Open your device’s Language, Keyboard, or Input Source settings; add Korean; choose 2-Set Korean when offered; then switch inputs with Windows+Space, Control+Space or the Globe/Fn key on Mac, or the globe/space-bar language control on mobile.",
    sections: [
      {
        id: "before-starting",
        title: "Before you change a setting",
        paragraphs: [
          "Save any important form you are editing and note the input indicator in the taskbar or menu bar. A language switch changes what key presses produce, including on a password screen. It does not translate existing text and normally does not change the device interface.",
          "Choose the 2-set layout—often written 2-Set Korean, 두벌식, or Korean 2-Set—unless you already know that you need a specialist layout. Seoul Keys lessons use 2-set key positions. On phones, a 10-key or handwriting layout can be convenient for messaging but will not match desktop typing drills.",
        ],
        bullets: [
          "Keep your normal Latin keyboard installed.",
          "Add Korean as an additional input, not a replacement.",
          "Prefer 2-set for lessons that show a desktop key map.",
          "Learn the language-switch shortcut before opening a password field.",
        ],
      },
      {
        id: "windows",
        title: "Windows 11 and Windows 10",
        paragraphs: [
          "Microsoft separates the Windows display language from keyboard layouts. Depending on what is already installed, you may be able to add a Korean keyboard under an existing language entry, or you may first add Korean to Preferred languages. You do not need to select Korean as the Windows display language.",
        ],
        steps: [
          "Open Start → Settings → Time & language → Language & region.",
          "If Korean is absent, choose Add a language, search for Korean, and install it. Leave “Set as my Windows display language” off unless you intentionally want Korean menus.",
          "Open the language’s options and confirm that a Korean keyboard/input method is listed.",
          "Use the input indicator in the taskbar to select Korean, or hold the Windows key and tap Space to cycle through installed layouts.",
          "When the Korean IME is active, confirm that its A/가 state is set to 가 for Hangul rather than Latin input.",
        ],
        note: {
          title: "Password warning",
          body:
            "The selected layout can also apply at sign-in. Check the input indicator before entering a password so an unexpected layout does not produce the wrong characters.",
        },
      },
      {
        id: "mac",
        title: "macOS",
        paragraphs: [
          "On current macOS versions, keyboard languages are called input sources. Adding Korean enables the Input menu and lets you choose how a shortcut changes sources. Apple also offers an option to use Caps Lock to switch between a non-Latin source and the last-used Latin source.",
        ],
        steps: [
          "Choose Apple menu → System Settings → Keyboard.",
          "Find Text Input and choose Edit.",
          "Select the add button, choose Korean, then choose 2-Set Korean.",
          "Enable Show Input menu in menu bar if you want a visible source indicator.",
          "Switch with the configured Control+Space shortcut, the Globe/Fn key, the Input menu, or the optional Caps Lock setting.",
        ],
      },
      {
        id: "iphone-ipad",
        title: "iPhone and iPad",
        paragraphs: [
          "iOS and iPadOS keep additional keyboards under General settings. The globe key appears when more than one keyboard is enabled. Hardware keyboards connected to an iPad have their own layout settings, so check both the on-screen and hardware sections if they behave differently.",
        ],
        steps: [
          "Open Settings → General → Keyboard → Keyboards.",
          "Tap Add New Keyboard, choose Korean, and select the 2-set option when prompted.",
          "In any text field, tap or hold the globe key to choose Korean.",
          "For an attached hardware keyboard, open Settings → General → Keyboard → Hardware Keyboard and confirm the Korean layout.",
        ],
      },
      {
        id: "android",
        title: "Android with Gboard",
        paragraphs: [
          "Android manufacturers can rename settings, but Gboard’s language menu is consistent. Adding a Gboard language does not change the Android system language. If another keyboard app is active, use that keyboard’s own language settings or select Gboard first.",
        ],
        steps: [
          "Tap a text field so Gboard appears, then open Gboard Settings.",
          "Choose Languages → Add keyboard → Korean.",
          "Select the layout you want and choose Done; use 2-set when you want the desktop-style Seoul Keys map.",
          "Hold the space bar to switch languages, or enable the language-switch key in Gboard Preferences.",
        ],
      },
      {
        id: "test",
        title: "Run a thirty-second setup test",
        paragraphs: [
          "Open a plain note so autocomplete does not hide the result. Switch to Korean and press G, K, S on a QWERTY-labelled keyboard. A working 2-set input method produces 한. Switch back and type the same keys again; you should see gks. This A/B test proves both the input source and the switch shortcut are working.",
          "If you see individual compatibility letters such as ㅎㅏㄴ instead of one block, the app or field may not be using a normal Korean input method. Test in the operating system’s basic Notes or text editor. If the block composes there, the original app—not the keyboard installation—is the likely cause.",
        ],
        examples: [
          { label: "Korean mode", keys: "gks", result: "한", note: "The three letters compose into one block." },
          { label: "Latin mode", keys: "gks", result: "gks", note: "The same positions stay Latin after switching back." },
          { label: "Second check", keys: "dkssud", result: "안녕", note: "Two syllables confirm continued composition." },
        ],
      },
    ],
    drill: {
      title: "Input-switch confidence check",
      instructions:
        "In a blank note, alternate between Latin and Korean mode for each line. Do not use copy and paste.",
      items: [
        { label: "Latin", keys: "seoul", result: "seoul", note: "Begin in your Latin input source." },
        { label: "Korean", keys: "tjdnf", result: "서울", note: "Switch once before typing." },
        { label: "Latin", keys: "hangul", result: "hangul", note: "Switch back without using the mouse if possible." },
        { label: "Korean", keys: "gksrmf", result: "한글", note: "Confirm block composition." },
      ],
      checkpoint:
        "Setup is complete when you can switch twice, produce 서울 and 한글, and return to your Latin keyboard without opening Settings.",
    },
    mistakes: [
      {
        mistake: "Changing the whole display language",
        fix: "Add an input source or keyboard layout only. A Korean interface is optional and unrelated to typing Hangul.",
      },
      {
        mistake: "Selecting a mobile 10-key layout for desktop lessons",
        fix: "Choose 2-set Korean so the keys match the desktop map used in practice.",
      },
      {
        mistake: "Seeing Latin letters while the Korean source appears active",
        fix: "On Windows, check whether the Korean IME itself is in A (Latin) or 가 (Hangul) mode.",
      },
      {
        mistake: "Assuming the keyboard is broken because one website fails",
        fix: "Test in Notes or a plain text editor. If composition works there, inspect the original app or browser field.",
      },
    ],
    faqs: [
      {
        question: "Will adding Korean change my phone or computer language?",
        answer:
          "No. Input language and display language are separate settings. Follow the steps above without selecting an option that explicitly changes the display language.",
      },
      {
        question: "Can I type Korean on an English physical keyboard?",
        answer:
          "Yes. The operating system remaps existing key positions. Printed Hangul labels are convenient but not required.",
      },
      {
        question: "Which Korean layout should a beginner choose?",
        answer:
          "Choose 2-set Korean for a direct match with standard desktop learning materials and Seoul Keys. Explore mobile-specific layouts later if they suit your messaging habits.",
      },
      {
        question: "Why does Windows show Korean but still type English?",
        answer:
          "The Korean IME can have an internal A/가 toggle. Select 가, often with the right Alt or dedicated Hangul key depending on hardware and settings.",
      },
    ],
    references: [microsoftKeyboard, appleMacKeyboard, appleIphoneKeyboard, gboardKeyboard],
    related: ["korean-keyboard-layout", "korean-touch-typing", "korean-typing-mistakes"],
  },
  {
    slug: "hangul-syllable-blocks",
    title: "How Hangul Syllable Blocks Form While You Type",
    cardTitle: "Build Hangul syllable blocks",
    description:
      "Understand initial consonants, vowels, and final consonants; learn why Korean letters rearrange into square blocks as you type; and practise predictable composition.",
    eyebrow: "Hangul structure · Core concept",
    readMinutes: 11,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "purple",
    keywords: [
      "Hangul syllable blocks",
      "how Korean letters combine",
      "Hangul typing order",
      "Korean syllable composition",
      "initial medial final Hangul",
    ],
    learningGoals: [
      "Identify the initial, vowel, and optional final positions in a modern Hangul block.",
      "Predict whether a vowel will appear beside or below its initial consonant.",
      "Type letters in sound order while letting the input method arrange the block.",
      "Recognise when a new vowel starts or reshapes the next syllable.",
    ],
    intro: [
      "Hangul looks compact because letters that belong to one spoken syllable share a square block. The block is visual; the typing process is linear. You press an initial consonant, then a vowel, then an optional final consonant. The Korean input method redraws the developing block after each keystroke.",
      "This is why a word can seem to move while you type it. Nothing is being entered out of order. The software is deciding which legal syllable structure the latest letter completes. Understanding three positions—initial, vowel, and final—removes most of the mystery.",
    ],
    quickAnswer:
      "Type each syllable as initial consonant + vowel + optional final consonant. A vertical vowel such as ㅏ sits to the right of the initial; a horizontal vowel such as ㅗ sits below it. The input method handles that geometry automatically.",
    sections: [
      {
        id: "three-positions",
        title: "One block has two required positions and one optional position",
        paragraphs: [
          "A modern Korean syllable block begins with an initial consonant (초성) and a vowel (중성). It may end with a final consonant (종성), commonly called batchim. The patterns are therefore CV or CVC. 가 contains ㄱ + ㅏ; 한 contains ㅎ + ㅏ + ㄴ.",
          "A syllable pronounced without an audible opening consonant still needs an initial position in writing. Korean uses ㅇ as a silent initial before a vowel: 아 is ㅇ + ㅏ, and 우 is ㅇ + ㅜ. In the final position, the same letter represents the /ng/ sound, as in 강.",
        ],
        table: {
          caption: "The structural positions in common syllables",
          headers: ["Block", "Initial", "Vowel", "Final", "QWERTY keys"],
          rows: [
            ["가", "ㄱ", "ㅏ", "—", "r + k"],
            ["너", "ㄴ", "ㅓ", "—", "s + j"],
            ["한", "ㅎ", "ㅏ", "ㄴ", "g + k + s"],
            ["공", "ㄱ", "ㅗ", "ㅇ", "r + h + d"],
            ["읽", "ㅇ", "ㅣ", "ㄹ + ㄱ", "d + l + f + r"],
          ],
        },
      },
      {
        id: "block-shapes",
        title: "The vowel determines the block’s visible shape",
        paragraphs: [
          "Vowels with a vertical main stroke—such as ㅏ, ㅓ, ㅣ, ㅐ, and ㅔ—usually sit to the right of the initial consonant. This produces a side-by-side upper structure: ㄱ + ㅏ becomes 가. Vowels with a horizontal main stroke—such as ㅗ, ㅜ, and ㅡ—sit below the initial: ㄱ + ㅗ becomes 고.",
          "A final consonant goes underneath the combined initial and vowel in both designs. 한 places ㄴ below 하; 공 places ㅇ below 고. Complex vowels can make the internal drawing more elaborate, but your input order remains initial, vowel components, final. You never need a layout command for “right” or “below.”",
        ],
        bullets: [
          "Vertical family: ㅏ ㅑ ㅓ ㅕ ㅣ ㅐ ㅔ and related combinations.",
          "Horizontal family: ㅗ ㅛ ㅜ ㅠ ㅡ and combinations that begin with them.",
          "Final consonants occupy the bottom zone of the completed block.",
          "Font design changes proportions, not the linguistic order.",
        ],
      },
      {
        id: "composition-in-motion",
        title: "Watch a block change after every key",
        paragraphs: [
          "Consider the keys G–K–S for 한. G produces ㅎ. K adds ㅏ and the display becomes 하. S can serve as a legal final consonant, so the display becomes 한. Add K next, and a standard input method can reinterpret that ㄴ as the initial of a new syllable, giving 하나 from ㅎㅏㄴㅏ.",
          "This provisional behavior is useful: the input method delays committing a boundary until later keys make the structure clear. Space, punctuation, cursor movement, or a completed following syllable normally commits the block. If a word changes unexpectedly, inspect the exact letter sequence before assuming a keyboard fault.",
        ],
        examples: [
          { label: "Two stages", keys: "r → rk", result: "ㄱ → 가", note: "The vowel creates the first complete block." },
          { label: "Three stages", keys: "g → gk → gks", result: "ㅎ → 하 → 한", note: "ㄴ becomes the final." },
          { label: "New vowel", keys: "gksk", result: "하나", note: "The last vowel makes ㄴ the next initial." },
          { label: "Horizontal vowel", keys: "rh", result: "고", note: "ㅗ is drawn below ㄱ." },
          { label: "Two blocks", keys: "gkrry", result: "학교", note: "학 is completed before 교." },
        ],
      },
      {
        id: "unicode-model",
        title: "A displayed block is a character, not a tiny text box",
        paragraphs: [
          "Computers can represent modern Hangul syllables as precomposed Unicode characters. Unicode also defines how those syllables decompose into leading consonant, vowel, and optional trailing consonant jamo. That formal model mirrors the structure learners use, even though ordinary keyboards hide the code-point work.",
          "Copying a completed syllable such as 한 therefore behaves like copying one character in many applications, not three visibly separate tiles. Compatibility jamo such as ㅎㅏㄴ may remain separate when pasted from an unusual source. If search, cursor movement, or backspace behaves strangely, first compare the text in a plain editor rather than retyping faster.",
        ],
        note: {
          title: "Typing order and pronunciation are different questions",
          body:
            "Keyboard composition follows written jamo order. Sound-change rules may alter how a completed word is pronounced, but they do not change the spelling you type.",
        },
      },
      {
        id: "read-before-speed",
        title: "Read the block, then rehearse the key path",
        paragraphs: [
          "For a new word, separate blocks with a pencil or your eyes, then name the jamo inside each one. Convert those jamo to physical keys only after the spelling is clear. This avoids a common failure: memorizing a long Latin-looking key string without understanding the Korean word.",
          "Practise one block at a time, then join the blocks without pauses. For 한국, rehearse 한 (ㅎㅏㄴ), 국 (ㄱㅜㄱ), then 한국. The final run should feel like two small gestures rather than six disconnected key searches.",
        ],
        steps: [
          "Circle or identify each visible syllable block.",
          "Say its initial, vowel, and final jamo in order.",
          "Locate those jamo on the 2-set keyboard.",
          "Type slowly and check the block after its vowel arrives.",
          "Join the whole word only after each block is reliable.",
        ],
      },
    ],
    drill: {
      title: "Build five blocks deliberately",
      instructions:
        "Type the keys one at a time and watch the active block change. Backspace the whole attempt before starting the next item.",
      items: [
        { label: "Vertical, open", keys: "sk", result: "나", note: "ㄴ + ㅏ" },
        { label: "Horizontal, open", keys: "an", result: "무", note: "ㅁ + ㅜ" },
        { label: "Vertical, closed", keys: "gks", result: "한", note: "ㅎ + ㅏ + ㄴ" },
        { label: "Horizontal, closed", keys: "rnr", result: "국", note: "ㄱ + ㅜ + ㄱ" },
        { label: "Two blocks", keys: "gksrnr", result: "한국", note: "한 + 국" },
      ],
      checkpoint:
        "Move on when you can name the three structural positions in 한 and explain why 고 is drawn differently from 가 even though both use two keystrokes.",
    },
    mistakes: [
      {
        mistake: "Trying to type the visual top-left or bottom position",
        fix: "Ignore geometry while typing. Enter initial, vowel, then final; the input method arranges the square.",
      },
      {
        mistake: "Omitting ㅇ before a vowel",
        fix: "Every modern block requires an initial slot. Type ㅇ for 아, 어, 오, 우, and other vowel-initial syllables.",
      },
      {
        mistake: "Treating a pronunciation change as a spelling change",
        fix: "Type the dictionary spelling. Learn sound-change rules separately from keyboard composition.",
      },
      {
        mistake: "Panicking when the active block reshapes",
        fix: "The input method is waiting for boundary evidence. Finish the intended jamo sequence, then inspect the result.",
      },
    ],
    faqs: [
      {
        question: "Why are Korean letters written in squares?",
        answer:
          "Letters for one syllable are grouped into a block. The vowel orientation and presence of a final consonant determine the internal arrangement.",
      },
      {
        question: "Do I type the bottom consonant last?",
        answer:
          "Yes. The written order is initial, vowel, optional final, which also matches the normal typing order.",
      },
      {
        question: "Why is ㅇ silent in 아 but pronounced in 강?",
        answer:
          "Its role depends on position. As an initial it fills the required slot without adding a consonant sound; as a final it represents /ng/.",
      },
      {
        question: "Can one block contain two final consonant letters?",
        answer:
          "Yes. Some spellings use a final cluster, such as ㄺ in 읽. Type both component consonants after the vowel.",
      },
    ],
    references: [unicodeHangul],
    related: ["korean-keyboard-layout", "type-batchim", "type-double-consonants-and-vowels"],
  },
  {
    slug: "type-batchim",
    title: "How to Type Batchim and Korean Final Consonants",
    cardTitle: "Type batchim without guessing",
    description:
      "Learn how Korean final consonants enter a syllable block, how double finals are typed, why blocks sometimes re-form, and how to separate spelling from pronunciation.",
    eyebrow: "Final consonants · Intermediate basics",
    readMinutes: 12,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "pink",
    keywords: [
      "type batchim",
      "Korean final consonants keyboard",
      "Hangul batchim typing",
      "double batchim keys",
      "Korean typing final consonant",
    ],
    learningGoals: [
      "Place a consonant in the final position by typing it after the vowel.",
      "Type written final clusters as two component consonants.",
      "Understand how following letters clarify a syllable boundary.",
      "Keep pronunciation rules from changing the spelling entered on the keyboard.",
    ],
    intro: [
      "Batchim (받침) is the consonant material written at the bottom of a Hangul block. There is no special batchim key. A consonant becomes final because it arrives after the vowel of an active syllable: ㅂ + ㅏ gives 바, and another ㅂ gives 밥.",
      "The challenge is not finger technique; it is boundary awareness. A consonant after a vowel might close the current block, while a later vowel can show that the consonant should begin the next block. Korean input methods update the display as that evidence arrives.",
    ],
    quickAnswer:
      "Type the syllable’s initial and vowel, then type its written final consonant. For 밥, press Q–K–Q. For a final cluster, press both consonants in spelling order: 값 is ㄱ–ㅏ–ㅂ–ㅅ, typed R–K–Q–T on QWERTY-labelled keys.",
    sections: [
      {
        id: "single-finals",
        title: "A single batchim is simply the next consonant",
        paragraphs: [
          "After an initial and vowel have formed an open syllable, a compatible consonant closes it. The key itself is identical whether the consonant appears initially or finally. Q produces ㅂ at the start of 바 and at the bottom of 밥; position comes from sequence, not a second keyboard layer.",
          "Train with families that keep the initial and vowel steady while the final changes: 가, 간, 감, 강, 갈. This makes the visual effect obvious and lets your left hand practise returning after the right-hand vowel.",
        ],
        table: {
          caption: "Single-final examples on the 2-set layout",
          headers: ["Block", "Jamo order", "QWERTY keys", "Final"],
          rows: [
            ["한", "ㅎ + ㅏ + ㄴ", "g + k + s", "ㄴ"],
            ["밥", "ㅂ + ㅏ + ㅂ", "q + k + q", "ㅂ"],
            ["집", "ㅈ + ㅣ + ㅂ", "w + l + q", "ㅂ"],
            ["먹", "ㅁ + ㅓ + ㄱ", "a + j + r", "ㄱ"],
            ["공", "ㄱ + ㅗ + ㅇ", "r + h + d", "ㅇ"],
          ],
        },
      },
      {
        id: "clusters",
        title: "Type a written final cluster one consonant at a time",
        paragraphs: [
          "Some Korean spellings place two consonant letters in the final zone. These are called 겹받침, often translated as double or complex batchim. The keyboard still needs no special command: type the first final component, then the second. 값 is ㄱ + ㅏ + ㅂ + ㅅ; 읽 is ㅇ + ㅣ + ㄹ + ㄱ.",
          "The spoken result may not reveal both written letters in isolation. That is a pronunciation topic, not a reason to omit a key. When copying or composing text, start from the correct spelling and type every jamo represented in it.",
        ],
        examples: [
          { label: "ㅄ final", keys: "rkqt", result: "값", note: "ㄱ + ㅏ + ㅂ + ㅅ" },
          { label: "ㄺ final", keys: "dlfr", result: "읽", note: "ㅇ + ㅣ + ㄹ + ㄱ" },
          { label: "ㄵ final", keys: "dksw", result: "앉", note: "ㅇ + ㅏ + ㄴ + ㅈ" },
          { label: "Word with ㄺ", keys: "dlfrek", result: "읽다", note: "읽 + 다" },
          { label: "Word with ㅄ", keys: "djqtdjdy", result: "없어요", note: "없 + 어 + 요" },
        ],
      },
      {
        id: "boundaries",
        title: "The next letter confirms the boundary",
        paragraphs: [
          "While a syllable is active, an input method makes the best legal block from the keys received so far. In 가나, the sequence ㄱ–ㅏ–ㄴ briefly allows 간, but the following ㅏ cannot stand alone and shows that ㄴ should begin 나. The display settles as 가나.",
          "A genuinely vowel-initial Korean syllable is written with ㅇ, so 먹어 is typed ㅁ–ㅓ–ㄱ–ㅇ–ㅓ. The ㅇ explicitly begins 어. This is different from adding a bare vowel after 먹. Think in the word’s written blocks rather than trying to force a pause between them.",
        ],
        examples: [
          { label: "Consonant moves to new initial", keys: "rksk", result: "가나", note: "ㄱㅏ + ㄴㅏ" },
          { label: "Silent initial starts a block", keys: "ajrdj", result: "먹어", note: "먹 + 어; ㅇ begins 어." },
          { label: "Written ㅇ after batchim", keys: "wlqdl", result: "집이", note: "집 + 이" },
          { label: "Final cluster before a particle", keys: "Rhcdmf", result: "꽃을", note: "Shift+R makes ㄲ; 을 begins with ㅇ." },
        ],
        note: {
          title: "Do not insert spaces between syllables",
          body:
            "Korean spacing separates words or grammatical groups, not every block. Type all syllables of a word continuously and let the spelling define their boundaries.",
        },
      },
      {
        id: "spelling-sound",
        title: "Type the spelling, even when speech sounds different",
        paragraphs: [
          "Final consonants participate in Korean sound rules. A final may be released differently before the next syllable, assimilate to a neighbor, or represent fewer audible contrasts at the end of a word. Those patterns are essential for listening and speaking, but the keyboard records orthography.",
          "If you learn a word through audio, confirm its spelling before turning it into a typing drill. For example, the cluster in 읽다 must still be entered as ㄹ + ㄱ even though everyday pronunciation does not sound like two separately released final consonants. Accurate typing starts with an accurate written model.",
        ],
        bullets: [
          "Copy all jamo shown in the dictionary spelling.",
          "Do not replace a final with the consonant you think you hear.",
          "Keep a separate pronunciation note when a sound rule is important.",
          "Correct spelling first; then repeat the whole word for motor memory.",
        ],
      },
      {
        id: "backspace",
        title: "Use Backspace as a diagnostic tool",
        paragraphs: [
          "Many Korean input methods undo an active block step by step: removing the latest final component before removing the vowel or initial. Behavior can differ after a block has been committed or inside a particular app. Watch what disappears instead of tapping Backspace repeatedly.",
          "When a cluster is wrong, it is often faster to erase to the vowel and re-enter both finals deliberately. Repeated corrections can teach the wrong gesture, so finish with two or three clean versions of the whole word.",
        ],
      },
    ],
    drill: {
      title: "Batchim ladder",
      instructions:
        "Type each item slowly enough to see the bottom of the block change. Say the final jamo before pressing its key.",
      items: [
        { label: "No final", keys: "rk", result: "가", note: "Open syllable." },
        { label: "ㄴ final", keys: "rks", result: "간", note: "Add S after the vowel." },
        { label: "ㅁ final", keys: "rka", result: "감", note: "Return to left home row." },
        { label: "ㅇ final", keys: "rkd", result: "강", note: "D produces final ㅇ." },
        { label: "ㅄ cluster", keys: "rkqt", result: "값", note: "Enter both written components." },
      ],
      checkpoint:
        "You are ready when you can type a single final and a cluster without searching for a special batchim mode, and can explain why spelling—not pronunciation—chooses the keys.",
    },
    mistakes: [
      {
        mistake: "Looking for a dedicated final-consonant key",
        fix: "Use the ordinary consonant key after the vowel. Sequence determines that it is batchim.",
      },
      {
        mistake: "Typing only the consonant that seems audible",
        fix: "Follow the written jamo. A final cluster needs both components even when speech neutralizes or links sounds.",
      },
      {
        mistake: "Adding a space to force the next syllable",
        fix: "Type the word continuously. Use ㅇ when the written next syllable begins with a vowel.",
      },
      {
        mistake: "Correcting a wrong cluster with frantic Backspace taps",
        fix: "Watch each deletion, return to the stable vowel, and rebuild the ending once.",
      },
    ],
    faqs: [
      {
        question: "Is batchim a different set of letters?",
        answer:
          "No. It is a structural position at the bottom of a syllable. Most final letters use the same consonant keys as initials.",
      },
      {
        question: "How do I type two consonants at the bottom?",
        answer:
          "Type both component consonants in their written order after the vowel. The input method combines legal pairs into a final cluster.",
      },
      {
        question: "Why did my final consonant move into the next block?",
        answer:
          "A following vowel showed that the consonant could serve as the next initial. Check the intended spelling and include ㅇ when the next written syllable is vowel-initial.",
      },
      {
        question: "Should I type Korean as it sounds?",
        answer:
          "Type standard spelling. Pronunciation rules explain speech, while the keyboard encodes the written jamo.",
      },
    ],
    references: [unicodeHangul],
    related: ["hangul-syllable-blocks", "type-double-consonants-and-vowels", "korean-typing-mistakes"],
  },
  {
    slug: "type-double-consonants-and-vowels",
    title: "How to Type Korean Double Consonants and Compound Vowels",
    cardTitle: "Master Shift and compound vowels",
    description:
      "Type tense Korean consonants with Shift, build compound vowels in the correct order, and distinguish shifted letters from two-letter combinations.",
    eyebrow: "Shift keys · Vowel combinations",
    readMinutes: 11,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "yellow",
    keywords: [
      "type Korean double consonants",
      "type Korean compound vowels",
      "Korean keyboard Shift",
      "type ㅘ ㅝ ㅢ",
      "Korean tense consonants keyboard",
    ],
    learningGoals: [
      "Use Shift for the five tense consonants ㅃ, ㅉ, ㄸ, ㄲ, and ㅆ.",
      "Type ㅒ and ㅖ with their shifted single-key positions.",
      "Build common compound vowels by pressing two ordinary vowel keys in order.",
      "Diagnose a failed combination by separating its component jamo.",
    ],
    intro: [
      "The 2-set keyboard has two different ideas that English-language guides sometimes call “double.” Tense consonants are shifted versions of five top-row consonant keys. Compound vowels are usually sequences of two vowel keys that the input method combines. Mixing those mechanisms causes unnecessary Shift presses.",
      "Learn the small Shift set first, then treat compound vowels as short right-hand gestures. You are not asking the keyboard to decorate a letter; you are entering the jamo components defined by Korean spelling.",
    ],
    quickAnswer:
      "Hold Shift with Q, W, E, R, or T for ㅃ, ㅉ, ㄸ, ㄲ, or ㅆ. Shift+O and Shift+P give ㅒ and ㅖ. For vowels such as ㅘ or ㅝ, do not hold Shift: type ㅗ then ㅏ (H–K), or ㅜ then ㅓ (N–J).",
    sections: [
      {
        id: "shift-set",
        title: "Seven letters use a shifted key",
        paragraphs: [
          "The five tense consonants share keys with their plain counterparts. Q gives ㅂ while Shift+Q gives ㅃ; W gives ㅈ while Shift+W gives ㅉ. The same pattern continues for ㄸ, ㄲ, and ㅆ on E, R, and T. Release Shift before typing the following vowel.",
          "Two vowels are also shifted: Shift+O gives ㅒ and Shift+P gives ㅖ. Their unshifted keys produce ㅐ and ㅔ. These seven letters are the entire shifted Hangul set on the standard 2-set layout.",
        ],
        table: {
          caption: "Shifted letters on the Korean 2-set keyboard",
          headers: ["Keys", "Base output", "Shifted output", "Example"],
          rows: [
            ["Q / Shift+Q", "ㅂ", "ㅃ", "빠"],
            ["W / Shift+W", "ㅈ", "ㅉ", "짜"],
            ["E / Shift+E", "ㄷ", "ㄸ", "또"],
            ["R / Shift+R", "ㄱ", "ㄲ", "까"],
            ["T / Shift+T", "ㅅ", "ㅆ", "싸"],
            ["O / Shift+O", "ㅐ", "ㅒ", "얘"],
            ["P / Shift+P", "ㅔ", "ㅖ", "예"],
          ],
        },
        note: {
          title: "Shift is momentary",
          body:
            "Hold Shift only for the affected consonant or vowel key. Caps Lock can behave inconsistently across input methods and makes it easy to shift more letters than intended.",
        },
      },
      {
        id: "compound-vowels",
        title: "Most compound vowels are two-key paths",
        paragraphs: [
          "Compound vowels that begin with ㅗ, ㅜ, or ㅡ use two unshifted vowel keys. Type the first component, then the second while the syllable is active. H–K produces ㅗ + ㅏ → ㅘ; N–J produces ㅜ + ㅓ → ㅝ.",
          "The useful pattern is spatial as well as linguistic. The first key selects a horizontal base vowel, and the second adds ㅏ, ㅐ, ㅣ, ㅓ, or ㅔ. Rehearse each pair as one smooth right-hand gesture, but remain able to name both components when debugging.",
        ],
        table: {
          caption: "Frequent compound vowels and their component keys",
          headers: ["Vowel", "Components", "QWERTY keys", "Example"],
          rows: [
            ["ㅘ", "ㅗ + ㅏ", "H + K", "와"],
            ["ㅙ", "ㅗ + ㅐ", "H + O", "왜"],
            ["ㅚ", "ㅗ + ㅣ", "H + L", "외"],
            ["ㅝ", "ㅜ + ㅓ", "N + J", "워"],
            ["ㅞ", "ㅜ + ㅔ", "N + P", "웨"],
            ["ㅟ", "ㅜ + ㅣ", "N + L", "위"],
            ["ㅢ", "ㅡ + ㅣ", "M + L", "의"],
          ],
        },
      },
      {
        id: "whole-blocks",
        title: "Put the Shift or vowel path inside a normal block",
        paragraphs: [
          "A tense consonant still occupies the initial or final position of an ordinary block. 까 is ㄲ + ㅏ, so press Shift+R, release Shift, then K. A compound vowel still follows an initial: 왜 is ㅇ + ㅙ, so press D, H, O.",
          "When a word contains both mechanisms, finish one local gesture before starting the next. 뛰어 begins with ㄸ and ㅟ: Shift+E, then N–L. The next syllable 어 begins with ㅇ on D. Thinking in components prevents one held Shift key from contaminating the vowel sequence.",
        ],
        examples: [
          { label: "Tense ㄲ", keys: "Rk", result: "까", note: "Shift+R, then K." },
          { label: "Tense ㅆ", keys: "Tkd", result: "쌍", note: "Shift+T, K, D." },
          { label: "Compound ㅙ", keys: "dho", result: "왜", note: "ㅇ + ㅗ + ㅐ" },
          { label: "Compound ㅝ", keys: "dnjs", result: "원", note: "ㅇ + ㅜ + ㅓ + ㄴ" },
          { label: "Both mechanisms", keys: "Enldj", result: "뛰어", note: "ㄸ + ㅜ + ㅣ, then ㅇ + ㅓ" },
        ],
      },
      {
        id: "why-combination-fails",
        title: "When letters refuse to combine, check order and commitment",
        paragraphs: [
          "A compound vowel must arrive while the same syllable is active and in a legal component order. ㅗ followed by ㅏ can form ㅘ; reversing the keys does not ask for the same vowel. A space, cursor move, or punctuation mark can commit the block before the second component arrives.",
          "Autocomplete and mobile keyboards may show suggestions, but the underlying spelling order remains the same. Test a troublesome pair in a plain note, type an initial ㅇ first, and then add the two vowel components. For example, D–H–K should form 와. If it does, the keyboard is composing normally.",
        ],
        steps: [
          "Name the target vowel and its two written components.",
          "Confirm Korean input is active.",
          "Begin a test block with ㅇ on D.",
          "Press the first vowel component and then the second without Space.",
          "Compare the result before adding a final consonant.",
        ],
      },
      {
        id: "practice-groups",
        title: "Practise contrast groups, not an alphabetical list",
        paragraphs: [
          "Contrast one base consonant with its tense partner: 바–빠, 자–짜, 다–따, 가–까, 사–싸. This trains the timing of Shift and makes an accidental plain consonant obvious. Keep the vowel constant until the hand movement is stable.",
          "For compound vowels, group by the first component: ㅘ–ㅙ–ㅚ all begin on H (ㅗ), while ㅝ–ㅞ–ㅟ begin on N (ㅜ). The family structure reduces seven combinations to two starting points plus ㅢ.",
        ],
        bullets: [
          "Release Shift before the vowel.",
          "Use the opposite hand for Shift when comfortable, reducing hand tension.",
          "Pause after a wrong result and name the missing component.",
          "End a practice set with a real word, not an isolated letter.",
        ],
      },
    ],
    drill: {
      title: "Shift and glide circuit",
      instructions:
        "Type each result three times accurately. Capital Latin letters represent a shifted key, not Caps Lock.",
      items: [
        { label: "Plain / tense", keys: "rk Rk", result: "가 까", note: "Feel Shift only on the first key of 까." },
        { label: "Plain / tense", keys: "tk Tk", result: "사 싸", note: "Release Shift before K." },
        { label: "ㅗ family", keys: "dhk dho dhl", result: "와 왜 외", note: "Each block begins with ㅇ on D." },
        { label: "ㅜ family", keys: "dnj dnp dnl", result: "워 웨 위", note: "Each vowel begins on N." },
        { label: "ㅡ family", keys: "dml", result: "의", note: "ㅇ + ㅡ + ㅣ" },
      ],
      checkpoint:
        "Move on when you can state which seven keys have shifted Hangul output and can build ㅘ and ㅝ without looking at the map.",
    },
    mistakes: [
      {
        mistake: "Holding Shift for a compound vowel",
        fix: "Use ordinary sequential vowel keys for ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, and ㅢ.",
      },
      {
        mistake: "Keeping Shift down for the following vowel",
        fix: "Release it immediately after the tense consonant unless the next letter is specifically ㅒ or ㅖ.",
      },
      {
        mistake: "Reversing compound-vowel components",
        fix: "Learn the written decomposition: base ㅗ/ㅜ/ㅡ first, added vowel second.",
      },
      {
        mistake: "Using Caps Lock as Korean Shift mode",
        fix: "Use a normal Shift press. Caps Lock behavior is not the reliable model for a Korean IME.",
      },
    ],
    faqs: [
      {
        question: "Are Korean double consonants typed twice?",
        answer:
          "The five tense consonants are normally typed with Shift plus their base key, not by pressing the base key twice.",
      },
      {
        question: "Why is ㅘ typed with two keys but ㅒ with one shifted key?",
        answer:
          "That is how the standard 2-set layout allocates its limited positions. ㅘ is composed from ㅗ + ㅏ, while ㅒ has a dedicated shifted position on O.",
      },
      {
        question: "Can a tense consonant be batchim?",
        answer:
          "Korean orthography allows only a restricted set of final forms. Learn the spelling of the word rather than assuming every shifted initial has a matching final use.",
      },
      {
        question: "Why did ㅗ and ㅏ stay separate?",
        answer:
          "The first syllable may already have been committed, the order may be reversed, or the field may not support normal IME composition. Test ㅇ + ㅗ + ㅏ in a plain editor.",
      },
    ],
    references: [unicodeHangul],
    related: ["korean-keyboard-layout", "hangul-syllable-blocks", "type-batchim"],
  },
  {
    slug: "korean-touch-typing",
    title: "Korean Touch Typing: Finger Placement and Practice",
    cardTitle: "Build Korean touch-typing technique",
    description:
      "Learn practical finger zones for the Korean 2-set keyboard, build left-right rhythm, reduce visual checking, and practise Hangul accurately without Korean keycaps.",
    eyebrow: "Technique · Muscle memory",
    readMinutes: 12,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "lime",
    keywords: [
      "Korean touch typing",
      "Korean keyboard finger placement",
      "Korean typing practice",
      "type Hangul without looking",
      "Korean typing technique",
    ],
    learningGoals: [
      "Assign the 2-set keyboard to stable finger zones.",
      "Use consonant–vowel alternation to develop a relaxed typing rhythm.",
      "Reduce dependence on printed Hangul keycaps or an always-visible map.",
      "Measure accuracy before attempting higher character speed.",
    ],
    intro: [
      "Touch typing in Korean uses the same physical discipline as touch typing in Latin scripts—stable home position, small movements, and eyes on the output—but the rhythm feels different. In 2-set Korean, the left hand produces most consonants while the right produces vowels. Many syllables therefore alternate between hands.",
      "You do not need Korean keycaps to learn. In fact, short periods without labels can strengthen retrieval. The goal is not to recite every key in isolation; it is to build repeatable movements for frequent syllable shapes.",
    ],
    quickAnswer:
      "Rest your fingers on A–S–D–F and J–K–L–; as on ordinary QWERTY touch typing. Keep each finger responsible for its vertical zone, let index fingers cover the extra inner columns, and practise slow consonant–vowel patterns while looking at the Hangul result.",
    sections: [
      {
        id: "finger-zones",
        title: "Keep the familiar QWERTY finger zones",
        paragraphs: [
          "The 2-set layout changes character output, not the physical geometry of the board. Start from the standard home position. Left pinky covers Q–A–Z, ring covers W–S–X, middle covers E–D–C, and index covers R–F–V plus T–G. The right hand mirrors that structure: index covers Y–H–B plus U–J–N, middle covers I–K–M, ring covers O–L, and pinky covers P and nearby punctuation.",
          "This is a training baseline, not a medical rule. Keyboard size, accessibility needs, and existing technique can require adaptation. What matters is consistency: a key should not be hunted by a different finger on every attempt.",
        ],
        table: {
          caption: "Practical finger zones for QWERTY-labelled 2-set Korean",
          headers: ["Finger", "Main keys", "Hangul examples"],
          rows: [
            ["Left pinky", "Q A Z", "ㅂ ㅁ ㅋ"],
            ["Left ring", "W S X", "ㅈ ㄴ ㅌ"],
            ["Left middle", "E D C", "ㄷ ㅇ ㅊ"],
            ["Left index", "R F V · T G", "ㄱ ㄹ ㅍ · ㅅ ㅎ"],
            ["Right index", "Y H B · U J N", "ㅛ ㅗ ㅠ · ㅕ ㅓ ㅜ"],
            ["Right middle", "I K M", "ㅑ ㅏ ㅡ"],
            ["Right ring", "O L", "ㅐ ㅣ"],
            ["Right pinky", "P", "ㅔ"],
          ],
        },
      },
      {
        id: "home-row",
        title: "Build a Korean home-row anchor",
        paragraphs: [
          "The home row yields ㅁ ㄴ ㅇ ㄹ ㅎ under the left hand and ㅗ ㅓ ㅏ ㅣ under the right. These letters already form many useful syllables: 나, 너, 로, 하, 이, 안, 말. Begin and end each short drill with your fingers returned to their home anchors.",
          "Use the raised markers on F and J rather than looking down. After any top- or bottom-row key, feel your index fingers return to those markers. A reliable return path prevents the gradual hand drift that causes bursts of unrelated errors.",
        ],
        examples: [
          { label: "Alternation", keys: "sk sj fh gk", result: "나 너 로 하", note: "Left consonant, right vowel." },
          { label: "Silent initial", keys: "dl dks", result: "이 안", note: "D supplies ㅇ." },
          { label: "Closed blocks", keys: "akf sks", result: "말 난", note: "Return left for the final." },
          { label: "Word", keys: "skfk", result: "나라", note: "A continuous four-key alternation." },
        ],
      },
      {
        id: "rhythm",
        title: "Let syllable structure create the rhythm",
        paragraphs: [
          "An open CV syllable often feels like left–right. A closed CVC block often feels left–right–left. Vowel-initial blocks can begin left as well because ㅇ sits on D. Compound vowels may ask the right hand for two keys in a row, while tense consonants add a brief Shift coordination.",
          "Practise these shapes as small gestures. Do not rush from one word to the next; release unnecessary tension at every space. If your shoulders rise or fingers strike hard, reduce the pace until the movement is quiet again.",
        ],
        bullets: [
          "CV: 나, 더, 고 — two-part gestures.",
          "CVC: 난, 먹, 공 — return for the final.",
          "Compound vowel: 와, 워, 의 — two right-hand vowel components.",
          "Tense initial: 까, 또, 싸 — one controlled Shift action.",
        ],
      },
      {
        id: "stop-looking",
        title: "Fade the key map instead of removing it suddenly",
        paragraphs: [
          "A map is feedback, not failure. Use it after an unsuccessful recall rather than before every key. Try the word once with the map hidden, reveal only the missed letter, then retry from the beginning. That sequence requires retrieval and immediately corrects it.",
          "Cover one keyboard row at a time if a fully hidden layout is frustrating. Another useful constraint is to keep your eyes on the target and allow yourself to glance only between words. The proportion of unassisted attempts should rise gradually as accuracy stays stable.",
        ],
        steps: [
          "Preview two or three target keys.",
          "Hide or look away from the map.",
          "Type one short word without correction.",
          "Check the first error and name the intended jamo.",
          "Retype the complete word accurately twice.",
        ],
      },
      {
        id: "measure",
        title: "Measure accuracy before speed",
        paragraphs: [
          "Speed scores can use words per minute, characters per minute, or keystrokes per minute, and Korean composition makes those measures differ. Compare sessions only when the site uses the same metric and text difficulty. A higher number with many corrections is not yet fluent typing.",
          "For early practice, track first-attempt accuracy and the number of times you looked at the map. Once accuracy stays near your chosen target—Seoul Keys lessons can provide immediate feedback—raise speed in small steps. If accuracy drops sharply, return to the last comfortable tempo.",
        ],
        note: {
          title: "A useful quality target",
          body:
            "Aim for controlled, repeatable typing around 95% accuracy before chasing a personal speed record. The exact threshold is a training choice, not a universal Korean-language rule.",
        },
      },
    ],
    drill: {
      title: "Three-minute home-row circuit",
      instructions:
        "Keep fingers anchored and eyes on the result. Type each group for thirty seconds, rest briefly, then repeat once.",
      items: [
        { label: "Open blocks", keys: "sk sj sh gk gl", result: "나 너 노 하 히", note: "Return to the home anchors after each space." },
        { label: "Finals", keys: "sks skf aks", result: "난 날 만", note: "Feel left–right–left." },
        { label: "Silent ㅇ", keys: "dk dj dh dn", result: "아 어 오 우", note: "D then a right-hand vowel." },
        { label: "Short words", keys: "skfk akdma", result: "나라 마음", note: "Keep a steady rather than fast tempo." },
      ],
      checkpoint:
        "Continue to wider rows when you can complete the circuit with stable finger assignments, relaxed hands, and no more than one map check per line.",
    },
    mistakes: [
      {
        mistake: "Using one index finger for most keys",
        fix: "Slow down and restore vertical finger zones. Speed built on hunting is difficult to scale.",
      },
      {
        mistake: "Staring at keycaps throughout the drill",
        fix: "Look only after a failed recall, then type the whole word again with eyes on the result.",
      },
      {
        mistake: "Practising at maximum speed from the first line",
        fix: "Set an accuracy target and increase tempo only after several clean repetitions.",
      },
      {
        mistake: "Holding tension between words",
        fix: "Use each space as a cue to release the hands, reset posture, and find F/J anchors.",
      },
    ],
    faqs: [
      {
        question: "Do I need Korean stickers to touch-type?",
        answer:
          "No. Stickers help initial orientation, but an on-screen map plus retrieval practice is enough. Touch typing ultimately depends on position memory rather than labels.",
      },
      {
        question: "Should I relearn touch typing if I already type QWERTY?",
        answer:
          "Keep your physical finger zones. You are learning new outputs and Korean syllable gestures, not a new keyboard geometry.",
      },
      {
        question: "Is Korean typing speed measured in words per minute?",
        answer:
          "Some tools use WPM, while others use characters or keystrokes per minute. Because methods differ, compare like with like and keep accuracy visible.",
      },
      {
        question: "What if a standard finger assignment is uncomfortable?",
        answer:
          "Adapt for your hardware or accessibility needs and prioritize a consistent, pain-free movement. Stop if typing causes pain.",
      },
    ],
    references: [microsoftKeyboard],
    related: ["korean-keyboard-layout", "korean-typing-practice-plan", "korean-typing-mistakes"],
  },
  {
    slug: "korean-typing-mistakes",
    title: "Korean Typing Mistakes: A Step-by-Step Troubleshooting Guide",
    cardTitle: "Fix Korean typing mistakes",
    description:
      "Diagnose Latin output, broken Hangul blocks, wrong keys, layout mismatches, Shift errors, and app-specific composition problems with a repeatable test.",
    eyebrow: "Troubleshooting · Quick diagnosis",
    readMinutes: 12,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "pink",
    keywords: [
      "Korean keyboard not working",
      "Korean typing mistakes",
      "Hangul not combining",
      "Korean keyboard types English",
      "fix Korean IME",
    ],
    learningGoals: [
      "Classify an error as input mode, key mapping, composition, spelling, or application behavior.",
      "Use a plain-text control test before changing settings.",
      "Read an incorrect result to locate the first wrong jamo.",
      "Correct a mistake without rehearsing the same faulty sequence repeatedly.",
    ],
    intro: [
      "A Korean typing error can come from five different layers: the selected input source, the 2-set key map, Hangul block composition, Korean spelling, or the app receiving the keystrokes. Randomly changing settings mixes those layers and can make a simple problem harder to find.",
      "Use one known control sequence instead. On a QWERTY-labelled 2-set layout, G–K–S should produce 한. What appears after those three presses tells you where to look next.",
    ],
    quickAnswer:
      "Test G–K–S in a plain note. If you see gks, switch input language; if you see the wrong jamo, check the selected layout or physical key positions; if you see ㅎㅏㄴ separately, test composition in another app; if you see 한, the system keyboard works and the original word, field, or app needs inspection.",
    sections: [
      {
        id: "control-test",
        title: "Begin with one controlled three-key test",
        paragraphs: [
          "Open the simplest editor on the device—Notepad, TextEdit in plain text, Apple Notes, or a basic mobile note. Disable neither your normal keyboard nor security settings. Select Korean 2-set input and press G, K, S once each without Space or arrow keys.",
          "The expected output is 한: ㅎ on G, ㅏ on K, and ㄴ on S. Because this sample tests input state, mapping, and composition at once, each different result narrows the cause.",
        ],
        table: {
          caption: "Interpret the G–K–S control test",
          headers: ["Observed result", "Likely layer", "Next check"],
          rows: [
            ["gks", "Input state", "Switch to Korean; on Windows confirm 가 rather than A."],
            ["Different Hangul letters", "Layout or key position", "Confirm 2-set and your QWERTY/AZERTY/QWERTZ mapping."],
            ["ㅎㅏㄴ", "Composition behavior", "Try a plain editor and check whether the original field supports an IME."],
            ["한", "System works", "Inspect the target spelling, Shift use, or original app."],
            ["Nothing", "Focus or hardware", "Click the text field, test ordinary Latin input, and check accessibility/input tools."],
          ],
        },
      },
      {
        id: "latin-output",
        title: "If Latin letters appear, fix input state—not the word",
        paragraphs: [
          "The correct physical sequence can still produce Latin letters when a Latin source is active. Windows can add another layer: the Korean IME may be selected while its internal A/가 state remains A. Switch to 가 before retyping.",
          "On Mac and mobile, use the visible Input menu or globe control to verify the active source. Learn one keyboard shortcut, but keep the indicator visible until the habit is stable. If a shortcut appears to do nothing, the second input source may not be installed.",
        ],
        bullets: [
          "Windows: use Windows+Space, then inspect A/가.",
          "Mac: inspect the Input menu; use the configured Control+Space or Globe/Fn action.",
          "iPhone/iPad: tap or hold the globe key.",
          "Gboard: hold Space or use the language-switch key.",
        ],
      },
      {
        id: "wrong-hangul",
        title: "If the Hangul is wrong, find the first wrong jamo",
        paragraphs: [
          "Do not compare only the whole word. Decompose the first incorrect block into initial, vowel, and final. If the initial is wrong, check its consonant key or Shift. If the vowel is wrong, compare ㅏ/ㅓ, ㅗ/ㅜ, and ㅐ/ㅔ positions. If the bottom is wrong, inspect the final consonant or cluster.",
          "Correct from the first divergent jamo, because every later block boundary can depend on it. Then type the entire word accurately twice. Editing only the visible bad letter can hide the movement that caused it.",
        ],
        examples: [
          { label: "Expected 한", keys: "gks", result: "한", note: "If you see 핸, O was pressed instead of K." },
          { label: "Expected 고", keys: "rh", result: "고", note: "If you see 구, N was pressed instead of H." },
          { label: "Expected 까", keys: "Rk", result: "까", note: "If you see 가, Shift was missing on R." },
          { label: "Expected 값", keys: "rkqt", result: "값", note: "If you see 갑, the final ㅅ on T was omitted." },
        ],
      },
      {
        id: "broken-blocks",
        title: "If blocks split or reshape, inspect the sequence",
        paragraphs: [
          "Hangul composition is provisional. A following vowel can turn a possible final consonant into the next initial, and ㅇ explicitly begins a written vowel-initial block. Spaces, punctuation, cursor moves, and clicking elsewhere can commit the current block.",
          "Separate jamo can also come from pasted compatibility characters or from a field that handles input-method events incorrectly. Test the same keystrokes in a plain editor. If they combine there, preserve your system settings and report the issue to the app or site where they do not.",
        ],
        note: {
          title: "One field is not the whole keyboard",
          body:
            "Password controls, remote desktops, games that capture raw keys, and custom web editors can treat composition differently. A successful plain-text test is strong evidence that the operating-system input method is healthy.",
        },
      },
      {
        id: "layout-mismatch",
        title: "Separate the Korean map from the physical base layout",
        paragraphs: [
          "Most diagrams label positions with QWERTY letters. An AZERTY or QWERTZ keyboard puts some printed letters in different physical places. A lesson may mean “the key in this position,” while you interpret “the keycap bearing this letter.” That produces systematic, repeatable wrong letters.",
          "Use your operating system’s Keyboard Viewer or Seoul Keys layout option to align the visual guide with the physical board. Do not compensate by learning an accidental hybrid. Once the base layout and guide agree, rerun the G–K–S control test using the displayed physical positions.",
        ],
      },
      {
        id: "correction-loop",
        title: "Use a clean correction loop",
        paragraphs: [
          "Fast repeated mistakes strengthen the wrong sequence. After an error, stop, identify its layer, say the intended jamo, and make one slow correction. Then restart the full word. Two clean repetitions are enough to leave a better final trace without turning correction into punishment.",
          "Keep a tiny error log for recurring confusions: target, wrong result, cause, and corrected key. If the same pair appears three times, create a thirty-second contrast drill for it rather than repeating an entire lesson.",
        ],
        steps: [
          "Stop at the first unexpected block.",
          "Name the expected and observed jamo.",
          "Classify mode, map, composition, spelling, or app.",
          "Change only the relevant key or setting.",
          "Retype the complete word accurately twice.",
        ],
      },
    ],
    drill: {
      title: "Diagnostic mini-lab",
      instructions:
        "Type these in a plain note first, then in the field that caused trouble. Compare the two results rather than changing several settings.",
      items: [
        { label: "Input and composition", keys: "gks", result: "한", note: "Checks three basic layers." },
        { label: "Horizontal vowel", keys: "rh", result: "고", note: "Distinguishes H from N." },
        { label: "Shift", keys: "Rk", result: "까", note: "Checks a tense consonant." },
        { label: "Compound vowel", keys: "dhk", result: "와", note: "Checks same-block sequential vowels." },
        { label: "Final cluster", keys: "rkqt", result: "값", note: "Checks continued final composition." },
      ],
      checkpoint:
        "You have diagnosed the problem when you can reproduce it in one field, identify the first layer that differs, and fix it with one specific change.",
    },
    mistakes: [
      {
        mistake: "Reinstalling languages before running a control test",
        fix: "First identify whether the failure is mode, map, composition, spelling, or one application.",
      },
      {
        mistake: "Judging the whole word without finding the first wrong letter",
        fix: "Decompose the first incorrect block; later errors may be consequences of that one key.",
      },
      {
        mistake: "Changing both layout and shortcut at once",
        fix: "Change one variable and repeat the same G–K–S test so the result is meaningful.",
      },
      {
        mistake: "Repeating the wrong sequence at speed",
        fix: "Pause, name the correct jamo, and finish with two accurate full-word repetitions.",
      },
    ],
    faqs: [
      {
        question: "Why does my Korean keyboard keep typing English?",
        answer:
          "A Latin input source may be active, or the Windows Korean IME may be in its internal A state. Select Korean and confirm 가 mode.",
      },
      {
        question: "Why will Hangul not combine in one website?",
        answer:
          "If the same keys combine in a plain editor, the custom field may be mishandling input-method composition. The operating-system setup is probably not the cause.",
      },
      {
        question: "Why do I get the right kind of letter but the wrong one?",
        answer:
          "Check the 2-set map and whether the visual guide assumes QWERTY while your hardware is AZERTY or QWERTZ.",
      },
      {
        question: "Should I delete the whole word after one mistake?",
        answer:
          "Diagnose at the first wrong jamo, but retype the complete word after correcting it so you practise the intended continuous movement.",
      },
    ],
    references: [microsoftKeyboard, appleMacKeyboard, gboardKeyboard, unicodeHangul],
    related: ["add-korean-keyboard", "korean-keyboard-layout", "korean-typing-practice-plan"],
  },
  {
    slug: "korean-typing-practice-plan",
    title: "A Four-Week Korean Typing Practice Plan",
    cardTitle: "Follow a four-week practice plan",
    description:
      "Build Korean typing accuracy in ten focused minutes a day with a four-week progression from keyboard map to syllable blocks, words, and fluent short sentences.",
    eyebrow: "Practice plan · 10 minutes a day",
    readMinutes: 13,
    published: "2026-09-03",
    updated: "2026-09-03",
    accent: "cyan",
    keywords: [
      "Korean typing practice plan",
      "learn Korean typing",
      "Hangul typing exercises",
      "Korean keyboard practice beginner",
      "improve Korean typing speed",
    ],
    learningGoals: [
      "Establish a baseline without turning it into a high-pressure speed test.",
      "Use a repeatable ten-minute session with retrieval, focused practice, and transfer.",
      "Progress from key zones to blocks, words, and short meaningful sentences.",
      "Decide when to advance, repeat, or narrow a lesson using accuracy evidence.",
    ],
    intro: [
      "Korean typing improves when the task is small enough to repeat and specific enough to correct. A long weekly session often becomes a mixture of key searching, fatigue, and speed chasing. Ten deliberate minutes most days gives you more chances to retrieve the map and return before it has completely faded.",
      "This four-week plan is a framework, not a promise that every learner will reach the same speed on day twenty-eight. Repeat a week when accuracy is unstable, shorten sessions when hands are tired, and substitute words that matter to you. The progression matters more than the calendar.",
    ],
    quickAnswer:
      "Practise for ten minutes: two minutes of known-key warm-up, three minutes on one new movement, three minutes of meaningful words, and two minutes of a short sentence or game. Advance when accuracy is controlled across several sessions, not after one fast score.",
    sections: [
      {
        id: "baseline",
        title: "Record a calm baseline on day one",
        paragraphs: [
          "Choose a short, beginner-level line and type it once without rehearsal. Record the site’s accuracy measure, its speed measure, and how often you looked at the map. Note whether errors came from input switching, forgotten keys, Shift, compound vowels, or spelling.",
          "Do not compare a Korean characters-per-minute score with an English words-per-minute score. Measurement systems count composed characters and keystrokes differently. Your baseline is useful only as a comparison with later attempts in the same tool under similar conditions.",
        ],
        bullets: [
          "Accuracy on the first attempt.",
          "Speed in the exact unit shown by the practice tool.",
          "Number of map checks.",
          "Two recurring letter or movement errors.",
          "Any physical discomfort; stop rather than train through pain.",
        ],
      },
      {
        id: "daily-session",
        title: "Use the same four-part session",
        paragraphs: [
          "A predictable structure saves decision time. Warm up material you already know, isolate one challenge, use it in real words, then transfer it to a sentence or playful activity. End while technique is still controlled so the final repetitions are useful.",
          "The focused block should be narrow: one row, one vowel family, one final-consonant pattern, or one confusing pair. “Practise the entire Korean keyboard” is too broad to diagnose within three minutes.",
        ],
        table: {
          caption: "A repeatable ten-minute Korean typing session",
          headers: ["Time", "Activity", "Purpose"],
          rows: [
            ["0:00–2:00", "Known keys and easy blocks", "Restore home position and confidence"],
            ["2:00–5:00", "One target movement", "Create accurate, focused repetitions"],
            ["5:00–8:00", "Three to six useful words", "Connect movement with spelling and meaning"],
            ["8:00–10:00", "One sentence, challenge, or game", "Transfer without abandoning accuracy"],
          ],
        },
      },
      {
        id: "four-weeks",
        title: "Progress through four practical stages",
        paragraphs: [
          "Each week adds complexity while keeping earlier material in the warm-up. If a new stage makes accuracy collapse, split it across more days. The plan deliberately reaches meaningful phrases early; typing only isolated jamo can build map knowledge without fluent word boundaries.",
        ],
        table: {
          caption: "Four-week progression",
          headers: ["Week", "Primary focus", "Daily material", "Ready-to-advance signal"],
          rows: [
            ["1", "Map and home-row anchors", "Home-row jamo, open CV blocks, input switching", "Stable finger zones and few map checks on practised keys"],
            ["2", "Whole syllable blocks", "Vertical/horizontal vowels, single batchim, short words", "Can explain and type CV/CVC order"],
            ["3", "Shift and combinations", "Tense consonants, compound vowels, common final clusters", "Can repair a failed combination by naming its parts"],
            ["4", "Phrases and fluency", "Travel phrases, greetings, short sentences, mixed games", "Accuracy remains controlled when words are joined"],
          ],
        },
      },
      {
        id: "weekly-details",
        title: "Choose material that reveals one skill at a time",
        paragraphs: [
          "In week one, use open syllables such as 나, 너, 노, 무 and home-row words such as 나라. Week two adds final consonants through families such as 가–간–감–강 and useful words such as 한국, 사람, and 한글. Week three contrasts 가–까 and 사–싸, then practises vowel families 와–왜–외 and 워–웨–위.",
          "Week four should contain phrases you might genuinely type: 안녕하세요, 감사합니다, 서울에 가요, or a short self-introduction that you understand. Meaning reduces arbitrary key memorization and gives you a reason to revisit the sentence later.",
        ],
        examples: [
          { label: "Week 1", keys: "sk sj sh an", result: "나 너 노 무", note: "Open blocks and clear hand alternation." },
          { label: "Week 2", keys: "rk rks rka rkd", result: "가 간 감 강", note: "One base with changing finals." },
          { label: "Week 3", keys: "rk Rk tk Tk", result: "가 까 사 싸", note: "Plain and tense contrasts." },
          { label: "Week 4", keys: "dkssudgktpdy", result: "안녕하세요", note: "A meaningful five-block greeting." },
        ],
      },
      {
        id: "advance-rules",
        title: "Advance on consistency, not one personal best",
        paragraphs: [
          "Use an accuracy band rather than a single magic threshold. If two or three recent sessions are controlled, your hands are relaxed, and the same error is not recurring, add a small challenge. If accuracy falls sharply on the new material, keep the challenge but reduce its size.",
          "A practical learner-selected target is around 95% accuracy before emphasizing speed, but the exact number is not a rule of Korean. More important is whether corrections are decreasing and whether you can repeat the performance on another day.",
        ],
        steps: [
          "Review the last three comparable attempts.",
          "Identify the most frequent error, not merely the slowest word.",
          "Keep one familiar drill in tomorrow’s warm-up.",
          "Add only one new key family or block pattern.",
          "Retest the original baseline line at the end of each week.",
        ],
      },
      {
        id: "keep-it-personal",
        title: "Turn your real vocabulary into the final practice layer",
        paragraphs: [
          "Replace generic words gradually with names, foods, places, messages, or study vocabulary you already understand. Confirm the Korean spelling first. A personally useful list makes repetition easier to sustain and exposes the key patterns you actually need.",
          "Keep public or copyrighted text out of a private practice list unless you have the right to reuse it. Short phrases you write yourself, public-domain material, and clearly licensed learning examples are safer choices for sharing. Seoul Keys’ built-in lessons provide a controlled starting point.",
        ],
        note: {
          title: "Rest is part of technique",
          body:
            "Stop if typing causes pain, numbness, or persistent strain. Short sessions are intended to preserve attention and comfortable movement, not to push through symptoms.",
        },
      },
    ],
    drill: {
      title: "Your first ten-minute session",
      instructions:
        "Use the sequence below as a ready-made day-one session. Stay slow enough to finish each line cleanly.",
      items: [
        { label: "Warm-up", keys: "sk sj sh gk", result: "나 너 노 하", note: "Two minutes; home-row anchors." },
        { label: "Focus", keys: "rk rks rka rkd", result: "가 간 감 강", note: "Three minutes; add one final at a time." },
        { label: "Words", keys: "gksrmf gksrnr tkfka", result: "한글 한국 사람", note: "Three minutes; say each word." },
        { label: "Transfer", keys: "sksms gksrmfdmf qodnjdy", result: "나는 한글을 배워요", note: "Two minutes; finish with meaning." },
      ],
      checkpoint:
        "Write down accuracy, map checks, and one recurring error. Tomorrow, repeat the warm-up and focus only on that error before adding new material.",
    },
    mistakes: [
      {
        mistake: "Doing one exhausting session each week",
        fix: "Use shorter, repeatable sessions so the layout must be retrieved on more days.",
      },
      {
        mistake: "Changing targets every minute",
        fix: "Give one row, contrast, or block pattern a focused three-minute window.",
      },
      {
        mistake: "Advancing after one fast attempt",
        fix: "Look for controlled accuracy across several comparable sessions.",
      },
      {
        mistake: "Practising words you cannot spell or understand",
        fix: "Confirm spelling and meaning first so the keyboard sequence has a reliable language model.",
      },
    ],
    faqs: [
      {
        question: "Can I learn Korean typing in four weeks?",
        answer:
          "You can build a useful foundation, but outcomes depend on prior typing skill, frequency, and target vocabulary. Repeat stages rather than treating four weeks as a guarantee.",
      },
      {
        question: "How many minutes should I practise each day?",
        answer:
          "This plan uses ten focused minutes because it is easy to repeat. A shorter accurate session is better than a longer session that causes fatigue or careless movement.",
      },
      {
        question: "When should I work on speed?",
        answer:
          "After your accuracy and finger assignments are stable on the same material. Increase tempo in small steps and return to the last controlled pace after a sharp accuracy drop.",
      },
      {
        question: "Should I practise isolated letters or real sentences?",
        answer:
          "Use both in sequence: isolate one movement briefly, apply it to words, then transfer it to a sentence you understand.",
      },
    ],
    references: [unicodeHangul, microsoftKeyboard],
    related: ["korean-touch-typing", "korean-keyboard-layout", "korean-typing-mistakes"],
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

export function getGuide(slug: string): LearningGuide | undefined {
  return guideBySlug.get(slug);
}
