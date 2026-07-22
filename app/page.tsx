"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Locale =
  | "en" | "ko" | "es" | "pt-BR" | "ja" | "zh-Hans" | "zh-Hant"
  | "fr" | "de" | "it" | "pl" | "nl" | "ru" | "tr"
  | "ar" | "fa" | "ur" | "fil" | "th" | "id" | "ms" | "vi"
  | "my" | "km" | "lo" | "hi" | "bn" | "ta" | "ne" | "si"
  | "kk" | "uz" | "mn";
type ActivityId = "home" | "tetris" | "missing" | "crossword" | "travel" | "kpop" | "screen";
type TravelMode = "inKorea" | "welcome";
type KeyboardLayout = "qwerty" | "azerty" | "qwertz";
type KeyboardRow = "top" | "home" | "bottom";
type VoiceGender = "female" | "male";

type KoreanKey = {
  jamo: string;
  code: string;
  row: KeyboardRow;
  shift?: boolean;
};

type KeyboardHelpCopy = {
  myKeyboard: string;
  nextKey: string;
  press: string;
  yourKey: string;
  hangul: string;
  mapTitle: string;
  layoutNote: string;
  complete: string;
};

type SpeechHelpCopy = {
  label: string;
  on: string;
  off: string;
  unavailable: string;
};

type ReturnSoundCopy = {
  label: string;
  on: string;
  off: string;
};

type PublishedContentItem = {
  id: number;
  category: "kpop" | "kdrama" | "movie" | "travel" | "lesson";
  title: string;
  sourceTitle: string;
  creator: string;
  koreanText: string;
  translation: string;
  audioFemaleUrl: string;
  audioMaleUrl: string;
};

type InterfaceCopy = {
  navLearn: string;
  navGames: string;
  navProgress: string;
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  description: string;
  start: string;
  explore: string;
  upNext: string;
  practiceTitle: string;
  practiceHint: string;
  nextBeat: string;
  nextBeatHint: string;
  pathTitle: string;
  pathBody: string;
};

const englishCopy: InterfaceCopy = {
  navLearn: "Learn",
  navGames: "Games",
  navProgress: "My progress",
  eyebrow: "10 min a day · beginner friendly",
  headlineTop: "Type Korean.",
  headlineBottom: "Play your way.",
  description: "Build real Hangul muscle memory through quick lessons, bright beats, and games that turn every keystroke into progress.",
  start: "Start today’s lesson",
  explore: "Explore games",
  upNext: "Up next · Home-row practice",
  practiceTitle: "Find the rhythm, one key at a time.",
  practiceHint: "Type the Korean sentence below",
  nextBeat: "Pick your next beat.",
  nextBeatHint: "Short rounds. Instant feedback. Real Korean.",
  pathTitle: "From your first key to your favorite song.",
  pathBody: "A clear path takes you from Hangul basics to words, games, long-form typing, and licensed K-POP challenges.",
};

const translated = (overrides: Partial<InterfaceCopy>): InterfaceCopy => ({ ...englishCopy, ...overrides });

