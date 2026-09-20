import type { Locale } from "./locale-detection";

export const proverbUiEnglish = {
  proverb: "Proverb",
  maxim: "Maxim",
  round: "ROUND",
  label: "PROVERB & MAXIM TYPING",
  heading: "Type the wisdom, remember the rhythm.",
  instructions: "Type the complete line and press Enter. Press Alt+P to hear it first.",
  inputLabel: "Korean line",
  checkSpacing: "Check the spacing and type the full line exactly.",
  success: "Excellent. Listen once, then the next line will appear.",
  complete: "Complete — press Enter.",
  exact: "Match every space and character.",
  check: "Check line",
} as const;

export type ProverbUiKey = keyof typeof proverbUiEnglish | "position" | "line";
type StoredUiKey = keyof typeof proverbUiEnglish;
type StoredUi = Record<StoredUiKey, string>;

const ko: StoredUi = {
  proverb: "속담",
  maxim: "격언",
  round: "회차",
  label: "속담·격언 쓰기",
  heading: "지혜의 문장을 타자로 익혀보세요.",
  instructions: "전체 문장을 입력하고 Enter를 누르세요. Alt+P로 먼저 들을 수 있어요.",
  inputLabel: "한국어 문장",
  checkSpacing: "띄어쓰기를 확인하고 전체 문장을 정확히 입력하세요.",
  success: "훌륭해요. 발음을 들은 뒤 다음 문장이 이어집니다.",
  complete: "완성됐어요. Enter를 누르세요.",
  exact: "띄어쓰기와 글자를 그대로 맞춰 주세요.",
  check: "문장 확인",
};

