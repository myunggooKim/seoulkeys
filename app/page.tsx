"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

type KoreanKey = {
  jamo: string;
  code: string;
  row: KeyboardRow;
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

const targetSentence = "저는 음악을 좋아해요.";

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
const practiceSequence: KoreanKey[] = [
  "ㅈ", "ㅓ", "ㄴ", "ㅡ", "ㄴ",
  "ㅇ", "ㅡ", "ㅁ", "ㅇ", "ㅏ", "ㄱ", "ㅇ", "ㅡ", "ㄹ",
  "ㅈ", "ㅗ", "ㅎ", "ㅇ", "ㅏ", "ㅎ", "ㅐ", "ㅇ", "ㅛ",
].map((jamo) => keyByJamo.get(jamo)!);

const keyboardLegends: Record<KeyboardLayout, Partial<Record<string, string>>> = {
  qwerty: {},
  azerty: { KeyQ: "A", KeyW: "Z", KeyA: "Q", KeyZ: "W", KeyM: "," },
  qwertz: { KeyY: "Z", KeyZ: "Y" },
};

function keyboardLegend(layout: KeyboardLayout, code: string) {
  return keyboardLegends[layout][code] ?? code.replace("Key", "");
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

function speakKorean(text: string) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const koreanVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith("ko"));

  utterance.lang = "ko-KR";
  utterance.rate = 0.88;
  utterance.pitch = 1;
  if (koreanVoice) utterance.voice = koreanVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
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
  const [speechSupported, setSpeechSupported] = useState(true);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("qwerty");
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
  const [travelMode, setTravelMode] = useState<TravelMode>("inKorea");
  const [travelIndex, setTravelIndex] = useState(0);
  const [travelInput, setTravelInput] = useState("");

  const t = copy[locale];
  const keyboardText = keyboardHelpCopy[locale] ?? englishKeyboardCopy;
  const speechText = speechHelpCopy[locale] ?? englishSpeechCopy;
  const activePracticeKey = practiceSequence[guideStep] ?? null;
  const upcomingPracticeKeys = practiceSequence.slice(guideStep, guideStep + 7);
  const targetChars = useMemo(() => Array.from(targetSentence), []);
  const typedChars = Array.from(typed);
  const correctChars = typedChars.reduce(
    (total, character, index) => total + (character === targetChars[index] ? 1 : 0),
    0,
  );
  const accuracy = typedChars.length === 0 ? 100 : Math.round((correctChars / typedChars.length) * 100);
  const sentenceProgress = Math.min(100, Math.round((typedChars.length / targetChars.length) * 100));
  const sentenceComplete = typed === targetSentence;
  const dailyProgress = Math.min(100, 65 + Math.round(sentenceProgress * 0.15));
  const currentScreenLine = screenPracticeLines[screenIndex % screenPracticeLines.length];
  const screenComplete = screenInput.trim() === currentScreenLine.korean;
  const screenChars = Array.from(screenInput);
  const screenTargetChars = Array.from(currentScreenLine.korean);
  const screenCorrectChars = screenChars.reduce(
    (total, character, index) => total + (character === screenTargetChars[index] ? 1 : 0),
    0,
  );
  const screenAccuracy = screenChars.length === 0 ? 100 : Math.round((screenCorrectChars / screenChars.length) * 100);
  const currentTravelPhrase = travelPhrases[travelMode][travelIndex % travelPhrases[travelMode].length];
  const travelComplete = travelInput.trim() === currentTravelPhrase.korean;

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem("hangeul-pop-locale");
      const savedKeyboardLayout = window.localStorage.getItem("hangeul-pop-keyboard-layout");
      const savedAutoSpeak = window.localStorage.getItem("hangeul-pop-auto-speak");
      if (savedLocale && savedLocale in copy) {
        setLocale(savedLocale as Locale);
      } else {
        setLocale(resolveBrowserLocale(navigator.languages));
      }
      if (savedKeyboardLayout === "qwerty" || savedKeyboardLayout === "azerty" || savedKeyboardLayout === "qwertz") {
        setKeyboardLayout(savedKeyboardLayout);
      }
      if (savedAutoSpeak === "false") setAutoSpeak(false);
    } catch {
      setLocale(resolveBrowserLocale(navigator.languages));
    }
    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSpeechSupported(supported);
    if (!supported) setAutoSpeak(false);
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
    if (!autoSpeak && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [autoSpeak]);

  useEffect(() => {
    if (autoSpeak && sentenceComplete) speakKorean(targetSentence);
  }, [autoSpeak, sentenceComplete]);

  useEffect(() => {
    if (autoSpeak && travelComplete) speakKorean(currentTravelPhrase.korean);
  }, [autoSpeak, travelComplete, currentTravelPhrase.korean]);

  useEffect(() => {
    if (autoSpeak && screenComplete) speakKorean(currentScreenLine.korean);
  }, [autoSpeak, screenComplete, currentScreenLine.korean]);

  function submitTetris(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = tetrisWords[tetrisIndex % tetrisWords.length];
    if (tetrisInput.trim() === current.korean) {
      setTetrisScore((score) => score + 100);
      setTetrisIndex((index) => index + 1);
      setTetrisInput("");
      setTetrisMessage("Perfect! +100");
    } else {
      setTetrisMessage(`Try again — ${current.meaning}`);
    }
  }

  function focusHeroPractice() {
    document.getElementById("hero-typing-input")?.focus();
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
          <a href="#progress">{t.navProgress}</a>
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
            <button className="button button-primary" type="button" onClick={focusHeroPractice}>
              {t.start} <span aria-hidden="true">→</span>
            </button>
            <a className="button button-secondary" href="#games">{t.explore}</a>
          </div>
          <div className="trust-row" aria-label="Service highlights">
            <span><b>{learningLevels.length}</b> learning levels</span>
            <span><b>{Object.keys(copy).length}</b> interface languages</span>
            <span><b>0</b> sign-up steps</span>
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
              <span className="streak">4 day streak</span>
            </div>

            <div className="typing-panel">
              <div className="typing-meta">
                <span>{t.practiceHint}</span>
                <span>{typedChars.length} / {targetChars.length} letters</span>
              </div>
              <p className="target-sentence" lang="ko" aria-label={targetSentence}>
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
                onChange={(event) => {
                  setTyped(event.target.value);
                  if (!event.target.value) setGuideStep(0);
                }}
                onKeyDown={(event) => {
                  if (event.code === activePracticeKey?.code) {
                    setGuideStep((step) => Math.min(step + 1, practiceSequence.length));
                  } else if (event.code === "Backspace") {
                    setGuideStep((step) => Math.max(0, step - 1));
                  }
                }}
                placeholder="여기에 입력하세요"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="typing-feedback"
              />
              <p className={`typing-feedback ${sentenceComplete ? "complete" : ""}`} id="typing-feedback" aria-live="polite">
                {sentenceComplete ? "Great rhythm! Sentence complete." : typedChars.length ? `${accuracy}% accurate · keep going` : "Follow the highlighted key position below."}
              </p>

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
                    <b>{keyboardText.press} <kbd>{keyboardLegend(keyboardLayout, activePracticeKey.code)}</kbd></b>
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
                    <small>{keyboardLegend(keyboardLayout, key.code)}</small>
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
                        className={activePracticeKey?.code === key.code ? "active" : ""}
                        aria-label={`${key.jamo}: ${keyboardText.press} ${keyboardLegend(keyboardLayout, key.code)}`}
                        key={key.code}
                      >
                        <span lang="ko">{key.jamo}</span>
                        <small>{keyboardLegend(keyboardLayout, key.code)}</small>
                      </kbd>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="daily-meter" id="progress">
              <div className="daily-time"><b>6:30</b><span>/10 min</span></div>
              <div className="meter-copy">
                <div><span>Today’s practice</span><b>{dailyProgress}%</b></div>
                <div className="meter-track" role="progressbar" aria-label="Today’s practice" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dailyProgress}>
                  <span style={{ width: `${dailyProgress}%` }} />
                </div>
                <small>{sentenceComplete ? "Daily typing goal reached" : "2 activities in a row · 3 minutes left"}</small>
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
              <button className="button button-primary" type="button" onClick={focusHeroPractice}>Continue basic position</button>
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
                  <button type="button" className={missingAnswer === answer ? "chosen" : ""} onClick={() => setMissingAnswer(answer)} key={answer}>{answer}</button>
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
                <span className="blank" /><input lang="ko" maxLength={1} value={crosswordAnswer} onChange={(event) => setCrosswordAnswer(event.target.value)} aria-label="Crossword answer for Korean writing system" /><span className="blank" /><span className="blank" />
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
                  onClick={() => {
                    setTravelIndex((index) => (index + 1) % travelPhrases[travelMode].length);
                    setTravelInput("");
                  }}
                >
                  Next phrase <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {activeActivity === "kpop" && (
            <div className="kpop-demo">
              <div className="record-disc" aria-hidden="true"><span>ㅎ</span></div>
              <div>
                <p className="demo-label">LICENSED CONTENT · LOCKED REWARD</p>
                <h3>One level until the music starts.</h3>
                <p>Complete three long-form passages with at least 95% typing accuracy and 90% spacing accuracy. Only officially licensed lyrics are shown.</p>
              </div>
              <div className="unlock-meter">
                <div><span>Long-form typing</span><b>Level 4 / 5</b></div>
                <div className="meter-track" role="progressbar" aria-label="K-POP challenge unlock" aria-valuemin={0} aria-valuemax={5} aria-valuenow={4}><span style={{ width: "80%" }} /></div>
                <small>Next: finish 2 paragraphs above 95% accuracy</small>
              </div>
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
                <p className="demo-label">ORIGINAL PRACTICE DIALOGUE · LICENSE-SAFE PREVIEW</p>
                <h3>Type the scene. Feel the emotion.</h3>
                <p>Practice with original dialogue now. Quotes from real dramas and movies are added only after official permission.</p>
                <label htmlFor="screen-line-input">Korean dialogue</label>
                <textarea
                  id="screen-line-input"
                  lang="ko"
                  value={screenInput}
                  onChange={(event) => setScreenInput(event.target.value)}
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
                  onClick={() => {
                    setScreenIndex((index) => (index + 1) % screenPracticeLines.length);
                    setScreenInput("");
                  }}
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
        <div><a href="#learn">Curriculum</a><a href="#games">Games</a><a href="#progress">Progress</a></div>
      </footer>
    </main>
  );
}