const copy: Record<Locale, InterfaceCopy> = {
  en: englishCopy,
  ko: {
    navLearn: "배우기",
    navGames: "게임",
    navProgress: "내 진도",
    eyebrow: "하루 10분 · 초보자 환영",
    headlineTop: "한글을 치고,",
    headlineBottom: "게임처럼 배워요.",
    description: "짧은 레슨과 재미있는 게임으로 자판 위치부터 실제 한국어 문장까지 자연스럽게 익혀보세요.",
    start: "오늘의 레슨 시작",
    explore: "게임 둘러보기",
    upNext: "다음 학습 · 기본자리",
    practiceTitle: "한 키씩 리듬을 찾아보세요.",
    practiceHint: "아래 한국어 문장을 입력하세요",
    nextBeat: "다음 활동을 골라보세요.",
    nextBeatHint: "짧은 라운드, 즉시 피드백, 진짜 한국어.",
    pathTitle: "첫 키부터 좋아하는 노래까지.",
    pathBody: "한글 원리부터 단어, 게임, 장문 타자와 정식 라이선스 K-POP 챌린지까지 이어집니다.",
  },
  es: {
    navLearn: "Aprender",
    navGames: "Juegos",
    navProgress: "Mi progreso",
    eyebrow: "10 min al día · para principiantes",
    headlineTop: "Escribe coreano.",
    headlineBottom: "Aprende jugando.",
    description: "Crea memoria muscular con lecciones rápidas y juegos que convierten cada tecla en progreso.",
    start: "Empezar la lección",
    explore: "Explorar juegos",
    upNext: "Siguiente · Fila inicial",
    practiceTitle: "Encuentra el ritmo, tecla a tecla.",
    practiceHint: "Escribe la frase en coreano",
    nextBeat: "Elige tu próximo reto.",
    nextBeatHint: "Rondas cortas. Respuesta inmediata. Coreano real.",
    pathTitle: "De tu primera tecla a tu canción favorita.",
    pathBody: "Avanza desde Hangul básico hasta palabras, juegos, textos largos y retos K-POP con licencia.",
  },
  ja: {
    navLearn: "学ぶ",
    navGames: "ゲーム",
    navProgress: "進捗",
    eyebrow: "1日10分 · 初心者向け",
    headlineTop: "韓国語を打って、",
    headlineBottom: "ゲームで学ぼう。",
    description: "短いレッスンと楽しいゲームで、ハングル入力を自然に身につけましょう。",
    start: "今日のレッスン",
    explore: "ゲームを見る",
    upNext: "次へ · ホームポジション",
    practiceTitle: "一つずつ、キーのリズムを見つけよう。",
    practiceHint: "下の韓国語を入力してください",
    nextBeat: "次のチャレンジを選ぼう。",
    nextBeatHint: "短いラウンド、すぐにフィードバック、本物の韓国語。",
    pathTitle: "最初のキーから好きな歌まで。",
    pathBody: "ハングルの基礎から単語、ゲーム、長文、公式K-POPチャレンジへ進みます。",
  },
  fr: {
    navLearn: "Apprendre",
    navGames: "Jeux",
    navProgress: "Mes progrès",
    eyebrow: "10 min par jour · débutants bienvenus",
    headlineTop: "Tapez en coréen.",
    headlineBottom: "Apprenez en jouant.",
    description: "Progressez grâce à des leçons rapides et des jeux qui transforment chaque frappe en réussite.",
    start: "Commencer la leçon",
    explore: "Voir les jeux",
    upNext: "À suivre · Position de base",
    practiceTitle: "Trouvez le rythme, une touche à la fois.",
    practiceHint: "Tapez la phrase coréenne",
    nextBeat: "Choisissez votre prochain défi.",
    nextBeatHint: "Parties courtes. Retour immédiat. Vrai coréen.",
    pathTitle: "De la première touche à votre chanson préférée.",
    pathBody: "Passez des bases du Hangul aux mots, jeux, textes longs et défis K-POP sous licence.",
  },
  ar: {
    navLearn: "تعلّم",
    navGames: "ألعاب",
    navProgress: "تقدّمي",
    eyebrow: "10 دقائق يومياً · مناسب للمبتدئين",
    headlineTop: "اكتب بالكورية.",
    headlineBottom: "وتعلّم باللعب.",
    description: "ابنِ ذاكرة حركية حقيقية من خلال دروس سريعة وألعاب تجعل كل ضغطة مفتاح تقدماً.",
    start: "ابدأ درس اليوم",
    explore: "استكشف الألعاب",
    upNext: "التالي · الصف الأساسي",
    practiceTitle: "اعثر على الإيقاع، مفتاحاً بعد مفتاح.",
    practiceHint: "اكتب الجملة الكورية أدناه",
    nextBeat: "اختر التحدي التالي.",
    nextBeatHint: "جولات قصيرة، ملاحظات فورية، وكورية حقيقية.",
    pathTitle: "من أول مفتاح إلى أغنيتك المفضلة.",
    pathBody: "مسار واضح من أساسيات الهانغول إلى الكلمات والألعاب والكتابة الطويلة وتحديات K-POP المرخّصة.",
  },
  "pt-BR": translated({
    navLearn: "Aprender",
    navGames: "Jogos",
    navProgress: "Meu progresso",
    eyebrow: "10 min por dia · ideal para iniciantes",
    headlineTop: "Digite em coreano.",
    headlineBottom: "Aprenda brincando.",
    description: "Crie memória muscular com lições rápidas e jogos que transformam cada tecla em progresso.",
    start: "Começar a lição de hoje",
    explore: "Explorar jogos",
    upNext: "A seguir · Posição inicial",
    practiceTitle: "Encontre o ritmo, uma tecla de cada vez.",
    practiceHint: "Digite a frase em coreano",
    nextBeat: "Escolha seu próximo desafio.",
    nextBeatHint: "Rodadas curtas. Retorno imediato. Coreano real.",
    pathTitle: "Da primeira tecla à sua música favorita.",
    pathBody: "Avance do Hangul básico para palavras, jogos, textos longos e desafios K-POP licenciados.",
  }),
  fa: translated({
    navLearn: "یادگیری",
    navGames: "بازی‌ها",
    navProgress: "پیشرفت من",
    eyebrow: "روزی ۱۰ دقیقه · مناسب تازه‌کارها",
    headlineTop: "کره‌ای تایپ کنید.",
    headlineBottom: "با بازی یاد بگیرید.",
    description: "با درس‌های کوتاه و بازی‌های سرگرم‌کننده، حافظهٔ حرکتی تایپ هانگول را تقویت کنید.",
    start: "شروع درس امروز",
    explore: "دیدن بازی‌ها",
    practiceHint: "جملهٔ کره‌ای زیر را تایپ کنید",
    nextBeat: "چالش بعدی را انتخاب کنید.",
    pathTitle: "از اولین کلید تا آهنگ محبوبتان.",
  }),
  ur: translated({
    navLearn: "سیکھیں",
    navGames: "کھیل",
    navProgress: "میری پیش رفت",
    eyebrow: "روزانہ ۱۰ منٹ · نئے سیکھنے والوں کے لیے",
    headlineTop: "کوریائی ٹائپ کریں۔",
    headlineBottom: "کھیلتے ہوئے سیکھیں۔",
    description: "مختصر اسباق اور دلچسپ کھیلوں سے ہانگول ٹائپنگ کی عملی مہارت بنائیں۔",
    start: "آج کا سبق شروع کریں",
    explore: "کھیل دیکھیں",
  }),
  fil: translated({
    navLearn: "Matuto",
    navGames: "Mga laro",
    navProgress: "Aking progreso",
    eyebrow: "10 minuto bawat araw · para sa nagsisimula",
    headlineTop: "Mag-type sa Korean.",
    headlineBottom: "Matuto habang naglalaro.",
    description: "Sanayin ang iyong Hangul typing sa maiikling aralin at masayang larong may agarang feedback.",
    start: "Simulan ang aralin ngayon",
    explore: "Tingnan ang mga laro",
    upNext: "Susunod · Pangunahing posisyon",
    practiceTitle: "Hanapin ang ritmo, isang key bawat pindot.",
    practiceHint: "I-type ang Korean na pangungusap",
    nextBeat: "Piliin ang susunod na hamon.",
    nextBeatHint: "Maikling round. Agarang feedback. Tunay na Korean.",
    pathTitle: "Mula unang key hanggang paboritong kanta.",
    pathBody: "Mula Hangul basics patungo sa mga salita, laro, mahabang teksto, at lisensiyadong K-POP challenge.",
  }),
  th: translated({
    navLearn: "เรียน",
    navGames: "เกม",
    navProgress: "ความคืบหน้าของฉัน",
    eyebrow: "วันละ 10 นาที · เหมาะสำหรับผู้เริ่มต้น",
    headlineTop: "พิมพ์ภาษาเกาหลี",
    headlineBottom: "เรียนรู้ผ่านการเล่น",
    description: "ฝึกความจำของนิ้วด้วยบทเรียนสั้นและเกมสนุกที่เปลี่ยนทุกการกดแป้นเป็นความก้าวหน้า",
    start: "เริ่มบทเรียนวันนี้",
    explore: "ดูเกมทั้งหมด",
    upNext: "ถัดไป · ฝึกแป้นเหย้า",
    practiceTitle: "ค้นหาจังหวะ ทีละแป้น",
    practiceHint: "พิมพ์ประโยคภาษาเกาหลีด้านล่าง",
    nextBeat: "เลือกชาเลนจ์ถัดไป",
    nextBeatHint: "รอบสั้น ผลตอบรับทันที ภาษาเกาหลีจริง",
    pathTitle: "จากแป้นแรกสู่เพลงโปรด",
    pathBody: "เรียนตั้งแต่พื้นฐานฮันกึล คำศัพท์ เกม การพิมพ์ข้อความยาว ไปจนถึงชาเลนจ์ K-POP ที่ได้รับอนุญาต",
  }),
  id: translated({
    navLearn: "Belajar",
    navGames: "Game",
    navProgress: "Progres saya",
    eyebrow: "10 menit sehari · ramah pemula",
    headlineTop: "Ketik bahasa Korea.",
    headlineBottom: "Belajar sambil bermain.",
    description: "Bangun memori otot Hangul lewat pelajaran singkat dan game seru dengan umpan balik instan.",
    start: "Mulai pelajaran hari ini",
    explore: "Jelajahi game",
    upNext: "Berikutnya · Latihan baris dasar",
    practiceTitle: "Temukan ritmenya, satu tombol setiap kali.",
    practiceHint: "Ketik kalimat bahasa Korea di bawah",
    nextBeat: "Pilih tantangan berikutnya.",
    nextBeatHint: "Ronde singkat. Umpan balik instan. Bahasa Korea nyata.",
    pathTitle: "Dari tombol pertama hingga lagu favorit.",
    pathBody: "Mulai dari dasar Hangul, kata, game, teks panjang, hingga tantangan K-POP berlisensi.",
  }),
  ms: translated({
    navLearn: "Belajar",
    navGames: "Permainan",
    navProgress: "Kemajuan saya",
    eyebrow: "10 minit sehari · mesra pemula",
    headlineTop: "Taip bahasa Korea.",
    headlineBottom: "Belajar sambil bermain.",
    description: "Bina ingatan jari Hangul melalui pelajaran ringkas dan permainan menyeronokkan dengan maklum balas segera.",
    start: "Mulakan pelajaran hari ini",
    explore: "Terokai permainan",
    upNext: "Seterusnya · Latihan baris asas",
    practiceTitle: "Cari rentak, satu kekunci pada satu masa.",
    practiceHint: "Taip ayat bahasa Korea di bawah",
    nextBeat: "Pilih cabaran seterusnya.",
    nextBeatHint: "Pusingan ringkas. Maklum balas segera. Bahasa Korea sebenar.",
    pathTitle: "Daripada kekunci pertama hingga lagu kegemaran.",
    pathBody: "Ikuti asas Hangul, perkataan, permainan, teks panjang dan cabaran K-POP berlesen.",
  }),
  vi: translated({
    navLearn: "Học",
    navGames: "Trò chơi",
    navProgress: "Tiến độ của tôi",
    eyebrow: "10 phút mỗi ngày · phù hợp người mới",
    headlineTop: "Gõ tiếng Hàn.",
    headlineBottom: "Học qua trò chơi.",
    description: "Rèn phản xạ gõ Hangul bằng bài học ngắn và trò chơi vui nhộn với phản hồi tức thì.",
    start: "Bắt đầu bài học hôm nay",
    explore: "Khám phá trò chơi",
    practiceHint: "Gõ câu tiếng Hàn bên dưới",
    nextBeat: "Chọn thử thách tiếp theo.",
    pathTitle: "Từ phím đầu tiên đến bài hát yêu thích.",
  }),
  "zh-Hans": translated({
    navLearn: "学习",
    navGames: "游戏",
    navProgress: "我的进度",
    eyebrow: "每天10分钟 · 新手友好",
    headlineTop: "输入韩语。",
    headlineBottom: "边玩边学。",
    description: "通过短课程和趣味游戏，逐步建立韩文打字的肌肉记忆。",
    start: "开始今天的课程",
    explore: "探索游戏",
    practiceHint: "输入下方的韩语句子",
    nextBeat: "选择下一个挑战。",
    pathTitle: "从第一个按键到你最爱的歌曲。",
  }),
  "zh-Hant": translated({
    navLearn: "學習",
    navGames: "遊戲",
    navProgress: "我的進度",
    eyebrow: "每天10分鐘 · 新手友善",
    headlineTop: "輸入韓語。",
    headlineBottom: "邊玩邊學。",
    description: "透過短課程和趣味遊戲，逐步建立韓文打字的肌肉記憶。",
    start: "開始今天的課程",
    explore: "探索遊戲",
    practiceHint: "輸入下方的韓語句子",
    nextBeat: "選擇下一個挑戰。",
    pathTitle: "從第一個按鍵到你最愛的歌曲。",
  }),
  hi: translated({
    navLearn: "सीखें",
    navGames: "गेम",
    navProgress: "मेरी प्रगति",
    eyebrow: "रोज़ 10 मिनट · शुरुआती लोगों के लिए",
    headlineTop: "कोरियाई टाइप करें।",
    headlineBottom: "खेलते हुए सीखें।",
    description: "छोटे पाठों और मज़ेदार खेलों से हंगुल टाइपिंग की मसल मेमोरी बनाएँ।",
    start: "आज का पाठ शुरू करें",
    explore: "गेम देखें",
  }),
  bn: translated({
    navLearn: "শিখুন",
    navGames: "গেম",
    navProgress: "আমার অগ্রগতি",
    eyebrow: "প্রতিদিন ১০ মিনিট · নতুনদের জন্য",
    headlineTop: "কোরিয়ান টাইপ করুন।",
    headlineBottom: "খেলতে খেলতে শিখুন।",
    description: "ছোট পাঠ ও মজার গেমের মাধ্যমে হাঙ্গুল টাইপিংয়ের দক্ষতা গড়ে তুলুন।",
    start: "আজকের পাঠ শুরু করুন",
    explore: "গেম দেখুন",
  }),
  ta: translated({
    navLearn: "கற்க",
    navGames: "விளையாட்டுகள்",
    navProgress: "என் முன்னேற்றம்",
    eyebrow: "தினமும் 10 நிமிடம் · தொடக்கநிலைக்கு ஏற்றது",
    headlineTop: "கொரிய மொழியை தட்டச்சு செய்யுங்கள்.",
    headlineBottom: "விளையாடிக் கற்றுக்கொள்ளுங்கள்.",
    description: "சிறிய பாடங்கள் மற்றும் வேடிக்கையான விளையாட்டுகள் மூலம் ஹங்குல் தட்டச்சைப் பழகுங்கள்.",
    start: "இன்றைய பாடத்தை தொடங்குங்கள்",
    explore: "விளையாட்டுகளை காணுங்கள்",
  }),
  tr: translated({
    navLearn: "Öğren",
    navGames: "Oyunlar",
    navProgress: "İlerlemem",
    eyebrow: "Günde 10 dakika · başlangıç dostu",
    headlineTop: "Korece yaz.",
    headlineBottom: "Oynayarak öğren.",
    description: "Kısa dersler ve eğlenceli oyunlarla Hangul yazma refleksini geliştir.",
    start: "Bugünkü derse başla",
    explore: "Oyunları keşfet",
  }),
  ru: translated({
    navLearn: "Учиться",
    navGames: "Игры",
    navProgress: "Мой прогресс",
    eyebrow: "10 минут в день · для начинающих",
    headlineTop: "Печатайте по-корейски.",
    headlineBottom: "Учитесь играя.",
    description: "Развивайте навык печати на хангыле с короткими уроками и увлекательными играми.",
    start: "Начать сегодняшний урок",
    explore: "Смотреть игры",
  }),
  de: translated({
    navLearn: "Lernen",
    navGames: "Spiele",
    navProgress: "Mein Fortschritt",
    eyebrow: "10 Minuten täglich · für Anfänger",
    headlineTop: "Tippe Koreanisch.",
    headlineBottom: "Lerne spielerisch.",
    description: "Trainiere Hangul-Tippen mit kurzen Lektionen und unterhaltsamen Spielen.",
    start: "Heutige Lektion starten",
    explore: "Spiele entdecken",
  }),
  it: translated({
    navLearn: "Impara",
    navGames: "Giochi",
    navProgress: "I miei progressi",
    eyebrow: "10 minuti al giorno · per principianti",
    headlineTop: "Scrivi in coreano.",
    headlineBottom: "Impara giocando.",
    description: "Allena la digitazione Hangul con brevi lezioni e giochi divertenti.",
    start: "Inizia la lezione di oggi",
    explore: "Scopri i giochi",
  }),
  pl: translated({
    navLearn: "Nauka",
    navGames: "Gry",
    navProgress: "Moje postępy",
    eyebrow: "10 minut dziennie · dla początkujących",
    headlineTop: "Pisz po koreańsku.",
    headlineBottom: "Ucz się przez zabawę.",
    description: "Ćwicz pisanie w Hangulu dzięki krótkim lekcjom i ciekawym grom.",
    start: "Rozpocznij dzisiejszą lekcję",
    explore: "Zobacz gry",
  }),
  nl: translated({
    navLearn: "Leren",
    navGames: "Spellen",
    navProgress: "Mijn voortgang",
    eyebrow: "10 minuten per dag · voor beginners",
    headlineTop: "Typ Koreaans.",
    headlineBottom: "Leer spelenderwijs.",
    description: "Bouw Hangul-typevaardigheid op met korte lessen en leuke spellen.",
    start: "Start de les van vandaag",
    explore: "Bekijk spellen",
  }),
  my: translated({
    navLearn: "လေ့လာရန်",
    navGames: "ဂိမ်းများ",
    navProgress: "ကျွန်ုပ်၏တိုးတက်မှု",
    eyebrow: "တစ်နေ့ ၁၀ မိနစ် · စတင်သူများအတွက်",
    headlineTop: "ကိုရီးယားစာ ရိုက်ပါ။",
    headlineBottom: "ကစားရင်း သင်ယူပါ။",
    description: "တိုတောင်းသောသင်ခန်းစာများနှင့် ပျော်စရာဂိမ်းများဖြင့် ဟန်ဂုလ်စာရိုက်လေ့ကျင့်ပါ။",
    start: "ယနေ့သင်ခန်းစာစတင်ရန်",
    explore: "ဂိမ်းများကြည့်ရန်",
  }),
  km: translated({
    navLearn: "រៀន",
    navGames: "ហ្គេម",
    navProgress: "វឌ្ឍនភាពរបស់ខ្ញុំ",
    eyebrow: "១០ នាទីក្នុងមួយថ្ងៃ · សម្រាប់អ្នកចាប់ផ្តើម",
    headlineTop: "វាយអក្សរកូរ៉េ។",
    headlineBottom: "រៀនតាមរយៈការលេង។",
    description: "ហាត់វាយអក្សរហាន់គុលជាមួយមេរៀនខ្លី និងហ្គេមសប្បាយៗ។",
    start: "ចាប់ផ្តើមមេរៀនថ្ងៃនេះ",
    explore: "មើលហ្គេម",
  }),
  lo: translated({
    navLearn: "ຮຽນ",
    navGames: "ເກມ",
    navProgress: "ຄວາມຄືບໜ້າຂອງຂ້ອຍ",
    eyebrow: "10 ນາທີຕໍ່ມື້ · ເໝາະສຳລັບຜູ້ເລີ່ມ",
    headlineTop: "ພິມພາສາເກົາຫຼີ.",
    headlineBottom: "ຮຽນຜ່ານການຫຼິ້ນ.",
    description: "ຝຶກພິມຮັນກຶນດ້ວຍບົດຮຽນສັ້ນ ແລະເກມທີ່ມ່ວນ.",
    start: "ເລີ່ມບົດຮຽນມື້ນີ້",
    explore: "ເບິ່ງເກມ",
  }),
  ne: translated({
    navLearn: "सिक्नुहोस्",
    navGames: "खेलहरू",
    navProgress: "मेरो प्रगति",
    eyebrow: "दिनको १० मिनेट · नयाँ सिक्नेका लागि",
    headlineTop: "कोरियन टाइप गर्नुहोस्।",
    headlineBottom: "खेल्दै सिक्नुहोस्।",
    description: "छोटो पाठ र रमाइला खेलमार्फत हाङ्गुल टाइपिङ अभ्यास गर्नुहोस्।",
    start: "आजको पाठ सुरु गर्नुहोस्",
    explore: "खेलहरू हेर्नुहोस्",
  }),
  si: translated({
    navLearn: "ඉගෙන ගන්න",
    navGames: "ක්‍රීඩා",
    navProgress: "මගේ ප්‍රගතිය",
    eyebrow: "දිනකට මිනිත්තු 10 · ආරම්භකයින් සඳහා",
    headlineTop: "කොරියානු ටයිප් කරන්න.",
    headlineBottom: "ක්‍රීඩා කරමින් ඉගෙන ගන්න.",
    description: "කෙටි පාඩම් සහ විනෝද ක්‍රීඩා සමඟ හන්ගුල් ටයිප් කිරීම පුහුණු වන්න.",
    start: "අද පාඩම අරඹන්න",
    explore: "ක්‍රීඩා බලන්න",
  }),
  kk: translated({
    navLearn: "Үйрену",
    navGames: "Ойындар",
    navProgress: "Менің жетістігім",
    eyebrow: "Күніне 10 минут · бастаушыларға",
    headlineTop: "Корейше теріңіз.",
    headlineBottom: "Ойнап үйреніңіз.",
    description: "Қысқа сабақтар мен қызықты ойындар арқылы хангыль теруді жаттықтырыңыз.",
    start: "Бүгінгі сабақты бастау",
    explore: "Ойындарды көру",
  }),
  uz: translated({
    navLearn: "O‘rganish",
    navGames: "O‘yinlar",
    navProgress: "Mening natijam",
    eyebrow: "Kuniga 10 daqiqa · yangi boshlovchilar uchun",
    headlineTop: "Koreyscha yozing.",
    headlineBottom: "O‘ynab o‘rganing.",
    description: "Qisqa darslar va qiziqarli o‘yinlar orqali Hangul yozishni mashq qiling.",
    start: "Bugungi darsni boshlash",
    explore: "O‘yinlarni ko‘rish",
  }),
  mn: translated({
    navLearn: "Сурах",
    navGames: "Тоглоом",
    navProgress: "Миний ахиц",
    eyebrow: "Өдөрт 10 минут · анхан шатанд",
    headlineTop: "Солонгосоор бичээрэй.",
    headlineBottom: "Тоглонгоо сураарай.",
    description: "Богино хичээл, хөгжилтэй тоглоомоор Хангыл шивэх чадвараа хөгжүүлээрэй.",
    start: "Өнөөдрийн хичээлийг эхлүүлэх",
    explore: "Тоглоом үзэх",
  }),
};

