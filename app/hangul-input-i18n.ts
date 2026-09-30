import type { Locale } from "./locale-detection";

// Small, synchronous copy for the first interaction. No translation request,
// paid AI call, or language-pack download is needed to make typing usable.
const copy: Record<Locale, readonly [string, string, string]> = {
  en: ["Type the highlighted keys. No setup needed.", "Automatic Korean input", "Use only my device’s input method"],
  ko: ["설정 없이 표시된 키를 누르세요.", "한글 자동 입력", "기기의 입력기만 사용"],
  es: ["Pulsa las teclas indicadas. No necesitas configurar nada.", "Entrada coreana automática", "Usar solo el método de entrada de mi dispositivo"],
  "pt-BR": ["Pressione as teclas indicadas. Não precisa configurar nada.", "Entrada coreana automática", "Usar apenas o método de entrada do dispositivo"],
  ja: ["表示されたキーを押してください。設定は不要です。", "韓国語の自動入力", "端末の入力方式のみを使う"],
  "zh-Hans": ["按提示的键即可，无需设置。", "自动韩文输入", "仅使用设备输入法"],
  "zh-Hant": ["按提示的鍵即可，無需設定。", "自動韓文輸入", "僅使用裝置輸入法"],
  fr: ["Appuyez sur les touches indiquées. Aucune configuration nécessaire.", "Saisie coréenne automatique", "Utiliser uniquement la méthode de saisie de mon appareil"],
  de: ["Drücke die angezeigten Tasten. Keine Einrichtung nötig.", "Automatische koreanische Eingabe", "Nur die Eingabemethode meines Geräts verwenden"],
  it: ["Premi i tasti indicati. Nessuna configurazione necessaria.", "Inserimento coreano automatico", "Usa solo il metodo di inserimento del dispositivo"],
  pl: ["Naciskaj wskazane klawisze. Konfiguracja nie jest potrzebna.", "Automatyczne wpisywanie po koreańsku", "Używaj tylko metody wprowadzania urządzenia"],
  nl: ["Druk op de aangegeven toetsen. Instellen is niet nodig.", "Automatische Koreaanse invoer", "Alleen de invoermethode van mijn apparaat gebruiken"],
  ru: ["Нажимайте указанные клавиши. Настройка не нужна.", "Автоматический ввод на корейском", "Использовать только метод ввода устройства"],
  tr: ["Gösterilen tuşlara basın. Kurulum gerekmez.", "Otomatik Korece giriş", "Yalnızca cihazımın giriş yöntemini kullan"],
  ar: ["اضغط على المفاتيح الموضحة. لا حاجة إلى إعداد.", "إدخال كوري تلقائي", "استخدام طريقة إدخال جهازي فقط"],
  fa: ["کلیدهای مشخص‌شده را بزنید. نیازی به تنظیم نیست.", "ورودی خودکار کره‌ای", "فقط از روش ورودی دستگاه من استفاده شود"],
  ur: ["دکھائی گئی کلیدیں دبائیں۔ کسی ترتیب کی ضرورت نہیں۔", "خودکار کوریائی اندراج", "صرف میرے آلے کا اندراج طریقہ استعمال کریں"],
  fil: ["Pindutin ang mga ipinakitang key. Walang kailangang i-setup.", "Awtomatikong Korean input", "Gamitin lang ang input method ng aking device"],
  th: ["กดปุ่มที่แสดงได้เลย ไม่ต้องตั้งค่า", "ป้อนภาษาเกาหลีอัตโนมัติ", "ใช้เฉพาะวิธีป้อนข้อมูลของอุปกรณ์"],
  id: ["Tekan tombol yang ditunjukkan. Tidak perlu pengaturan.", "Input Korea otomatis", "Gunakan hanya metode input perangkat saya"],
  ms: ["Tekan kekunci yang ditunjukkan. Tidak perlu tetapan.", "Input Korea automatik", "Gunakan kaedah input peranti saya sahaja"],
  vi: ["Nhấn các phím được chỉ dẫn. Không cần thiết lập.", "Nhập tiếng Hàn tự động", "Chỉ dùng phương thức nhập của thiết bị"],
  my: ["ပြထားသော ခလုတ်များကို နှိပ်ပါ။ ဆက်တင်လုပ်ရန် မလိုပါ။", "အလိုအလျောက် ကိုရီးယားစာရိုက်ခြင်း", "စက်၏ စာရိုက်စနစ်ကိုသာ သုံးမည်"],
  km: ["ចុចគ្រាប់ចុចដែលបង្ហាញ។ មិនចាំបាច់កំណត់ទេ។", "បញ្ចូលភាសាកូរ៉េដោយស្វ័យប្រវត្តិ", "ប្រើតែវិធីបញ្ចូលរបស់ឧបករណ៍ខ្ញុំ"],
  lo: ["ກົດປຸ່ມທີ່ສະແດງ. ບໍ່ຕ້ອງຕັ້ງຄ່າ.", "ປ້ອນພາສາເກົາຫຼີອັດຕະໂນມັດ", "ໃຊ້ສະເພາະວິທີປ້ອນຂໍ້ມູນຂອງອຸປະກອນ"],
  hi: ["दिखाई गई कुंजियाँ दबाएँ। सेटअप की ज़रूरत नहीं है।", "स्वचालित कोरियाई इनपुट", "केवल मेरे डिवाइस की इनपुट विधि इस्तेमाल करें"],
  bn: ["দেখানো কীগুলো চাপুন। সেটআপের প্রয়োজন নেই।", "স্বয়ংক্রিয় কোরীয় ইনপুট", "শুধু আমার ডিভাইসের ইনপুট পদ্ধতি ব্যবহার করুন"],
  ta: ["காட்டப்பட்ட விசைகளை அழுத்துங்கள். அமைப்பு தேவையில்லை.", "தானியங்கி கொரிய உள்ளீடு", "என் சாதனத்தின் உள்ளீட்டு முறையை மட்டும் பயன்படுத்தவும்"],
  ne: ["देखाइएका कुञ्जीहरू थिच्नुहोस्। सेटअप आवश्यक छैन।", "स्वचालित कोरियाली इनपुट", "मेरो उपकरणको इनपुट विधि मात्र प्रयोग गर्नुहोस्"],
  si: ["පෙන්වා ඇති යතුරු ඔබන්න. සැකසුම් අවශ්‍ය නැත.", "ස්වයංක්‍රීය කොරියානු ආදානය", "මගේ උපාංගයේ ආදාන ක්‍රමය පමණක් භාවිත කරන්න"],
  kk: ["Көрсетілген пернелерді басыңыз. Баптау қажет емес.", "Корей тілін автоматты енгізу", "Тек құрылғымның енгізу әдісін пайдалану"],
  uz: ["Ko‘rsatilgan tugmalarni bosing. Sozlash shart emas.", "Avtomatik koreyscha kiritish", "Faqat qurilmamning kiritish usulidan foydalanish"],
  mn: ["Заасан товчлууруудыг дарна уу. Тохиргоо шаардлагагүй.", "Солонгос хэлээр автоматаар оруулах", "Зөвхөн төхөөрөмжийнхөө оруулах аргыг ашиглах"],
};

export function hangulInputCopy(locale: Locale) {
  const [hint, automatic, native] = copy[locale];
  return { hint, automatic, native };
}
