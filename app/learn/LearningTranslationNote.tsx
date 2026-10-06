import type { Locale } from "../locale-detection";
import styles from "./learn.module.css";

const notices: Record<Exclude<Locale, "en" | "ko">, string> = {
  es: "Las traducciones revisadas se muestran en el idioma elegido. Las demás explicaciones conservan el original en inglés.",
  "pt-BR": "As traduções revisadas aparecem no idioma escolhido. As demais explicações mantêm o original em inglês.",
  ja: "確認済みの訳は選択した言語で表示します。それ以外の詳しい説明は英語原文で表示します。",
  "zh-Hans": "已核对的译文使用您选择的语言，其余说明保留英文原文。",
  "zh-Hant": "已核對的譯文使用您選擇的語言，其餘說明保留英文原文。",
  fr: "Les traductions vérifiées s’affichent dans la langue choisie. Les autres explications restent dans leur version anglaise originale.",
  de: "Geprüfte Übersetzungen erscheinen in der gewählten Sprache. Andere Erklärungen bleiben im englischen Original.",
  it: "Le traduzioni verificate sono nella lingua scelta. Le altre spiegazioni mantengono l’originale inglese.",
  pl: "Sprawdzone tłumaczenia są wyświetlane w wybranym języku. Pozostałe wyjaśnienia zachowują angielski oryginał.",
  nl: "Gecontroleerde vertalingen verschijnen in de gekozen taal. Andere uitleg blijft in het Engelse origineel.",
  ru: "Проверенные переводы показаны на выбранном языке. Остальные пояснения сохранены в английском оригинале.",
  tr: "Kontrol edilmiş çeviriler seçtiğiniz dilde gösterilir. Diğer açıklamalar İngilizce özgün metin olarak kalır.",
  ar: "تظهر الترجمات التي تمت مراجعتها باللغة المختارة. وتبقى الشروحات الأخرى بالنص الإنجليزي الأصلي.",
  fa: "ترجمه‌های بررسی‌شده به زبان انتخابی نمایش داده می‌شوند. توضیحات دیگر به زبان اصلی انگلیسی باقی می‌مانند.",
  ur: "جانچ شدہ تراجم منتخب زبان میں دکھائے جاتے ہیں۔ باقی وضاحتیں اصل انگریزی متن میں رہتی ہیں۔",
  fil: "Ang mga nasuring salin ay ipinapakita sa piniling wika. Ang ibang paliwanag ay nananatili sa orihinal na Ingles.",
  th: "คำแปลที่ตรวจแล้วจะแสดงในภาษาที่เลือก ส่วนคำอธิบายอื่นจะแสดงต้นฉบับภาษาอังกฤษ",
  id: "Terjemahan yang telah diperiksa ditampilkan dalam bahasa pilihan Anda. Penjelasan lainnya tetap menggunakan teks asli bahasa Inggris.",
  ms: "Terjemahan yang telah disemak dipaparkan dalam bahasa pilihan anda. Penerangan lain mengekalkan teks asal bahasa Inggeris.",
  vi: "Bản dịch đã được kiểm tra hiển thị bằng ngôn ngữ bạn chọn. Các phần giải thích khác giữ nguyên bản tiếng Anh.",
  my: "စစ်ဆေးပြီးသော ဘာသာပြန်များကို ရွေးထားသည့်ဘာသာစကားဖြင့် ပြသထားသည်။ အခြားရှင်းလင်းချက်များကို မူရင်းအင်္ဂလိပ်စာဖြင့် ပြသထားသည်။",
  km: "ការបកប្រែដែលបានពិនិត្យបង្ហាញជាភាសាដែលអ្នកជ្រើស។ ការពន្យល់ផ្សេងទៀតរក្សាអត្ថបទដើមជាភាសាអង់គ្លេស។",
  lo: "ຄຳແປທີ່ກວດແລ້ວຈະສະແດງໃນພາສາທີ່ເລືອກ. ຄຳອະທິບາຍອື່ນໆຈະໃຊ້ຕົ້ນສະບັບພາສາອັງກິດ.",
  hi: "जाँचे गए अनुवाद चुनी हुई भाषा में दिखाए जाते हैं। बाकी विवरण मूल अंग्रेज़ी में रहते हैं।",
  bn: "যাচাই করা অনুবাদ নির্বাচিত ভাষায় দেখানো হয়। অন্য ব্যাখ্যাগুলি মূল ইংরেজিতে রাখা হয়।",
  ta: "சரிபார்த்த மொழிபெயர்ப்புகள் தேர்ந்த மொழியில் காட்டப்படும். மற்ற விளக்கங்கள் ஆங்கில மூலத்தில் இருக்கும்.",
  ne: "जाँच गरिएका अनुवाद रोजिएको भाषामा देखाइन्छन्। बाँकी व्याख्या मूल अङ्ग्रेजीमा राखिन्छन्।",
  si: "පරීක්ෂා කළ පරිවර්තන තෝරාගත් භාෂාවෙන් පෙන්වයි. අනෙකුත් පැහැදිලි කිරීම් මුල් ඉංග්‍රීසි පාඨයෙන් පෙන්වයි.",
  kk: "Тексерілген аудармалар таңдалған тілде көрсетіледі. Қалған түсіндірмелер ағылшын тіліндегі түпнұсқада сақталады.",
  uz: "Tekshirilgan tarjimalar tanlangan tilda ko‘rsatiladi. Boshqa tushuntirishlar inglizcha asl matnda qoladi.",
  mn: "Хянасан орчуулгыг сонгосон хэлээр харуулна. Бусад тайлбарыг англи эхээр нь харуулна.",
};

export default function LearningTranslationNote({ locale }: { locale: Locale }) {
  if (locale === "en" || locale === "ko") return null;
  return <p className={styles.translationNote} data-learning-translation-note="true" lang={locale}>{notices[locale]}</p>;
}