const localeGroups: Array<{ label: string; options: Array<{ value: Locale; label: string }> }> = [
  {
    label: "Global",
    options: [
      { value: "en", label: "English" },
      { value: "ko", label: "한국어" },
      { value: "es", label: "Español" },
      { value: "pt-BR", label: "Português (Brasil)" },
      { value: "fr", label: "Français" },
    ],
  },
  {
    label: "East Asia",
    options: [
      { value: "ja", label: "日本語" },
      { value: "zh-Hans", label: "简体中文" },
      { value: "zh-Hant", label: "繁體中文" },
      { value: "mn", label: "Монгол" },
    ],
  },
  {
    label: "Southeast Asia",
    options: [
      { value: "fil", label: "Filipino" },
      { value: "th", label: "ไทย" },
      { value: "id", label: "Bahasa Indonesia" },
      { value: "ms", label: "Bahasa Melayu" },
      { value: "vi", label: "Tiếng Việt" },
      { value: "my", label: "မြန်မာ" },
      { value: "km", label: "ខ្មែរ" },
      { value: "lo", label: "ລາວ" },
    ],
  },
  {
    label: "South Asia",
    options: [
      { value: "hi", label: "हिन्दी" },
      { value: "ur", label: "اردو" },
      { value: "bn", label: "বাংলা" },
      { value: "ta", label: "தமிழ்" },
      { value: "ne", label: "नेपाली" },
      { value: "si", label: "සිංහල" },
    ],
  },
  {
    label: "Middle East & Central Asia",
    options: [
      { value: "ar", label: "العربية" },
      { value: "fa", label: "فارسی" },
      { value: "tr", label: "Türkçe" },
      { value: "kk", label: "Қазақша" },
      { value: "uz", label: "O‘zbekcha" },
      { value: "ru", label: "Русский" },
    ],
  },
  {
    label: "Europe",
    options: [
      { value: "de", label: "Deutsch" },
      { value: "it", label: "Italiano" },
      { value: "pl", label: "Polski" },
      { value: "nl", label: "Nederlands" },
    ],
  },
];

const rtlLocales = new Set<Locale>(["ar", "fa", "ur"]);

const localeByBrowserCode: Record<string, Locale> = {
  en: "en", ko: "ko", es: "es", pt: "pt-BR", ja: "ja", zh: "zh-Hans",
  fr: "fr", de: "de", it: "it", pl: "pl", nl: "nl", ru: "ru", tr: "tr",
  ar: "ar", fa: "fa", ur: "ur", fil: "fil", tl: "fil", th: "th", id: "id",
  ms: "ms", vi: "vi", my: "my", km: "km", lo: "lo", hi: "hi", bn: "bn",
  ta: "ta", ne: "ne", si: "si", kk: "kk", uz: "uz", mn: "mn",
};

function resolveBrowserLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized === "zh-tw" || normalized === "zh-hk" || normalized === "zh-mo" || normalized.includes("hant")) {
      return "zh-Hant";
    }
    if (normalized === "pt-br") return "pt-BR";
    const matched = localeByBrowserCode[normalized.split("-")[0]];
    if (matched) return matched;
  }
  return "en";
}

const lessonSentences = [
  "저는 음악을 좋아해요.",
  "오늘은 기분이 좋아요.",
  "한국어를 매일 연습해요.",
  "천천히 이야기해 주세요.",
  "친구하고 여행하고 싶어요.",
];

const koreanKeyRows: Array<{ row: KeyboardRow; keys: KoreanKey[] }> = [
  {
    row: "top",
    keys: [
      { jamo: "ㅂ", code: "KeyQ", row: "top" },
      { jamo: "ㅈ", code: "KeyW", row: "top" },
      { jamo: "ㄷ", code: "KeyE", row: "top" },
      { jamo: "ㄱ", code: "KeyR", row: "top" },
      { jamo: "ㅅ", code: "KeyT", row: "top" },
      { jamo: "ㅛ", code: "KeyY", row: "top" },
      { jamo: "ㅕ", code: "KeyU", row: "top" },
      { jamo: "ㅑ", code: "KeyI", row: "top" },
      { jamo: "ㅐ", code: "KeyO", row: "top" },
      { jamo: "ㅔ", code: "KeyP", row: "top" },
    ],
  },
  {
    row: "home",
    keys: [
      { jamo: "ㅁ", code: "KeyA", row: "home" },
      { jamo: "ㄴ", code: "KeyS", row: "home" },
      { jamo: "ㅇ", code: "KeyD", row: "home" },
      { jamo: "ㄹ", code: "KeyF", row: "home" },
      { jamo: "ㅎ", code: "KeyG", row: "home" },
      { jamo: "ㅗ", code: "KeyH", row: "home" },
      { jamo: "ㅓ", code: "KeyJ", row: "home" },
      { jamo: "ㅏ", code: "KeyK", row: "home" },
      { jamo: "ㅣ", code: "KeyL", row: "home" },
    ],
  },
  {
    row: "bottom",
    keys: [
      { jamo: "ㅋ", code: "KeyZ", row: "bottom" },
      { jamo: "ㅌ", code: "KeyX", row: "bottom" },
      { jamo: "ㅊ", code: "KeyC", row: "bottom" },
      { jamo: "ㅍ", code: "KeyV", row: "bottom" },
      { jamo: "ㅠ", code: "KeyB", row: "bottom" },
      { jamo: "ㅜ", code: "KeyN", row: "bottom" },
      { jamo: "ㅡ", code: "KeyM", row: "bottom" },
    ],
  },
];

const koreanKeys = koreanKeyRows.flatMap(({ keys }) => keys);
const keyByJamo = new Map(koreanKeys.map((key) => [key.jamo, key]));
const initialJamo = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const medialJamo = [
  ["ㅏ"], ["ㅐ"], ["ㅑ"], ["ㅒ"], ["ㅓ"], ["ㅔ"], ["ㅕ"], ["ㅖ"], ["ㅗ"],
  ["ㅗ", "ㅏ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅛ"], ["ㅜ"], ["ㅜ", "ㅓ"],
  ["ㅜ", "ㅔ"], ["ㅜ", "ㅣ"], ["ㅠ"], ["ㅡ"], ["ㅡ", "ㅣ"], ["ㅣ"],
];
const finalJamo = [
  [], ["ㄱ"], ["ㄱ", "ㅅ"], ["ㄴ"], ["ㄴ", "ㅈ"], ["ㄴ", "ㅎ"], ["ㄷ"], ["ㄹ"],
  ["ㄹ", "ㄱ"], ["ㄹ", "ㅁ"], ["ㄹ", "ㅂ"], ["ㄹ", "ㅅ"], ["ㄹ", "ㅌ"], ["ㄹ", "ㅍ"],
  ["ㄹ", "ㅎ"], ["ㅁ"], ["ㅂ"], ["ㅂ", "ㅅ"], ["ㅅ"], ["ㅅ", "ㅅ"], ["ㅇ"], ["ㅈ"],
  ["ㅊ"], ["ㅋ"], ["ㅌ"], ["ㅍ"], ["ㅎ"],
];
const shiftedJamo: Record<string, string> = {
  "ㄲ": "ㄱ", "ㄸ": "ㄷ", "ㅃ": "ㅂ", "ㅆ": "ㅅ", "ㅉ": "ㅈ", "ㅒ": "ㅐ", "ㅖ": "ㅔ",
};