const keys = Object.keys(proverbUiEnglish) as StoredUiKey[];
const rows = `
es|Refrán|Máxima|RONDA|ESCRIBIR REFRANES Y MÁXIMAS|Escribe la sabiduría y recuerda el ritmo.|Escribe la línea completa y pulsa Enter. Pulsa Alt+P para escucharla primero.|Línea en coreano|Revisa los espacios y escribe toda la línea exactamente.|Excelente. Escucha una vez y aparecerá la siguiente línea.|Completo — pulsa Enter.|Respeta cada espacio y carácter.|Comprobar línea
pt-BR|Provérbio|Máxima|RODADA|DIGITAÇÃO DE PROVÉRBIOS E MÁXIMAS|Digite a sabedoria e lembre o ritmo.|Digite a frase completa e pressione Enter. Pressione Alt+P para ouvir primeiro.|Frase em coreano|Confira os espaços e digite a frase inteira exatamente.|Excelente. Ouça uma vez e a próxima frase aparecerá.|Completo — pressione Enter.|Repita cada espaço e caractere.|Verificar frase
ja|ことわざ|格言|ラウンド|ことわざ・格言タイピング|知恵の言葉を打ち、リズムで覚えましょう。|全文を入力して Enter を押します。先に聞くには Alt+P を押します。|韓国語の文|空白を確認し、全文を正確に入力してください。|すばらしいです。一度聞くと次の文が表示されます。|完成 — Enter を押してください。|空白と文字をすべて同じにしてください。|文を確認
zh-Hans|谚语|格言|回合|谚语与格言打字|输入智慧，记住节奏。|输入完整句子并按 Enter。按 Alt+P 可先听发音。|韩语句子|检查空格，并准确输入整句。|太棒了。听一遍后会出现下一句。|已完成——请按 Enter。|请完全匹配每个空格和字符。|检查句子
zh-Hant|諺語|格言|回合|諺語與格言打字|輸入智慧，記住節奏。|輸入完整句子並按 Enter。按 Alt+P 可先聽發音。|韓語句子|檢查空格，並準確輸入整句。|太棒了。聽一遍後會出現下一句。|已完成——請按 Enter。|請完全符合每個空格和字元。|檢查句子
fr|Proverbe|Maxime|MANCHE|SAISIE DE PROVERBES ET MAXIMES|Tapez la sagesse et retenez le rythme.|Tapez la phrase entière puis appuyez sur Entrée. Alt+P permet de l’écouter d’abord.|Phrase coréenne|Vérifiez les espaces et saisissez toute la phrase exactement.|Excellent. Écoutez une fois, puis la phrase suivante apparaîtra.|Terminé — appuyez sur Entrée.|Respectez chaque espace et caractère.|Vérifier la phrase
de|Sprichwort|Maxime|RUNDE|SPRICHWÖRTER UND MAXIMEN TIPPEN|Tippe die Weisheit und merke dir den Rhythmus.|Tippe den ganzen Satz und drücke Enter. Mit Alt+P hörst du ihn zuerst.|Koreanischer Satz|Prüfe die Abstände und tippe den ganzen Satz genau.|Ausgezeichnet. Höre einmal zu, dann erscheint der nächste Satz.|Fertig — Enter drücken.|Jedes Leerzeichen und Zeichen muss stimmen.|Satz prüfen
it|Proverbio|Massima|TURNO|SCRITTURA DI PROVERBI E MASSIME|Scrivi la saggezza e ricorda il ritmo.|Scrivi l’intera frase e premi Invio. Premi Alt+P per ascoltarla prima.|Frase coreana|Controlla gli spazi e scrivi esattamente tutta la frase.|Eccellente. Ascolta una volta, poi apparirà la frase successiva.|Completo — premi Invio.|Fai corrispondere ogni spazio e carattere.|Controlla frase
pl|Przysłowie|Maksyma|RUNDA|PISANIE PRZYSŁÓW I MAKSYM|Pisz mądre słowa i zapamiętaj rytm.|Wpisz całe zdanie i naciśnij Enter. Alt+P odtworzy je najpierw.|Zdanie koreańskie|Sprawdź odstępy i dokładnie wpisz całe zdanie.|Świetnie. Posłuchaj raz, a pojawi się następne zdanie.|Gotowe — naciśnij Enter.|Dopasuj każdą spację i znak.|Sprawdź zdanie
nl|Spreekwoord|Levensregel|RONDE|SPREEKWOORDEN EN LEVENSREGELS TYPEN|Typ de wijsheid en onthoud het ritme.|Typ de hele zin en druk op Enter. Druk op Alt+P om hem eerst te horen.|Koreaanse zin|Controleer de spaties en typ de hele zin exact.|Uitstekend. Luister één keer, daarna verschijnt de volgende zin.|Klaar — druk op Enter.|Neem elke spatie en elk teken exact over.|Zin controleren
ru|Пословица|Изречение|РАУНД|ПЕЧАТЬ ПОСЛОВИЦ И ИЗРЕЧЕНИЙ|Печатайте мудрые слова и запоминайте ритм.|Введите всю строку и нажмите Enter. Alt+P позволяет сначала её прослушать.|Корейская строка|Проверьте пробелы и точно введите всю строку.|Отлично. Прослушайте один раз, затем появится следующая строка.|Готово — нажмите Enter.|Повторите каждый пробел и знак.|Проверить строку
tr|Atasözü|Özdeyiş|TUR|ATASÖZÜ VE ÖZDEYİŞ YAZMA|Bilgeliği yaz, ritmi hatırla.|Tüm satırı yazıp Enter’a bas. Önce dinlemek için Alt+P’ye bas.|Korece satır|Boşlukları kontrol edip tüm satırı aynen yaz.|Harika. Bir kez dinle, sonra yeni satır görünecek.|Tamam — Enter’a bas.|Her boşluk ve karakteri aynı yaz.|Satırı kontrol et
ar|مثل|حكمة|الجولة|كتابة الأمثال والحِكم|اكتب الحكمة واحفظ الإيقاع.|اكتب السطر كاملاً واضغط Enter. اضغط Alt+P لسماعه أولاً.|السطر الكوري|تحقق من المسافات واكتب السطر كاملاً بدقة.|ممتاز. استمع مرة ثم سيظهر السطر التالي.|اكتمل — اضغط Enter.|طابق كل مسافة وحرف.|تحقق من السطر
fa|ضرب‌المثل|سخن حکیمانه|دور|تایپ ضرب‌المثل و سخن حکیمانه|حکمت را تایپ کنید و آهنگ را به خاطر بسپارید.|کل جمله را بنویسید و Enter بزنید. برای شنیدن نخست Alt+P را بزنید.|جملهٔ کره‌ای|فاصله‌ها را بررسی و کل جمله را دقیق وارد کنید.|عالی است. یک بار گوش دهید تا جملهٔ بعدی نمایش داده شود.|کامل شد — Enter را بزنید.|همهٔ فاصله‌ها و نویسه‌ها را دقیق وارد کنید.|بررسی جمله
ur|کہاوت|قول|مرحلہ|کہاوت اور قول کی ٹائپنگ|دانائی لکھیں اور ردھم یاد رکھیں۔|مکمل سطر لکھ کر Enter دبائیں۔ پہلے سننے کے لیے Alt+P دبائیں۔|کوریائی سطر|وقفے جانچیں اور پوری سطر بالکل درست لکھیں۔|بہت خوب۔ ایک بار سنیں، پھر اگلی سطر آئے گی۔|مکمل — Enter دبائیں۔|ہر وقفہ اور حرف یکساں لکھیں۔|سطر جانچیں
fil|Salawikain|Kawikaan|ROUND|PAG-TYPE NG SALAWIKAIN AT KAWIKAAN|I-type ang karunungan at tandaan ang ritmo.|I-type ang buong linya at pindutin ang Enter. Alt+P para pakinggan muna.|Linyang Korean|Suriin ang mga espasyo at i-type nang eksakto ang buong linya.|Mahusay. Makinig nang isang beses at lalabas ang susunod na linya.|Kumpleto — pindutin ang Enter.|Itugma ang bawat espasyo at titik.|Suriin ang linya
th|สุภาษิต|คติพจน์|รอบ|พิมพ์สุภาษิตและคติพจน์|พิมพ์ถ้อยคำแห่งปัญญาและจดจำจังหวะ|พิมพ์ทั้งประโยคแล้วกด Enter กด Alt+P เพื่อฟังก่อน|ประโยคภาษาเกาหลี|ตรวจช่องว่างและพิมพ์ทั้งประโยคให้ตรงทุกตัว|ยอดเยี่ยม ฟังหนึ่งครั้งแล้วประโยคถัดไปจะปรากฏ|ครบแล้ว — กด Enter|พิมพ์ช่องว่างและตัวอักษรให้ตรงทั้งหมด|ตรวจประโยค
id|Peribahasa|Petuah|RONDE|MENGETIK PERIBAHASA DAN PETUAH|Ketik kebijaksanaan dan ingat iramanya.|Ketik seluruh kalimat lalu tekan Enter. Tekan Alt+P untuk mendengarnya lebih dulu.|Kalimat bahasa Korea|Periksa spasi dan ketik seluruh kalimat dengan tepat.|Bagus. Dengarkan sekali, lalu kalimat berikutnya muncul.|Selesai — tekan Enter.|Samakan setiap spasi dan karakter.|Periksa kalimat
ms|Peribahasa|Kata hikmah|PUSINGAN|MENAIP PERIBAHASA DAN KATA HIKMAH|Taip kebijaksanaan dan ingat rentaknya.|Taip seluruh ayat dan tekan Enter. Tekan Alt+P untuk mendengarnya dahulu.|Ayat bahasa Korea|Semak ruang dan taip seluruh ayat dengan tepat.|Cemerlang. Dengar sekali, kemudian ayat seterusnya muncul.|Selesai — tekan Enter.|Padankan setiap ruang dan aksara.|Semak ayat
vi|Tục ngữ|Châm ngôn|VÒNG|GÕ TỤC NGỮ VÀ CHÂM NGÔN|Gõ lời khôn ngoan và ghi nhớ nhịp điệu.|Gõ toàn bộ câu rồi nhấn Enter. Nhấn Alt+P để nghe trước.|Câu tiếng Hàn|Kiểm tra khoảng cách và gõ chính xác toàn bộ câu.|Tuyệt vời. Nghe một lần rồi câu tiếp theo sẽ xuất hiện.|Hoàn thành — nhấn Enter.|Khớp mọi khoảng trắng và ký tự.|Kiểm tra câu
my|စကားပုံ|ဆိုရိုး|အလှည့်|စကားပုံနှင့် ဆိုရိုး စာရိုက်ခြင်း|ပညာစကားကို ရိုက်ပြီး စည်းချက်ကို မှတ်ပါ။|စာကြောင်းတစ်ခုလုံး ရိုက်ပြီး Enter နှိပ်ပါ။ အရင်နားထောင်ရန် Alt+P နှိပ်ပါ။|ကိုရီးယားစာကြောင်း|နေရာလွတ်များကိုစစ်ပြီး စာကြောင်းတစ်ခုလုံး အတိအကျရိုက်ပါ။|ကောင်းပါတယ်။ တစ်ကြိမ်နားထောင်ပြီး နောက်စာကြောင်း ပေါ်လာမည်။|ပြီးပါပြီ — Enter နှိပ်ပါ။|နေရာလွတ်နှင့် အက္ခရာတိုင်း တူအောင်ရိုက်ပါ။|စာကြောင်းစစ်ပါ
km|សុភាសិត|ពាក្យគតិ|ជុំ|វាយសុភាសិត និងពាក្យគតិ|វាយប្រាជ្ញា និងចងចាំចង្វាក់។|វាយប្រយោគទាំងមូល ហើយចុច Enter។ ចុច Alt+P ដើម្បីស្តាប់មុន។|ប្រយោគកូរ៉េ|ពិនិត្យចន្លោះ ហើយវាយប្រយោគទាំងមូលឱ្យត្រឹមត្រូវ។|ល្អណាស់។ ស្តាប់ម្តង រួចប្រយោគបន្ទាប់នឹងបង្ហាញ។|រួចរាល់ — ចុច Enter។|ផ្គូផ្គងគ្រប់ចន្លោះ និងតួអក្សរ។|ពិនិត្យប្រយោគ
lo|ສຸພາສິດ|ຄຳຄົມ|ຮອບ|ພິມສຸພາສິດ ແລະຄຳຄົມ|ພິມຄວາມຮູ້ ແລະຈື່ຈັງຫວະ.|ພິມປະໂຫຍກທັງໝົດແລ້ວກົດ Enter. ກົດ Alt+P ເພື່ອຟັງກ່ອນ.|ປະໂຫຍກເກົາຫຼີ|ກວດຊ່ອງຫວ່າງ ແລະພິມປະໂຫຍກໃຫ້ຖືກຕ້ອງ.|ດີຫຼາຍ. ຟັງໜຶ່ງຄັ້ງແລ້ວປະໂຫຍກຕໍ່ໄປຈະປາກົດ.|ສຳເລັດ — ກົດ Enter.|ພິມທຸກຊ່ອງແລະຕົວອັກສອນໃຫ້ກົງ.|ກວດປະໂຫຍກ
hi|कहावत|सूक्ति|चरण|कहावत और सूक्ति टाइपिंग|बुद्धिमत्ता टाइप करें और लय याद रखें।|पूरी पंक्ति टाइप करके Enter दबाएँ। पहले सुनने के लिए Alt+P दबाएँ।|कोरियाई पंक्ति|रिक्त स्थान जाँचें और पूरी पंक्ति बिल्कुल सही टाइप करें।|बहुत बढ़िया। एक बार सुनें, फिर अगली पंक्ति दिखाई देगी।|पूरा — Enter दबाएँ।|हर रिक्त स्थान और अक्षर मिलाएँ।|पंक्ति जाँचें
bn|প্রবাদ|নীতিবাক্য|পর্ব|প্রবাদ ও নীতিবাক্য টাইপিং|জ্ঞানগর্ভ বাক্য লিখুন এবং ছন্দ মনে রাখুন।|পুরো লাইন লিখে Enter চাপুন। আগে শুনতে Alt+P চাপুন।|কোরিয়ান লাইন|ফাঁক যাচাই করে পুরো লাইন ঠিকভাবে লিখুন।|চমৎকার। একবার শুনুন, তারপর পরের লাইন আসবে।|সম্পূর্ণ — Enter চাপুন।|প্রতিটি ফাঁক ও অক্ষর মিলিয়ে লিখুন।|লাইন যাচাই
ta|பழமொழி|பொன்மொழி|சுற்று|பழமொழி மற்றும் பொன்மொழி தட்டச்சு|ஞானத்தைத் தட்டச்சு செய்து ஓசையை நினைவில் கொள்ளுங்கள்.|முழு வரியையும் தட்டச்சு செய்து Enter அழுத்துங்கள். முதலில் கேட்க Alt+P அழுத்துங்கள்.|கொரிய வரி|இடைவெளிகளைச் சரிபார்த்து முழு வரியையும் சரியாகத் தட்டச்சு செய்யுங்கள்.|அருமை. ஒருமுறை கேட்ட பின் அடுத்த வரி தோன்றும்.|முடிந்தது — Enter அழுத்துங்கள்.|ஒவ்வொரு இடைவெளி மற்றும் எழுத்தையும் பொருத்துங்கள்.|வரியைச் சரிபார்
ne|उखान|सूक्ति|चरण|उखान र सूक्ति टाइपिङ|ज्ञान टाइप गर्नुहोस् र लय सम्झनुहोस्।|पूरा पङ्क्ति टाइप गरेर Enter थिच्नुहोस्। पहिले सुन्न Alt+P थिच्नुहोस्।|कोरियाली पङ्क्ति|खाली ठाउँ जाँचेर पूरा पङ्क्ति ठीकसँग टाइप गर्नुहोस्।|उत्कृष्ट। एक पटक सुनेपछि अर्को पङ्क्ति देखिन्छ।|पूरा — Enter थिच्नुहोस्।|हरेक खाली ठाउँ र अक्षर मिलाउनुहोस्।|पङ्क्ति जाँच्नुहोस्
si|ප්‍රස්තාව පිරුළ|උපදේශය|වටය|ප්‍රස්තාව පිරුළු සහ උපදේශ ටයිප් කිරීම|ප්‍රඥාව ටයිප් කර රිද්මය මතක තබාගන්න.|සම්පූර්ණ පේළිය ටයිප් කර Enter ඔබන්න. මුලින් ඇසීමට Alt+P ඔබන්න.|කොරියානු පේළිය|හිස්තැන් පරීක්ෂා කර පේළිය නිවැරදිව ටයිප් කරන්න.|විශිෂ්ටයි. වරක් අසා පසු ඊළඟ පේළිය දිස්වේ.|සම්පූර්ණයි — Enter ඔබන්න.|සෑම හිස්තැනක් සහ අකුරක්ම ගළපන්න.|පේළිය පරීක්ෂා කරන්න
kk|Мақал|Нақыл|КЕЗЕҢ|МАҚАЛ МЕН НАҚЫЛ ТЕРУ|Даналықты теріп, ырғағын есте сақта.|Толық жолды теріп, Enter бас. Алдымен тыңдау үшін Alt+P бас.|Корейше жол|Бос орындарды тексеріп, жолды дәл тер.|Тамаша. Бір рет тыңда, кейін келесі жол шығады.|Дайын — Enter бас.|Әр бос орын мен таңбаны дәл келтір.|Жолды тексеру
uz|Maqol|Hikmat|BOSQICH|MAQOL VA HIKMAT YOZISH|Donolikni yozing va ohangni eslab qoling.|Butun satrni yozib Enter bosing. Avval eshitish uchun Alt+P bosing.|Koreyscha satr|Bo‘shliqlarni tekshirib, butun satrni aniq yozing.|Ajoyib. Bir marta tinglang, keyin keyingi satr chiqadi.|Tayyor — Enter bosing.|Har bir bo‘shliq va belgini mos yozing.|Satrni tekshirish
mn|Зүйр үг|Сургаал|ҮЕ|ЗҮЙР ҮГ БА СУРГААЛ БИЧИХ|Мэргэн үгийг бичиж, хэмнэлийг сана.|Бүтэн мөрийг бичээд Enter дар. Эхлээд сонсох бол Alt+P дар.|Солонгос мөр|Зайг шалгаж, бүтэн мөрийг яг бич.|Маш сайн. Нэг удаа сонсоод дараагийн мөр гарна.|Дууслаа — Enter дар.|Зай ба тэмдэг бүрийг тааруул.|Мөр шалгах
`.trim();

