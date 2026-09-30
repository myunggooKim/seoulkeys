import type { Locale } from "./locale-detection";

// Small, synchronous labels: choosing a view never waits for a translation API.
const labels: Record<Locale, readonly [string, string, string, string]> = {
  ko: ["연습 화면", "기본", "극장", "다시 입력"],
  en: ["Practice view", "Basic", "Theatre", "Clear input"],
  es: ["Vista", "Básica", "Teatro", "Borrar entrada"],
  "pt-BR": ["Visualização", "Básica", "Teatro", "Limpar entrada"],
  ja: ["練習画面", "基本", "シアター", "入力を消す"],
  "zh-Hans": ["练习画面", "基础", "剧场", "清空输入"],
  "zh-Hant": ["練習畫面", "基本", "劇場", "清空輸入"],
  fr: ["Affichage", "Classique", "Théâtre", "Effacer la saisie"],
  de: ["Ansicht", "Standard", "Theater", "Eingabe löschen"],
  it: ["Vista", "Base", "Teatro", "Cancella testo"],
  pl: ["Widok", "Podstawowy", "Teatr", "Wyczyść wpis"],
  nl: ["Weergave", "Basis", "Theater", "Invoer wissen"],
  ru: ["Вид", "Обычный", "Театр", "Очистить ввод"],
  tr: ["Görünüm", "Temel", "Tiyatro", "Girişi temizle"],
  ar: ["عرض التدريب", "أساسي", "مسرح", "مسح الإدخال"],
  fa: ["نمای تمرین", "ساده", "تئاتر", "پاک کردن ورودی"],
  ur: ["مشق کا منظر", "بنیادی", "تھیٹر", "اندراج صاف کریں"],
  fil: ["View", "Karaniwan", "Teatro", "Burahin ang input"],
  th: ["มุมมอง", "พื้นฐาน", "โรงละคร", "ล้างข้อความ"],
  id: ["Tampilan", "Dasar", "Teater", "Hapus input"],
  ms: ["Paparan", "Asas", "Teater", "Padam input"],
  vi: ["Giao diện", "Cơ bản", "Rạp hát", "Xóa nội dung"],
  my: ["မြင်ကွင်း", "အခြေခံ", "ပြဇာတ်ရုံ", "စာသားရှင်းရန်"],
  km: ["ទិដ្ឋភាព", "មូលដ្ឋាន", "រោងល្ខោន", "សម្អាតអត្ថបទ"],
  lo: ["ມຸມມອງ", "ພື້ນຖານ", "ໂຮງລະຄອນ", "ລຶບຂໍ້ຄວາມ"],
  hi: ["अभ्यास दृश्य", "सामान्य", "थिएटर", "इनपुट मिटाएँ"],
  bn: ["অনুশীলন দৃশ্য", "সাধারণ", "থিয়েটার", "লেখা মুছুন"],
  ta: ["பயிற்சிக் காட்சி", "அடிப்படை", "திரையரங்கு", "உள்ளீட்டை அழி"],
  ne: ["अभ्यास दृश्य", "सामान्य", "थिएटर", "इनपुट मेटाउनुहोस्"],
  si: ["පුහුණු දසුන", "මූලික", "රඟහල", "ඇතුළත් කිරීම මකන්න"],
  kk: ["Жаттығу көрінісі", "Негізгі", "Театр", "Енгізуді тазалау"],
  uz: ["Mashq ko‘rinishi", "Oddiy", "Teatr", "Kiritishni tozalash"],
  mn: ["Дасгалын харагдац", "Энгийн", "Театр", "Оруулгыг арилгах"],
};

export function typingViewCopy(locale: Locale) {
  const [view, basic, theatre, clear] = labels[locale];
  return { view, basic, theatre, clear };
}