function keyForJamo(jamo: string): KoreanKey | null {
  const baseJamo = shiftedJamo[jamo] ?? jamo;
  const key = keyByJamo.get(baseJamo);
  return key ? { ...key, jamo, shift: jamo in shiftedJamo } : null;
}

function sentenceToPracticeSequence(sentence: string): KoreanKey[] {
  const sequence: KoreanKey[] = [];

  for (const character of Array.from(sentence)) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint >= 0xac00 && codePoint <= 0xd7a3) {
      const syllableIndex = codePoint - 0xac00;
      const initialIndex = Math.floor(syllableIndex / 588);
      const medialIndex = Math.floor((syllableIndex % 588) / 28);
      const finalIndex = syllableIndex % 28;
      const jamoSequence = [initialJamo[initialIndex], ...medialJamo[medialIndex], ...finalJamo[finalIndex]];
      for (const jamo of jamoSequence) {
        const key = keyForJamo(jamo);
        if (key) sequence.push(key);
      }
    } else if (character === " ") {
      sequence.push({ jamo: "Space", code: "Space", row: "bottom" });
    } else if (character === ".") {
      sequence.push({ jamo: ".", code: "Period", row: "bottom" });
    } else {
      const key = keyForJamo(character);
      if (key) sequence.push(key);
    }
  }

  return sequence;
}

const keyboardLegends: Record<KeyboardLayout, Partial<Record<string, string>>> = {
  qwerty: {},
  azerty: { KeyQ: "A", KeyW: "Z", KeyA: "Q", KeyZ: "W", KeyM: "," },
  qwertz: { KeyY: "Z", KeyZ: "Y" },
};

function keyboardLegend(layout: KeyboardLayout, code: string) {
  if (code === "Space") return "SPACE";
  if (code === "Period") return layout === "azerty" ? ":" : ".";
  return keyboardLegends[layout][code] ?? code.replace("Key", "");
}

function practiceKeyLegend(layout: KeyboardLayout, key: KoreanKey) {
  const legend = keyboardLegend(layout, key.code);
  return key.shift ? `Shift+${legend}` : legend;
}

const fingerByCode: Record<string, string> = {
  KeyQ: "left-pinky", KeyA: "left-pinky", KeyZ: "left-pinky",
  KeyW: "left-ring", KeyS: "left-ring", KeyX: "left-ring",
  KeyE: "left-middle", KeyD: "left-middle", KeyC: "left-middle",
  KeyR: "left-index", KeyT: "left-index", KeyF: "left-index", KeyG: "left-index", KeyV: "left-index", KeyB: "left-index",
  KeyY: "right-index", KeyU: "right-index", KeyH: "right-index", KeyJ: "right-index", KeyN: "right-index", KeyM: "right-index",
  KeyI: "right-middle", KeyK: "right-middle",
  KeyO: "right-ring", KeyL: "right-ring",
  KeyP: "right-pinky",
};

function formatPracticeTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const englishKeyboardCopy: KeyboardHelpCopy = {
  myKeyboard: "My keyboard",
  nextKey: "Next Korean key",
  press: "Press",
  yourKey: "Your key",
  hangul: "Hangul",
  mapTitle: "Korean 2-set keyboard map",
  layoutNote: "Choose the Latin layout printed on your keys. The highlighted position stays the same.",
  complete: "All keys complete!",
};

const keyboardHelpCopy: Partial<Record<Locale, KeyboardHelpCopy>> = {
  en: englishKeyboardCopy,
  ko: {
    myKeyboard: "내 키보드",
    nextKey: "다음 한글 키",
    press: "누르기",
    yourKey: "내 키보드",
    hangul: "한글",
    mapTitle: "두벌식 한글 자판 위치",
    layoutNote: "키보드에 인쇄된 영문 배열을 고르세요. 강조된 물리적 위치는 같습니다.",
    complete: "모든 키를 입력했어요!",
  },
  "pt-BR": {
    myKeyboard: "Meu teclado",
    nextKey: "Próxima tecla coreana",
    press: "Pressione",
    yourKey: "Sua tecla",
    hangul: "Hangul",
    mapTitle: "Mapa do teclado coreano",
    layoutNote: "Escolha o padrão latino impresso nas teclas. A posição destacada não muda.",
    complete: "Todas as teclas concluídas!",
  },
  ar: {
    myKeyboard: "لوحة مفاتيحي",
    nextKey: "مفتاح الهانغل التالي",
    press: "اضغط",
    yourKey: "مفتاحك",
    hangul: "هانغل",
    mapTitle: "خريطة لوحة المفاتيح الكورية",
    layoutNote: "اختر ترتيب الحروف اللاتينية المطبوع على مفاتيحك. يبقى موضع التمييز نفسه.",
    complete: "اكتملت جميع المفاتيح!",
  },
  fa: {
    myKeyboard: "صفحه‌کلید من",
    nextKey: "کلید بعدی هانگول",
    press: "فشار دهید",
    yourKey: "کلید شما",
    hangul: "هانگول",
    mapTitle: "نقشه صفحه‌کلید کره‌ای",
    layoutNote: "چیدمان لاتین چاپ‌شده روی کلیدها را انتخاب کنید. جای کلید برجسته ثابت است.",
    complete: "همه کلیدها کامل شد!",
  },
  fil: {
    myKeyboard: "Keyboard ko",
    nextKey: "Susunod na Hangul key",
    press: "Pindutin",
    yourKey: "Iyong key",
    hangul: "Hangul",
    mapTitle: "Mapa ng Korean keyboard",
    layoutNote: "Piliin ang Latin layout na nakalimbag sa iyong mga key. Hindi nagbabago ang naka-highlight na puwesto.",
    complete: "Kumpleto na ang lahat ng key!",
  },
  th: {
    myKeyboard: "แป้นพิมพ์ของฉัน",
    nextKey: "ปุ่มฮันกึลถัดไป",
    press: "กด",
    yourKey: "ปุ่มของคุณ",
    hangul: "ฮันกึล",
    mapTitle: "ผังแป้นพิมพ์ภาษาเกาหลี",
    layoutNote: "เลือกรูปแบบอักษรละตินที่พิมพ์บนปุ่ม ตำแหน่งที่ไฮไลต์จะเหมือนเดิม",
    complete: "พิมพ์ครบทุกปุ่มแล้ว!",
  },
  id: {
    myKeyboard: "Keyboard saya",
    nextKey: "Tombol Hangul berikutnya",
    press: "Tekan",
    yourKey: "Tombol Anda",
    hangul: "Hangul",
    mapTitle: "Peta keyboard Korea",
    layoutNote: "Pilih tata letak Latin yang tercetak pada tombol. Posisi sorotan tetap sama.",
    complete: "Semua tombol selesai!",
  },
  ms: {
    myKeyboard: "Papan kekunci saya",
    nextKey: "Kekunci Hangul seterusnya",
    press: "Tekan",
    yourKey: "Kekunci anda",
    hangul: "Hangul",
    mapTitle: "Peta papan kekunci Korea",
    layoutNote: "Pilih susun atur Latin yang tercetak pada kekunci. Kedudukan yang diserlahkan kekal sama.",
    complete: "Semua kekunci selesai!",
  },
};

const englishSpeechCopy: SpeechHelpCopy = {
  label: "Auto Korean pronunciation",
  on: "On",
  off: "Off",
  unavailable: "Korean voice is unavailable in this browser",
};

const speechHelpCopy: Partial<Record<Locale, SpeechHelpCopy>> = {
  en: englishSpeechCopy,
  ko: { label: "한국어 자동 발음", on: "켜짐", off: "꺼짐", unavailable: "이 브라우저에서는 한국어 음성을 사용할 수 없습니다" },
  "pt-BR": { label: "Pronúncia coreana automática", on: "Ligado", off: "Desligado", unavailable: "A voz coreana não está disponível neste navegador" },
  ar: { label: "النطق الكوري التلقائي", on: "مفعّل", off: "متوقف", unavailable: "الصوت الكوري غير متاح في هذا المتصفح" },
  fa: { label: "تلفظ خودکار کره‌ای", on: "روشن", off: "خاموش", unavailable: "صدای کره‌ای در این مرورگر در دسترس نیست" },
  fil: { label: "Awtomatikong Korean bigkas", on: "Naka-on", off: "Naka-off", unavailable: "Walang Korean voice sa browser na ito" },
  th: { label: "อ่านออกเสียงเกาหลีอัตโนมัติ", on: "เปิด", off: "ปิด", unavailable: "เบราว์เซอร์นี้ไม่มีเสียงภาษาเกาหลี" },
  id: { label: "Pelafalan Korea otomatis", on: "Aktif", off: "Nonaktif", unavailable: "Suara Korea tidak tersedia di browser ini" },
  ms: { label: "Sebutan Korea automatik", on: "Hidup", off: "Mati", unavailable: "Suara Korea tidak tersedia dalam pelayar ini" },
};

const englishReturnSoundCopy: ReturnSoundCopy = { label: "Learning sounds · typewriter", on: "On", off: "Off" };
const returnSoundCopy: Partial<Record<Locale, ReturnSoundCopy>> = {
  en: englishReturnSoundCopy,
  ko: { label: "학습 효과음·타자기", on: "켜짐", off: "꺼짐" },
  "pt-BR": { label: "Som de retorno da máquina", on: "Ligado", off: "Desligado" },
  ar: { label: "صوت رجوع الآلة الكاتبة", on: "مفعّل", off: "متوقف" },
  fa: { label: "صدای برگشت ماشین‌تحریر", on: "روشن", off: "خاموش" },
  fil: { label: "Tunog ng typewriter return", on: "Naka-on", off: "Naka-off" },
  th: { label: "เสียงขึ้นบรรทัดใหม่แบบเครื่องพิมพ์ดีด", on: "เปิด", off: "ปิด" },
  id: { label: "Suara pindah baris mesin tik", on: "Aktif", off: "Nonaktif" },
  ms: { label: "Bunyi baris baharu mesin taip", on: "Hidup", off: "Mati" },
};

function playTypewriterReturnSound() {
  const AudioContextConstructor = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;

  const context = new AudioContextConstructor();
  const now = context.currentTime;
  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.11), context.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
  }

  const carriage = context.createBufferSource();
  const carriageFilter = context.createBiquadFilter();
  const carriageGain = context.createGain();
  carriage.buffer = noiseBuffer;
  carriageFilter.type = "bandpass";
  carriageFilter.frequency.setValueAtTime(2200, now);
  carriageFilter.Q.setValueAtTime(0.8, now);
  carriageGain.gain.setValueAtTime(0.11, now);
  carriageGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  carriage.connect(carriageFilter).connect(carriageGain).connect(context.destination);

  const bell = context.createOscillator();
  const bellGain = context.createGain();
  bell.type = "triangle";
  bell.frequency.setValueAtTime(920, now + 0.035);
  bell.frequency.exponentialRampToValueAtTime(610, now + 0.18);
  bellGain.gain.setValueAtTime(0.001, now);
  bellGain.gain.linearRampToValueAtTime(0.1, now + 0.04);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  bell.connect(bellGain).connect(context.destination);

  carriage.start(now);
  bell.start(now + 0.035);
  bell.stop(now + 0.21);
  window.setTimeout(() => void context.close(), 280);
}

function playSuccessChime() {
  const AudioContextConstructor = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;
  const context = new AudioContextConstructor();
  const now = context.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * 0.075;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.075, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.15);
  });
  window.setTimeout(() => void context.close(), 420);
}