const ui = {
  en: proverbUiEnglish,
  ko,
} as Record<Locale, StoredUi>;

for (const row of rows.split("\n")) {
  const [locale, ...values] = row.split("|");
  ui[locale as Locale] = Object.fromEntries(
    keys.map((key, index) => [key, values[index]]),
  ) as StoredUi;
}

export const proverbUiTranslations = ui;

const cardDescriptions = `
en|Build fluent rhythm with timeless Korean sayings and practical maxims.
ko|한국 속담과 생활 격언을 정확하게 입력하며 문장 리듬을 익혀보세요.
es|Practica un ritmo fluido con refranes coreanos y máximas prácticas.
pt-BR|Pratique um ritmo fluente com provérbios coreanos e máximas úteis.
ja|韓国のことわざと実用的な格言で、自然なタイピングのリズムを身につけましょう。
zh-Hans|通过韩国谚语和实用格言，练习流畅的打字节奏。
zh-Hant|透過韓國諺語和實用格言，練習流暢的打字節奏。
fr|Travaillez un rythme fluide avec des proverbes coréens et des maximes pratiques.
de|Übe einen flüssigen Rhythmus mit koreanischen Sprichwörtern und praktischen Maximen.
it|Allena un ritmo fluido con proverbi coreani e massime pratiche.
pl|Ćwicz płynny rytm z koreańskimi przysłowiami i praktycznymi maksymami.
nl|Oefen een vloeiend ritme met Koreaanse spreekwoorden en praktische levensregels.
ru|Тренируйте плавный ритм с корейскими пословицами и полезными изречениями.
tr|Kore atasözleri ve yararlı özdeyişlerle akıcı ritim çalış.
ar|تدرّب على إيقاع سلس مع الأمثال الكورية والحِكم العملية.
fa|با ضرب‌المثل‌های کره‌ای و سخنان کاربردی، ریتم روان را تمرین کنید.
ur|کوریائی کہاوتوں اور عملی اقوال کے ساتھ روانی کی مشق کریں۔
fil|Sanayin ang tuloy-tuloy na ritmo gamit ang mga salawikaing Korean at praktikal na kawikaan.
th|ฝึกจังหวะการพิมพ์ที่ลื่นไหลด้วยสุภาษิตเกาหลีและคติพจน์ที่ใช้ได้จริง
id|Latih irama lancar dengan peribahasa Korea dan petuah praktis.
ms|Latih rentak lancar dengan peribahasa Korea dan kata hikmah praktikal.
vi|Luyện nhịp gõ trôi chảy với tục ngữ Hàn Quốc và châm ngôn thiết thực.
my|ကိုရီးယားစကားပုံနှင့် လက်တွေ့ဆိုရိုးများဖြင့် ချောမွေ့သောစည်းချက်ကို လေ့ကျင့်ပါ။
km|ហាត់ចង្វាក់វាយរលូនជាមួយសុភាសិតកូរ៉េ និងពាក្យគតិជាក់ស្តែង។
lo|ຝຶກຈັງຫວະພິມທີ່ລື່ນໄຫຼດ້ວຍສຸພາສິດເກົາຫຼີ ແລະຄຳຄົມທີ່ໃຊ້ໄດ້.
hi|कोरियाई कहावतों और उपयोगी सूक्तियों से सहज लय का अभ्यास करें।
bn|কোরিয়ান প্রবাদ ও ব্যবহারিক নীতিবাক্যে সাবলীল ছন্দ অনুশীলন করুন।
ta|கொரிய பழமொழிகளும் பயனுள்ள பொன்மொழிகளும் கொண்டு சரளமான தட்டச்சு ஓசையைப் பயிற்சி செய்யுங்கள்.
ne|कोरियाली उखान र उपयोगी सूक्तिसँग सहज लय अभ्यास गर्नुहोस्।
si|කොරියානු ප්‍රස්තාව පිරුළු සහ ප්‍රායෝගික උපදේශ සමඟ සුමට රිද්මය පුහුණු කරන්න.
kk|Корей мақалдары мен пайдалы нақылдар арқылы еркін ырғақты жаттықтыр.
uz|Koreys maqollari va foydali hikmatlar bilan ravon ritmni mashq qiling.
mn|Солонгос зүйр үг, хэрэгтэй сургаалаар жигд хэмнэлийг дасгалжуул.
`.trim();

export const proverbCardDescriptions = Object.fromEntries(
  cardDescriptions.split("\n").map((row) => {
    const separator = row.indexOf("|");
    return [row.slice(0, separator), row.slice(separator + 1)];
  }),
) as Record<Locale, string>;