const tetrisWords = [
  { korean: "사랑", meaning: "love" },
  { korean: "음악", meaning: "music" },
  { korean: "친구", meaning: "friend" },
  { korean: "한국", meaning: "Korea" },
];

const screenPracticeLines = [
  {
    korean: "오늘도 잘해냈어. 내일은 더 빛날 거야.",
    translation: "You did well today. Tomorrow will shine even brighter.",
    genre: "Healing drama",
  },
  {
    korean: "포기하지 마. 우리의 이야기는 아직 끝나지 않았어.",
    translation: "Don’t give up. Our story isn’t over yet.",
    genre: "Youth movie",
  },
  {
    korean: "어디에 있든, 다시 만날 사람은 결국 만나게 돼.",
    translation: "Wherever we are, people meant to meet will find each other again.",
    genre: "Romance drama",
  },
];

const travelPhrases: Record<TravelMode, Array<{ korean: string; meaning: string; situation: string }>> = {
  inKorea: [
    { korean: "화장실이 어디예요?", meaning: "Where is the restroom?", situation: "Finding a place" },
    { korean: "이 주소로 가 주세요.", meaning: "Please take me to this address.", situation: "Taking a taxi" },
    { korean: "이거 얼마예요?", meaning: "How much is this?", situation: "Shopping" },
  ],
  welcome: [
    { korean: "한국에서 오셨어요?", meaning: "Are you from Korea?", situation: "Starting a conversation" },
    { korean: "제가 도와드릴까요?", meaning: "May I help you?", situation: "Offering help" },
    { korean: "우리 동네 맛집을 알려 드릴게요.", meaning: "I’ll show you a good local restaurant.", situation: "Sharing a local tip" },
  ],
};

function staticVoicePair(slug: string) {
  return {
    female: `/audio/ko/${slug}-female.mp3`,
    male: `/audio/ko/${slug}-male.mp3`,
  };
}

const staticSpeechAudioByText = new Map<string, { female: string; male: string }>([
  ...lessonSentences.map((text, index) => [text, staticVoicePair(`lesson-${String(index + 1).padStart(2, "0")}`)] as const),
  ...travelPhrases.inKorea.map((item, index) => [item.korean, staticVoicePair(`travel-korea-${String(index + 1).padStart(2, "0")}`)] as const),
  ...travelPhrases.welcome.map((item, index) => [item.korean, staticVoicePair(`travel-welcome-${String(index + 1).padStart(2, "0")}`)] as const),
  ...screenPracticeLines.map((item, index) => [item.korean, staticVoicePair(`scene-${String(index + 1).padStart(2, "0")}`)] as const),
]);

const learningLevels = [
  "Hangul principle",
  "Home row",
  "Lower row",
  "Upper row",
  "Syllables",
  "Final consonants",
  "Double consonants",
  "Easy words",
  "Daily words",
  "Phrases",
  "Sentences",
  "Dictation",
  "Travel & local conversations",
  "Long-form",
  "K-POP challenge",
  "K-Drama & movie lines",
];

const activities: Array<{
  id: ActivityId;
  kicker: string;
  title: string;
  korean: string;
  description: string;
  time: string;
  accent: string;
}> = [
  {
    id: "home",
    kicker: "LEARN · 5 MIN",
    title: "Home-row practice",
    korean: "기본자리 연습",
    description: "Place your fingers and master ㅁ, ㄴ, ㅇ, ㄹ.",
    time: "Continue · 67%",
    accent: "lime",
  },
  {
    id: "tetris",
    kicker: "GAME · 2 MIN",
    title: "Word Tetris",
    korean: "단어 테트리스",
    description: "Type each Korean word before it reaches the floor.",
    time: "Best · 1,240",
    accent: "purple",
  },
  {
    id: "missing",
    kicker: "PUZZLE · 2 MIN",
    title: "Missing Letter",
    korean: "빠진 글자",
    description: "Complete familiar words one syllable at a time.",
    time: "12 words · New",
    accent: "pink",
  },
  {
    id: "crossword",
    kicker: "QUIZ · 4 MIN",
    title: "Korean Crossword",
    korean: "가로세로 퀴즈",
    description: "Connect clues, sounds, and meanings.",
    time: "4 clues · Daily",
    accent: "cyan",
  },
  {
    id: "travel",
    kicker: "REAL-LIFE KOREAN · 3 MIN",
    title: "Travel & Say Hello",
    korean: "여행 회화·한국인에게 말 걸기",
    description: "Travel in Korea or welcome Korean visitors in your country.",
    time: "2 paths · 6 scenes",
    accent: "orange",
  },
  {
    id: "kpop",
    kicker: "REWARD CHALLENGE",
    title: "Licensed K-POP Lyrics",
    korean: "K-POP 가사 타자",
    description: "Unlock official lyric typing after long-form Level 5.",
    time: "Locked · Level 4/5",
    accent: "stripe",
  },
  {
    id: "screen",
    kicker: "SCENE CHALLENGE",
    title: "K-Drama & Movie Lines",
    korean: "K-드라마·영화 명대사",
    description: "Type memorable licensed dialogue, one dramatic scene at a time.",
    time: "Preview · 3 scenes",
    accent: "sunset",
  },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [returnSoundEnabled, setReturnSoundEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [neuralTtsAvailable, setNeuralTtsAvailable] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [advanceQueued, setAdvanceQueued] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("qwerty");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [privacyNoticeVisible, setPrivacyNoticeVisible] = useState(false);
  const [accountSummary, setAccountSummary] = useState<{ streakDays: number; coins: number } | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [activeActivity, setActiveActivity] = useState<ActivityId>("home");
  const [tetrisInput, setTetrisInput] = useState("");
  const [tetrisIndex, setTetrisIndex] = useState(0);
  const [tetrisScore, setTetrisScore] = useState(320);
  const [tetrisMessage, setTetrisMessage] = useState("Type the falling word.");
  const [missingAnswer, setMissingAnswer] = useState("");
  const [crosswordAnswer, setCrosswordAnswer] = useState("");
  const [screenInput, setScreenInput] = useState("");
  const [screenIndex, setScreenIndex] = useState(0);
  const [managedContent, setManagedContent] = useState<PublishedContentItem[]>([]);
  const [kpopInput, setKpopInput] = useState("");
  const [kpopIndex, setKpopIndex] = useState(0);
  const [travelMode, setTravelMode] = useState<TravelMode>("inKorea");
  const [travelIndex, setTravelIndex] = useState(0);
  const [travelInput, setTravelInput] = useState("");
  const pendingActionRef = useRef<(() => void) | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioUrlRef = useRef<string | null>(null);
  const speechRequestRef = useRef(0);
  const speakingRef = useRef(false);

  const t = copy[locale];
  const keyboardText = keyboardHelpCopy[locale] ?? englishKeyboardCopy;
  const speechText = speechHelpCopy[locale] ?? englishSpeechCopy;
  const returnSoundText = returnSoundCopy[locale] ?? englishReturnSoundCopy;
  const targetSentence = lessonSentences[lessonIndex];
  const practiceSequence = useMemo(() => sentenceToPracticeSequence(targetSentence), [targetSentence]);
  const activePracticeKey = practiceSequence[guideStep] ?? null;
  const upcomingPracticeKeys = practiceSequence.slice(guideStep, guideStep + 7);
  const targetChars = useMemo(() => Array.from(targetSentence), [targetSentence]);
  const typedChars = Array.from(typed);
  const correctChars = typedChars.reduce(
    (total, character, index) => total + (character === targetChars[index] ? 1 : 0),
    0,
  );
  const accuracy = typedChars.length === 0 ? 100 : Math.round((correctChars / typedChars.length) * 100);
  const sentenceProgress = Math.min(100, Math.round((typedChars.length / targetChars.length) * 100));
  const sentenceComplete = typed === targetSentence;
  const completedSentences = lessonFinished
    ? lessonSentences.length
    : Math.min(lessonSentences.length, lessonIndex + (sentenceComplete ? 1 : 0));
  const dailyProgress = lessonStarted
    ? lessonFinished
      ? 100
      : Math.min(100, Math.round(((lessonIndex + sentenceProgress / 100) / lessonSentences.length) * 100))
    : 0;
  const managedScreenLines = useMemo(() => managedContent
    .filter((item) => item.category === "kdrama" || item.category === "movie")
    .map((item) => ({
      korean: item.koreanText,
      translation: item.translation,
      genre: item.category === "kdrama" ? "K-Drama" : "K-Movie",
    })), [managedContent]);
  const availableScreenLines = managedScreenLines.length ? managedScreenLines : screenPracticeLines;
  const currentScreenLine = availableScreenLines[screenIndex % availableScreenLines.length];
  const screenComplete = screenInput.trim() === currentScreenLine.korean;
  const screenChars = Array.from(screenInput);
  const screenTargetChars = Array.from(currentScreenLine.korean);
  const screenCorrectChars = screenChars.reduce(
    (total, character, index) => total + (character === screenTargetChars[index] ? 1 : 0),
    0,
  );
  const screenAccuracy = screenChars.length === 0 ? 100 : Math.round((screenCorrectChars / screenChars.length) * 100);
  const publishedKpopItems = useMemo(() => managedContent.filter((item) => item.category === "kpop"), [managedContent]);
  const currentKpopItem = publishedKpopItems.length ? publishedKpopItems[kpopIndex % publishedKpopItems.length] : null;
  const kpopComplete = currentKpopItem ? kpopInput.trim() === currentKpopItem.koreanText : false;
  const currentTravelPhrase = travelPhrases[travelMode][travelIndex % travelPhrases[travelMode].length];
  const travelComplete = travelInput.trim() === currentTravelPhrase.korean;

  const finishSpeech = useCallback(() => {
    speakingRef.current = false;
    setIsSpeaking(false);
    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
    }
    activeAudioRef.current = null;
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    setAdvanceQueued(false);
    if (pendingAction) window.setTimeout(pendingAction, 0);
  }, []);

  const playKorean = useCallback((text: string) => {
    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    speakingRef.current = true;
    setIsSpeaking(true);

    const playDeviceVoice = () => {
      if (requestId !== speechRequestRef.current) return;
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        finishSpeech();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const koreanVoices = window.speechSynthesis.getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("ko"));
      const voiceHints = voiceGender === "female"
        ? ["female", "woman", "여성", "sunhi", "yuna", "sora", "heami", "유나", "서현"]
        : ["male", "man", "남성", "injoon", "hyunsu", "minjun", "민준", "현수"];
      const preferredVoice = koreanVoices.find((voice) => {
        const name = voice.name.toLowerCase();
        return voiceHints.some((hint) => name.includes(hint));
      }) ?? koreanVoices[voiceGender === "male" && koreanVoices.length > 1 ? 1 : 0];

      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.pitch = preferredVoice ? 1 : voiceGender === "female" ? 1.06 : 0.9;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;
      window.speechSynthesis.speak(utterance);
    };

    const playAudioSource = (audioUrl: string, onFailure: () => void, revokeAfterUse = false) => {
      if (requestId !== speechRequestRef.current) return;
      const audio = new Audio(audioUrl);
      if (revokeAfterUse) activeAudioUrlRef.current = audioUrl;
      activeAudioRef.current = audio;
      audio.onended = finishSpeech;
      audio.onerror = () => {
        if (revokeAfterUse) URL.revokeObjectURL(audioUrl);
        activeAudioUrlRef.current = null;
        activeAudioRef.current = null;
        onFailure();
      };
      void audio.play().catch(onFailure);
    };

    const playNeuralVoice = () => {
      if (!neuralTtsAvailable) {
        playDeviceVoice();
        return;
      }
      void fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice: voiceGender }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Neural voice unavailable");
          return response.blob();
        })
        .then((audioBlob) => {
          if (requestId !== speechRequestRef.current) return;
          playAudioSource(URL.createObjectURL(audioBlob), playDeviceVoice, true);
        })
        .catch(playDeviceVoice);
    };

    const managedItem = managedContent.find((item) => item.koreanText === text);
    const recordedUrl = (managedItem
      ? voiceGender === "female" ? managedItem.audioFemaleUrl : managedItem.audioMaleUrl
      : "") || staticSpeechAudioByText.get(text)?.[voiceGender];
    if (recordedUrl) {
      playAudioSource(recordedUrl, playNeuralVoice);
      return;
    }
    playNeuralVoice();
  }, [finishSpeech, managedContent, neuralTtsAvailable, voiceGender]);

  const runAfterSpeech = useCallback((action: () => void) => {
    const browserIsSpeaking = "speechSynthesis" in window && window.speechSynthesis.speaking;
    if (speakingRef.current || isSpeaking || browserIsSpeaking) {
      pendingActionRef.current = action;
      setAdvanceQueued(true);
    } else {
      action();
    }
  }, [isSpeaking]);

  const confirmAndAdvance = useCallback((action: () => void) => {
    if (returnSoundEnabled) playTypewriterReturnSound();
    runAfterSpeech(action);
  }, [returnSoundEnabled, runAfterSpeech]);

  const advanceLesson = useCallback(() => {
    setAdvanceQueued(false);
    if (lessonIndex >= lessonSentences.length - 1) {
      setLessonFinished(true);
      return;
    }
    setLessonIndex((index) => index + 1);
    setTyped("");
    setGuideStep(0);
    window.setTimeout(() => document.getElementById("hero-typing-input")?.focus(), 0);
  }, [lessonIndex]);

  const advanceTravelPhrase = useCallback(() => {
    setTravelIndex((index) => (index + 1) % travelPhrases[travelMode].length);
    setTravelInput("");
  }, [travelMode]);

  const advanceScreenLine = useCallback(() => {
    setScreenIndex((index) => (index + 1) % availableScreenLines.length);
    setScreenInput("");
  }, [availableScreenLines.length]);

  const advanceKpopLine = useCallback(() => {
    if (!publishedKpopItems.length) return;
    setKpopIndex((index) => (index + 1) % publishedKpopItems.length);
    setKpopInput("");
  }, [publishedKpopItems.length]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
      const savedLocale = window.localStorage.getItem("hangeul-pop-locale");
      const savedKeyboardLayout = window.localStorage.getItem("hangeul-pop-keyboard-layout");
      const savedAutoSpeak = window.localStorage.getItem("hangeul-pop-auto-speak");
      const savedVoiceGender = window.localStorage.getItem("hangeul-pop-voice-gender");
      const savedReturnSound = window.localStorage.getItem("hangeul-pop-return-sound");
      const savedDailyLesson = window.localStorage.getItem("hangeul-pop-daily-lesson");
      const savedPrivacyNotice = window.localStorage.getItem("hangeul-pop-privacy-notice");
      if (savedLocale && savedLocale in copy) {
        setLocale(savedLocale as Locale);
      } else {
        setLocale(resolveBrowserLocale(navigator.languages));
      }
      if (savedKeyboardLayout === "qwerty" || savedKeyboardLayout === "azerty" || savedKeyboardLayout === "qwertz") {
        setKeyboardLayout(savedKeyboardLayout);
      }
      if (savedAutoSpeak === "false") setAutoSpeak(false);
      if (savedVoiceGender === "female" || savedVoiceGender === "male") setVoiceGender(savedVoiceGender);
      if (savedReturnSound === "false") setReturnSoundEnabled(false);
      setPrivacyNoticeVisible(savedPrivacyNotice !== "accepted-v1");
      if (savedDailyLesson) {
        const dailyLesson = JSON.parse(savedDailyLesson) as {
          date?: string;
          lessonIndex?: number;
          lessonStarted?: boolean;
          lessonFinished?: boolean;
        };
        const today = new Date().toLocaleDateString("en-CA");
        if (dailyLesson.date === today) {
          setLessonIndex(Math.min(Math.max(0, dailyLesson.lessonIndex ?? 0), lessonSentences.length - 1));
          setLessonStarted(Boolean(dailyLesson.lessonStarted));
          setLessonFinished(Boolean(dailyLesson.lessonFinished));
        }
      }
      } catch {
        setLocale(resolveBrowserLocale(navigator.languages));
      }
      const supported = "Audio" in window || ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
      setSpeechSupported(supported);
      if (!supported) setAutoSpeak(false);
      setProgressLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/tts", { headers: { accept: "application/json" } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((status) => {
        if (!active || !status?.available) return;
        setNeuralTtsAvailable(true);
        setSpeechSupported(true);
      })
      .catch(() => {
        // The device's Korean voice remains available as a no-cost fallback.
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/content", { headers: { accept: "application/json" } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (active && Array.isArray(payload?.items)) setManagedContent(payload.items as PublishedContentItem[]);
      })
      .catch(() => {
        // Built-in original practice content stays available while the library is offline.
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.has(locale) ? "rtl" : "ltr";
    try {
      window.localStorage.setItem("hangeul-pop-locale", locale);
    } catch {
      // The language still applies for this session when storage is unavailable.
    }
  }, [locale]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hangeul-pop-keyboard-layout", keyboardLayout);
    } catch {
      // The keyboard layout still applies for this session when storage is unavailable.
    }
  }, [keyboardLayout]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hangeul-pop-auto-speak", String(autoSpeak));
    } catch {
      // The pronunciation preference still applies for this session when storage is unavailable.
    }
    if (!autoSpeak) {
      speechRequestRef.current += 1;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      activeAudioRef.current?.pause();
      const finishTimer = window.setTimeout(finishSpeech, 0);
      return () => window.clearTimeout(finishTimer);
    }
  }, [autoSpeak, finishSpeech]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hangeul-pop-voice-gender", voiceGender);
    } catch {
      // The selected voice still applies for this session when storage is unavailable.
    }
  }, [voiceGender]);

  useEffect(() => {
    try {
      window.localStorage.setItem("hangeul-pop-return-sound", String(returnSoundEnabled));
    } catch {
      // The sound preference still applies for this session when storage is unavailable.
    }
  }, [returnSoundEnabled]);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem("hangeul-pop-daily-lesson", JSON.stringify({
        date: new Date().toLocaleDateString("en-CA"),
        lessonIndex,
        lessonStarted,
        lessonFinished,
      }));
    } catch {
      // Daily progress remains available for this session when storage is unavailable.
    }
  }, [lessonFinished, lessonIndex, lessonStarted, progressLoaded]);

  useEffect(() => {
    let active = true;
    void fetch("/api/progress", { headers: { accept: "application/json" } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((profile) => {
        if (!active || !profile?.user || !profile?.progress) return;
        setAccountSummary({ streakDays: profile.user.streakDays, coins: profile.user.coins });
        const serverProgress = profile.progress as {
          currentLesson: number;
          completedSentences: number;
          typingSeconds: number;
          lessonFinished: boolean;
        };
        if (serverProgress.completedSentences > completedSentences || serverProgress.lessonFinished) {
          setLessonIndex(Math.min(serverProgress.currentLesson, lessonSentences.length - 1));
          setLessonStarted(serverProgress.completedSentences > 0 || serverProgress.lessonFinished);
          setLessonFinished(serverProgress.lessonFinished);
          setElapsedSeconds(serverProgress.typingSeconds);
          setTyped("");
          setGuideStep(0);
        }
      })
      .catch(() => {
        // Anonymous visitors and offline learners continue with device-local progress.
      });
    return () => { active = false; };
  // The initial account sync intentionally runs once after hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!progressLoaded || !lessonStarted) return;
    const payload = {
      currentLesson: lessonIndex,
      completedSentences,
      totalSentences: lessonSentences.length,
      typingSeconds: elapsedSeconds,
      accuracy,
      lessonFinished,
    };
    const timer = window.setTimeout(() => {
      void fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => response.ok ? response.json() : null)
        .then((profile) => {
          if (profile?.user) setAccountSummary({ streakDays: profile.user.streakDays, coins: profile.user.coins });
        })
        .catch(() => {
          // Device-local progress remains available if account sync is unavailable.
        });
    }, 350);
    return () => window.clearTimeout(timer);
  // Sync on meaningful lesson milestones rather than posting every elapsed second or keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSentences, lessonFinished, lessonIndex, lessonStarted, progressLoaded]);

  useEffect(() => {
    if (!lessonStarted || lessonFinished) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [lessonFinished, lessonStarted]);

  useEffect(() => {
    if (!autoSpeak || !sentenceComplete) return;
    const timer = window.setTimeout(() => playKorean(targetSentence), 0);
    return () => window.clearTimeout(timer);
  }, [autoSpeak, playKorean, sentenceComplete, targetSentence]);

  useEffect(() => {
    if (!autoSpeak || !travelComplete) return;
    const timer = window.setTimeout(() => playKorean(currentTravelPhrase.korean), 0);
    return () => window.clearTimeout(timer);
  }, [autoSpeak, playKorean, travelComplete, currentTravelPhrase.korean]);

  useEffect(() => {
    if (!autoSpeak || !screenComplete) return;
    const timer = window.setTimeout(() => playKorean(currentScreenLine.korean), 0);
    return () => window.clearTimeout(timer);
  }, [autoSpeak, playKorean, screenComplete, currentScreenLine.korean]);

  useEffect(() => {
    if (!autoSpeak || !kpopComplete || !currentKpopItem) return;
    const timer = window.setTimeout(() => playKorean(currentKpopItem.koreanText), 0);
    return () => window.clearTimeout(timer);
  }, [autoSpeak, currentKpopItem, kpopComplete, playKorean]);

  function submitTetris(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = tetrisWords[tetrisIndex % tetrisWords.length];
    if (tetrisInput.trim() === current.korean) {
      if (returnSoundEnabled) playSuccessChime();
      setTetrisScore((score) => score + 100);
      setTetrisIndex((index) => index + 1);
      setTetrisInput("");
      setTetrisMessage("Perfect! +100");
    } else {
      setTetrisMessage(`Try again — ${current.meaning}`);
    }
  }

  function startTodayLesson() {
    if (!lessonStarted || lessonFinished) {
      speechRequestRef.current += 1;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      if (activeAudioUrlRef.current) URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
      pendingActionRef.current = null;
      speakingRef.current = false;
      setIsSpeaking(false);
      setAdvanceQueued(false);
      setLessonIndex(0);
      setLessonStarted(true);
      setLessonFinished(false);
      setElapsedSeconds(0);
      setTyped("");
      setGuideStep(0);
    }
    window.setTimeout(() => {
      document.getElementById("practice")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("hero-typing-input")?.focus();
    }, 0);
  }

  return (
    <main className="site-shell" dir={rtlLocales.has(locale) ? "rtl" : "ltr"}>
      <a className="skip-link" href="#practice">Skip to practice</a>

      <header className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Hangeul Pop home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span>Hangeul Pop</span>
        </a>
        <nav className="nav-links" aria-label="Main menu">
          <a href="#learn">{t.navLearn}</a>
          <a href="#games">{t.navGames}</a>
          <a href="/my">{t.navProgress}</a>
        </nav>
        <div className="header-tools">
          <label
            className={`speech-toggle ${!speechSupported ? "unavailable" : ""}`}
            title={speechSupported ? speechText.label : speechText.unavailable}
          >
            <input
              type="checkbox"
              checked={autoSpeak}
              disabled={!speechSupported}
              onChange={(event) => setAutoSpeak(event.target.checked)}
              aria-label={`${speechText.label}: ${autoSpeak ? speechText.on : speechText.off}`}
            />
            <span className="speech-toggle-track" aria-hidden="true"><i /></span>
            <span className="speech-toggle-copy">
              <b>{speechText.label}</b>
              <small>{speechSupported ? autoSpeak ? speechText.on : speechText.off : speechText.unavailable}</small>
            </span>
          </label>
          <label className="voice-picker" title="Korean pronunciation voice">
            <span aria-hidden="true">{voiceGender === "female" ? "♀" : "♂"}</span>
            <span className="sr-only">Korean voice</span>
            <select value={voiceGender} onChange={(event) => setVoiceGender(event.target.value as VoiceGender)}>
              <option value="female">Female voice</option>
              <option value="male">Male voice</option>
            </select>
            <i>{neuralTtsAvailable ? "AI" : "MP3"}</i>
          </label>
          <label className="speech-toggle return-sound-toggle" title={returnSoundText.label}>
            <input
              type="checkbox"
              checked={returnSoundEnabled}
              onChange={(event) => setReturnSoundEnabled(event.target.checked)}
              aria-label={`${returnSoundText.label}: ${returnSoundEnabled ? returnSoundText.on : returnSoundText.off}`}
            />
            <span className="speech-toggle-track" aria-hidden="true"><i /></span>
            <span className="speech-toggle-copy">
              <b>{returnSoundText.label}</b>
              <small>{returnSoundEnabled ? returnSoundText.on : returnSoundText.off}</small>
            </span>
          </label>
          <label className="language-picker">
            <span className="sr-only">Interface language</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              {localeGroups.map((group) => (
                <optgroup label={group.label} key={group.label}>
                  {group.options.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true" /> {t.eyebrow}</p>
          <h1>
            <span>{t.headlineTop}</span>
            <span className="headline-accent">{t.headlineBottom}</span>
          </h1>
          <p className="hero-description">{t.description}</p>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={startTodayLesson}>
              {t.start} <span aria-hidden="true">→</span>
            </button>
            <a className="button button-secondary" href="#games">{t.explore}</a>
          </div>
          <div className="trust-row" aria-label="Service highlights">
            <span><b>{learningLevels.length}</b> learning levels</span>
            <span><b>{Object.keys(copy).length}</b> interface languages</span>
            <span><b>1</b> secure sign-in</span>
          </div>
        </div>

        <div className="practice-stage" id="practice">
          <div className="stage-orbit orbit-one" aria-hidden="true" />
          <div className="stage-orbit orbit-two" aria-hidden="true" />
          <article className="practice-card">
            <div className="practice-card-header">
              <div>
                <p className="card-kicker">{t.upNext}</p>
                <h2>{t.practiceTitle}</h2>
              </div>
              <a className="streak" href="/my">{accountSummary ? `${accountSummary.streakDays} day streak · ${accountSummary.coins} beats` : "My learning page"}</a>
            </div>

            <div className="typing-panel">
              <div className="typing-meta">
                <span>{lessonStarted ? `Sentence ${lessonIndex + 1} / ${lessonSentences.length}` : `Ready · ${lessonSentences.length} sentences`}</span>
                <span>{typedChars.length} / {targetChars.length} letters</span>
              </div>
              <p className="target-sentence" lang="ko" aria-label={targetSentence} key={targetSentence}>
                {targetChars.map((character, index) => {
                  const state = index < typedChars.length
                    ? typedChars[index] === character ? "correct" : "incorrect"
                    : index === typedChars.length ? "current" : "pending";
                  return <span className={state} key={`${character}-${index}`}>{character}</span>;
                })}
              </p>
              <input
                id="hero-typing-input"
                className="typing-input"
                lang="ko"
                value={typed}
                disabled={lessonFinished}
                onFocus={() => setLessonStarted(true)}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setLessonStarted(true);
                  setTyped(nextValue);
                  setGuideStep(Math.min(sentenceToPracticeSequence(nextValue).length, practiceSequence.length));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing && sentenceComplete) {
                    event.preventDefault();
                    confirmAndAdvance(advanceLesson);
                  }
                }}
                placeholder="여기에 입력하세요"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="typing-feedback"
              />
              <p className={`typing-feedback ${sentenceComplete ? "complete" : ""}`} id="typing-feedback" aria-live="polite">
                {lessonFinished
                  ? "Today’s lesson is complete. Great work!"
                  : advanceQueued
                    ? "🔊 Pronunciation is playing. The next sentence will open when it finishes."
                    : sentenceComplete
                      ? isSpeaking
                        ? "🔊 Listen to the pronunciation, then press Enter ↵"
                        : "✓ Sentence complete — press Enter ↵ for the next sentence"
                      : typedChars.length
                        ? `${accuracy}% accurate · keep going`
                        : "Follow the highlighted key position below."}
              </p>

              {lessonFinished ? (
                <div className="lesson-finish-card">
                  <span className="finish-mark" aria-hidden="true">✓</span>
                  <div>
                    <small>DAILY LESSON COMPLETE</small>
                    <h3>{lessonSentences.length} sentences finished</h3>
                    <p>{formatPracticeTime(elapsedSeconds)} practice · progress saved on this device</p>
                  </div>
                  <button className="button button-primary" type="button" onClick={startTodayLesson}>Practice again</button>
                </div>
              ) : (
                <>
                  <div className="keyboard-tools">
                    <label className="keyboard-layout-picker">
                      <span>{keyboardText.myKeyboard}</span>
                      <select value={keyboardLayout} onChange={(event) => setKeyboardLayout(event.target.value as KeyboardLayout)}>
                        <option value="qwerty">QWERTY</option>
                        <option value="azerty">AZERTY</option>
                        <option value="qwertz">QWERTZ</option>
                      </select>
                    </label>
                    <p>{keyboardText.layoutNote}</p>
                  </div>

                  {activePracticeKey ? (
                    <div className="next-key-card" aria-live="polite">
                      <span className="next-key-jamo" lang="ko">{activePracticeKey.jamo}</span>
                      <span className="next-key-copy">
                        <small>{keyboardText.nextKey}</small>
                        <b>{keyboardText.press} <kbd>{practiceKeyLegend(keyboardLayout, activePracticeKey)}</kbd></b>
                      </span>
                    </div>
                  ) : (
                    <div className="next-key-card complete" aria-live="polite">
                      <span aria-hidden="true">✓</span>
                      <b>{keyboardText.complete}</b>
                    </div>
                  )}

                  <div className="key-guide" aria-label="Upcoming Korean keys">
                    {upcomingPracticeKeys.map((key, index) => (
                      <kbd className={index === 0 ? "active" : ""} key={`${key.jamo}-${guideStep + index}`}>
                        <span lang="ko">{key.jamo}</span>
                        <small>{practiceKeyLegend(keyboardLayout, key)}</small>
                      </kbd>
                    ))}
                  </div>

                  <div className="keyboard-map" aria-label={keyboardText.mapTitle}>
                    <div className="keyboard-map-legend">
                      <b>{keyboardText.mapTitle}</b>
                      <span><i className="legend-hangul" /> {keyboardText.hangul}</span>
                      <span><i className="legend-local" /> {keyboardText.yourKey}</span>
                    </div>
                    {koreanKeyRows.map(({ row, keys }) => (
                      <div className={`keyboard-row ${row}`} key={row}>
                        {keys.map((key) => (
                          <kbd
                            className={`${fingerByCode[key.code]} ${activePracticeKey?.code === key.code ? "active" : ""}`}
                            aria-label={`${key.jamo}: ${keyboardText.press} ${keyboardLegend(keyboardLayout, key.code)}`}
                            key={key.code}
                          >
                            <span lang="ko">{key.jamo}</span>
                            <small>{keyboardLegend(keyboardLayout, key.code)}</small>
                          </kbd>
                        ))}
                      </div>
                    ))}
                    <div className="finger-guide" aria-label="Finger position color guide">
                      <span className="left-pinky"><i />L5<small>left pinky</small></span>
                      <span className="left-ring"><i />L4<small>left ring</small></span>
                      <span className="left-middle"><i />L3<small>left middle</small></span>
                      <span className="left-index"><i />L2<small>left index</small></span>
                      <span className="right-index"><i />R2<small>right index</small></span>
                      <span className="right-middle"><i />R3<small>right middle</small></span>
                      <span className="right-ring"><i />R4<small>right ring</small></span>
                      <span className="right-pinky"><i />R5<small>right pinky</small></span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="daily-meter" id="progress">
              <div className="daily-time"><b>{formatPracticeTime(elapsedSeconds)}</b><span>/10 min</span></div>
              <div className="meter-copy">
                <div><span>Today’s practice</span><b>{dailyProgress}%</b></div>
                <div className="meter-track" role="progressbar" aria-label="Today’s practice" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dailyProgress}>
                  <span style={{ width: `${dailyProgress}%` }} />
                </div>
                <small>{lessonFinished ? "Daily typing goal reached" : `${completedSentences} of ${lessonSentences.length} sentences complete`}</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="activity-section" id="games" aria-labelledby="activities-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">TODAY’S 10-MINUTE PLAN</p>
            <h2 id="activities-heading">{t.nextBeat}</h2>
          </div>
          <p>{t.nextBeatHint}</p>
        </div>

        <div className="activity-grid">
          {activities.map((activity, index) => (
            <button
              className={`activity-card ${activity.accent} ${activeActivity === activity.id ? "selected" : ""}`}
              type="button"
              key={activity.id}
              onClick={() => setActiveActivity(activity.id)}
              aria-pressed={activeActivity === activity.id}
            >
              <span className="activity-number">0{index + 1}</span>
              <span className="activity-kicker">{activity.kicker}</span>
              <strong>{activity.title}<span lang="ko">{activity.korean}</span></strong>
              <span className="activity-description">{activity.description}</span>
              <span className="activity-time">{activity.time}<b aria-hidden="true">↗</b></span>
            </button>
          ))}
        </div>

        <div className="game-demo" aria-live="polite">
          {activeActivity === "home" && (
            <div className="demo-copy">
              <p className="demo-label">FOUNDATION · LESSON 02</p>
              <h3>Build reliable finger memory.</h3>
              <p>Practice small key groups, then combine them into syllables and everyday words. The lesson adapts to the keys you miss most.</p>
              <button className="button button-primary" type="button" onClick={startTodayLesson}>Continue basic position</button>
            </div>
          )}

          {activeActivity === "tetris" && (
            <>
              <div className="tetris-board" aria-label="Word Tetris practice area">
                <span className="falling-word" lang="ko">{tetrisWords[tetrisIndex % tetrisWords.length].korean}</span>
                <span className="tetris-block block-a" /><span className="tetris-block block-b" /><span className="tetris-block block-c" />
              </div>
              <form className="demo-form" onSubmit={submitTetris}>
                <p className="demo-label">WORD TETRIS · SCORE {tetrisScore}</p>
                <h3>Type it before it lands.</h3>
                <label htmlFor="tetris-input">Korean word</label>
                <div className="inline-form">
                  <input id="tetris-input" lang="ko" value={tetrisInput} onChange={(event) => setTetrisInput(event.target.value)} autoComplete="off" />
                  <button className="button button-primary" type="submit">Drop</button>
                </div>
                <p className="form-message">{tetrisMessage}</p>
              </form>
            </>
          )}

          {activeActivity === "missing" && (
            <div className="missing-demo">
              <p className="demo-label">MISSING LETTER · WORD 3/12</p>
              <h3>Complete the word for “Hangul”.</h3>
              <div className="missing-word" lang="ko">한 <span>{missingAnswer || "?"}</span></div>
              <div className="answer-options" aria-label="Choose the missing syllable">
                {["국", "글", "강"].map((answer) => (
                  <button
                    type="button"
                    className={missingAnswer === answer ? "chosen" : ""}
                    onClick={() => {
                      setMissingAnswer(answer);
                      if (answer === "글" && returnSoundEnabled) playSuccessChime();
                    }}
                    key={answer}
                  >{answer}</button>
                ))}
              </div>
              <p className={`form-message ${missingAnswer === "글" ? "success" : ""}`}>
                {!missingAnswer ? "Choose one syllable." : missingAnswer === "글" ? "Correct — 한글!" : "Almost. Try another syllable."}
              </p>
            </div>
          )}

          {activeActivity === "crossword" && (
            <>
              <div className="crossword-grid" role="grid" aria-label="Mini Korean crossword">
                <span className="blank" /><span lang="ko">한</span><span className="blank" /><span lang="ko">말</span>
                <span lang="ko">음</span><span lang="ko">국</span><span className="blank" /><span lang="ko">씀</span>
                <span className="blank" /><input
                  lang="ko"
                  maxLength={1}
                  value={crosswordAnswer}
                  onChange={(event) => {
                    setCrosswordAnswer(event.target.value);
                    if (event.target.value === "글" && returnSoundEnabled) playSuccessChime();
                  }}
                  aria-label="Crossword answer for Korean writing system"
                /><span className="blank" /><span className="blank" />
                <span lang="ko">노</span><span lang="ko">래</span><span className="blank" /><span lang="ko">집</span>
              </div>
              <div className="demo-copy">
                <p className="demo-label">DAILY CROSSWORD · CLUE 2</p>
                <h3>Across: Korean writing system</h3>
                <p>Type one syllable to finish 한＿.</p>
                <p className={`form-message ${crosswordAnswer === "글" ? "success" : ""}`}>
                  {!crosswordAnswer ? "One square left." : crosswordAnswer === "글" ? "Solved — 한글!" : "Check the crossing sound."}
                </p>
              </div>
            </>
          )}

          {activeActivity === "travel" && (
            <div className="travel-demo">
              <div className="travel-scene">
                <div className="travel-mode-tabs" role="group" aria-label="Travel conversation mode">
                  <button
                    type="button"
                    className={travelMode === "inKorea" ? "active" : ""}
                    onClick={() => {
                      setTravelMode("inKorea");
                      setTravelIndex(0);
                      setTravelInput("");
                    }}
                  >
                    ✈ Travel in Korea
                  </button>
                  <button
                    type="button"
                    className={travelMode === "welcome" ? "active" : ""}
                    onClick={() => {
                      setTravelMode("welcome");
                      setTravelIndex(0);
                      setTravelInput("");
                    }}
                  >
                    👋 Welcome Koreans
                  </button>
                </div>
                <span className="travel-situation">{currentTravelPhrase.situation}</span>
                <blockquote lang="ko">{currentTravelPhrase.korean}</blockquote>
                <p>{currentTravelPhrase.meaning}</p>
                <div className="phrase-dots" aria-label={`Phrase ${travelIndex + 1} of ${travelPhrases[travelMode].length}`}>
                  {travelPhrases[travelMode].map((phrase, index) => (
                    <button
                      type="button"
                      className={index === travelIndex ? "active" : ""}
                      aria-label={`Open phrase ${index + 1}`}
                      onClick={() => {
                        setTravelIndex(index);
                        setTravelInput("");
                      }}
                      key={phrase.korean}
                    />
                  ))}
                </div>
              </div>
              <div className="travel-form">
                <p className="demo-label">REAL-LIFE DIALOGUE · PHRASE {travelIndex + 1}/3</p>
                <h3>Type it, then say it.</h3>
                <p>Copy the Korean phrase to build typing memory. A later speaking lesson can add native audio and pronunciation feedback.</p>
                <label htmlFor="travel-phrase-input">Korean phrase</label>
                <input
                  id="travel-phrase-input"
                  lang="ko"
                  value={travelInput}
                  onChange={(event) => setTravelInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing && travelComplete) {
                      event.preventDefault();
                      confirmAndAdvance(advanceTravelPhrase);
                    }
                  }}
                  placeholder="한국어 문장을 입력하세요"
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className={`form-message ${travelComplete ? "success" : ""}`} aria-live="polite">
                  {!travelInput ? "Type the phrase exactly as shown." : travelComplete ? "Perfect — you’re ready to use it!" : "Keep going. Check the spacing and punctuation."}
                </p>
                <button
                  className="button button-primary"
                  type="button"
                  disabled={!travelComplete}
                  onClick={() => confirmAndAdvance(advanceTravelPhrase)}
                >
                  Next phrase <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {activeActivity === "kpop" && (
            <div className="kpop-demo">
              <div className="record-disc" aria-hidden="true"><span>ㅎ</span></div>
              {currentKpopItem ? (
                <>
                  <div className="kpop-passage">
                    <p className="demo-label">PUBLISHED CONTENT · {kpopIndex + 1}/{publishedKpopItems.length}</p>
                    <h3>{currentKpopItem.title}</h3>
                    <p className="kpop-source">{currentKpopItem.sourceTitle || "Original K-POP practice"}{currentKpopItem.creator ? ` · ${currentKpopItem.creator}` : ""}</p>
                    <blockquote lang="ko">{currentKpopItem.koreanText}</blockquote>
                    {currentKpopItem.translation && <p>{currentKpopItem.translation}</p>}
                  </div>
                  <div className="kpop-live-card">
                    <label htmlFor="kpop-line-input">Type the Korean line</label>
                    <textarea
                      id="kpop-line-input"
                      lang="ko"
                      value={kpopInput}
                      onChange={(event) => setKpopInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.nativeEvent.isComposing && kpopComplete) {
                          event.preventDefault();
                          confirmAndAdvance(advanceKpopLine);
                        }
                      }}
                      spellCheck={false}
                    />
                    <p className={`form-message ${kpopComplete ? "success" : ""}`} aria-live="polite">{kpopComplete ? "Line complete — press Enter for the next track." : "Copy the spacing and punctuation exactly."}</p>
                    <button className="button button-primary" type="button" disabled={!kpopComplete} onClick={() => confirmAndAdvance(advanceKpopLine)}>Next line <span aria-hidden="true">→</span></button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="demo-label">LICENSED CONTENT · READY FOR YOUR LIBRARY</p>
                    <h3>Add the first music challenge.</h3>
                    <p>The owner can add original or licensed lyrics in the private content studio. Once published, they appear here as a complete typing challenge.</p>
                  </div>
                  <div className="unlock-meter">
                    <div><span>Content library</span><b>0 tracks</b></div>
                    <div className="meter-track" role="progressbar" aria-label="K-POP content library" aria-valuemin={0} aria-valuemax={1} aria-valuenow={0}><span style={{ width: "0%" }} /></div>
                    <small>Administrator: add content and both voice files at /admin</small>
                  </div>
                </>
              )}
            </div>
          )}

          {activeActivity === "screen" && (
            <div className="screen-demo">
              <div className="scene-frame">
                <span className="scene-genre">{currentScreenLine.genre}</span>
                <div className="scene-visual" aria-hidden="true">
                  <span className="spotlight spotlight-one" />
                  <span className="spotlight spotlight-two" />
                  <b>SCENE {String(screenIndex + 1).padStart(2, "0")}</b>
                </div>
                <blockquote lang="ko">“{currentScreenLine.korean}”</blockquote>
                <p>{currentScreenLine.translation}</p>
              </div>
              <div className="scene-form">
                <p className="demo-label">{managedScreenLines.length ? "PUBLISHED CONTENT · RIGHTS CHECKED" : "ORIGINAL PRACTICE DIALOGUE · LICENSE-SAFE PREVIEW"}</p>
                <h3>Type the scene. Feel the emotion.</h3>
                <p>{managedScreenLines.length ? "This line was published from the private content studio." : "Practice with original dialogue now. Quotes from real dramas and movies are added only after official permission."}</p>
                <label htmlFor="screen-line-input">Korean dialogue</label>
                <textarea
                  id="screen-line-input"
                  lang="ko"
                  value={screenInput}
                  onChange={(event) => setScreenInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing && screenComplete) {
                      event.preventDefault();
                      confirmAndAdvance(advanceScreenLine);
                    }
                  }}
                  placeholder="명대사를 그대로 입력하세요"
                  spellCheck={false}
                />
                <div className="scene-result" aria-live="polite">
                  <span>{screenChars.length} / {screenTargetChars.length}</span>
                  <b className={screenComplete ? "complete" : ""}>{screenComplete ? "Scene complete!" : `${screenAccuracy}% accurate`}</b>
                </div>
                <button
                  className="button button-primary"
                  type="button"
                  disabled={!screenComplete}
                  onClick={() => confirmAndAdvance(advanceScreenLine)}
                >
                  Next scene <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="learning-path" id="learn" aria-labelledby="path-heading">
        <div className="path-copy">
          <p className="section-label">A COURSE THAT GROWS WITH YOU</p>
          <h2 id="path-heading">{t.pathTitle}</h2>
          <p>{t.pathBody}</p>
          <div className="path-badges">
            <span>No Korean keyboard required</span>
            <span>Works on mobile and desktop</span>
            <span>Free core course</span>
          </div>
        </div>
        <ol className="level-track">
          {learningLevels.map((level, index) => (
            <li className={index < 4 ? "done" : index === 4 ? "current" : index >= learningLevels.length - 2 ? "reward" : ""} key={level}>
              <span>{index + 1}</span>
              <p>{level}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="free-note" aria-label="Free learning promise">
        <div>
          <p className="section-label">LEARN FIRST</p>
          <h2>Free practice, without interruptions.</h2>
        </div>
        <p>Core lessons and games stay free. If ads are introduced, they appear only between activities—not beside the typing field or during a game.</p>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">ㅎ</span><span>Hangeul Pop</span></a>
        <p>Type Korean. Play your way.</p>
        <div><a href="#learn">Curriculum</a><a href="#games">Games</a><a href="/my">My page</a><a href="/legal#privacy">Privacy</a><a href="/legal#terms">Terms</a></div>
      </footer>

      {privacyNoticeVisible && (
        <aside className="privacy-notice" aria-label="Privacy notice">
          <span aria-hidden="true">◉</span>
          <div>
            <b>Your learning, kept minimal.</b>
            <p>We store essential settings and lesson progress. No advertising or analytics cookies are active in this private preview.</p>
          </div>
          <a href="/legal#privacy">Details</a>
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem("hangeul-pop-privacy-notice", "accepted-v1");
              setPrivacyNoticeVisible(false);
            }}
          >
            Got it
          </button>
        </aside>
      )}
    </main>
  );
}
