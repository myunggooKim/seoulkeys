import type { Locale } from "./locale-detection";
import { coreGlossary } from "./word-glossary-core";

// Ordered exactly like coreGlossary; loaded only when a word is hovered.
// No machine-translation endpoint, paid inference, or per-pointer request.
const rows: Record<Exclude<Locale, "en" | "ko">, string> = {
  es: `
hipopótamo|país|cabeza|pato|cintura|de antemano|frente|probablemente|madre|edad|pepino|alimento para aves
mar|león|tienda|golondrina|hermanas|hormiga|bebé|sonido|mujer|ballena|pierna / puente|canción
árbol|leche|zapatos de vestir|falda|uvas|avestruz|café|tren|galleta|bolsillo|chile|ola
montaña|luna|noche|pelota|puerta|ojo / nieve|cuerpo|río|habitación|camino|primavera|estrella
libro|arroz cocido / comida|ropa|sabor|luz|sopa|bosque|día|rostro|campo de cultivo|delante|letra ㅎ
urraca|conejo|papá|escribir / usar|guiso|raíz|salsa de frijoles negros|artemisa|fresa|niño pequeño|rápidamente|limpio
Corea|Seúl|viaje|amigo|música|foto|felicidad|naturaleza|biblioteca|computadora|teléfono inteligente|avión|metro|escuela|historia`,
  "pt-BR": `
hipopótamo|país|cabeça|pato|cintura|com antecedência|testa|provavelmente|mãe|idade|pepino|ração para aves
mar|leão|loja|andorinha|irmãs|formiga|bebê|som|mulher|baleia|perna / ponte|canção
árvore|leite|sapatos sociais|saia|uvas|avestruz|café|trem|biscoito|bolso|pimenta|onda
montanha|lua|noite|bola|porta|olho / neve|corpo|rio|quarto|caminho|primavera|estrela
livro|arroz cozido / refeição|roupas|sabor|luz|sopa|floresta|dia|rosto|campo de cultivo|frente|letra ㅎ
pega|coelho|papai|escrever / usar|ensopado|raiz|molho de feijão preto|artemísia|morango|criança pequena|rapidamente|limpo
Coreia|Seul|viagem|amigo|música|foto|felicidade|natureza|biblioteca|computador|smartphone|avião|metrô|escola|história`,
  fr: `
hippopotame|pays|tête|canard|taille|à l'avance|front|probablement|mère|âge|concombre|nourriture pour oiseaux
mer|lion|magasin|hirondelle|sœurs|fourmi|bébé|son|femme|baleine|jambe / pont|chanson
arbre|lait|chaussures habillées|jupe|raisins|autruche|café|train|biscuit|poche|piment|vague
montagne|lune|nuit|balle|porte|œil / neige|corps|rivière|chambre|chemin|printemps|étoile
livre|riz cuit / repas|vêtements|goût|lumière|soupe|forêt|journée|visage|champ cultivé|devant|lettre ㅎ
pie|lapin|papa|écrire / utiliser|ragoût|racine|sauce aux haricots noirs|armoise|fraise|petit enfant|rapidement|propre
Corée|Séoul|voyage|ami|musique|photo|bonheur|nature|bibliothèque|ordinateur|smartphone|avion|métro|école|histoire`,
  de: `
Nilpferd|Land|Kopf|Ente|Taille|im Voraus|Stirn|wahrscheinlich|Mutter|Alter|Gurke|Vogelfutter
Meer|Löwe|Geschäft|Schwalbe|Schwestern|Ameise|Baby|Geräusch|Frau|Wal|Bein / Brücke|Lied
Baum|Milch|Halbschuhe|Rock|Trauben|Strauß|Kaffee|Zug|Keks|Tasche|Chilischote|Welle
Berg|Mond|Nacht|Ball|Tür|Auge / Schnee|Körper|Fluss|Zimmer|Weg|Frühling|Stern
Buch|gekochter Reis / Mahlzeit|Kleidung|Geschmack|Licht|Suppe|Wald|tagsüber|Gesicht|Acker|vorne|Buchstabe ㅎ
Elster|Kaninchen|Papa|schreiben / benutzen|Eintopf|Wurzel|schwarze Bohnensauce|Beifuß|Erdbeere|kleines Kind|schnell|sauber
Korea|Seoul|Reise|Freund|Musik|Foto|Glück|Natur|Bibliothek|Computer|Smartphone|Flugzeug|U-Bahn|Schule|Geschichte`,
  it: `
ippopotamo|paese|testa|anatra|vita|in anticipo|fronte|probabilmente|madre|età|cetriolo|mangime per uccelli
mare|leone|negozio|rondine|sorelle|formica|bambino|suono|donna|balena|gamba / ponte|canzone
albero|latte|scarpe eleganti|gonna|uva|struzzo|caffè|treno|biscotto|tasca|peperoncino|onda
montagna|luna|notte|palla|porta|occhio / neve|corpo|fiume|stanza|strada|primavera|stella
libro|riso cotto / pasto|vestiti|sapore|luce|zuppa|foresta|giorno|viso|campo coltivato|davanti|lettera ㅎ
gazza|coniglio|papà|scrivere / usare|stufato|radice|salsa di fagioli neri|artemisia|fragola|bambino piccolo|velocemente|pulito
Corea|Seul|viaggio|amico|musica|foto|felicità|natura|biblioteca|computer|smartphone|aereo|metropolitana|scuola|storia`,
  pl: `
hipopotam|kraj|głowa|kaczka|talia|z wyprzedzeniem|czoło|prawdopodobnie|matka|wiek|ogórek|karma dla ptaków
morze|lew|sklep|jaskółka|siostry|mrówka|niemowlę|dźwięk|kobieta|wieloryb|noga / most|piosenka
drzewo|mleko|eleganckie buty|spódnica|winogrona|struś|kawa|pociąg|ciastko|kieszeń|papryczka chili|fala
góra|księżyc|noc|piłka|drzwi|oko / śnieg|ciało|rzeka|pokój|droga|wiosna|gwiazda
książka|gotowany ryż / posiłek|ubrania|smak|światło|zupa|las|dzień|twarz|pole uprawne|przód|litera ㅎ
sroka|królik|tata|pisać / używać|gulasz|korzeń|sos z czarnej fasoli|bylica|truskawka|małe dziecko|szybko|czysty
Korea|Seul|podróż|przyjaciel|muzyka|zdjęcie|szczęście|przyroda|biblioteka|komputer|smartfon|samolot|metro|szkoła|opowieść`,
  nl: `
nijlpaard|land|hoofd|eend|taille|van tevoren|voorhoofd|waarschijnlijk|moeder|leeftijd|komkommer|vogelvoer
zee|leeuw|winkel|zwaluw|zussen|mier|baby|geluid|vrouw|walvis|been / brug|lied
boom|melk|nette schoenen|rok|druiven|struisvogel|koffie|trein|koekje|zak|chilipeper|golf
berg|maan|nacht|bal|deur|oog / sneeuw|lichaam|rivier|kamer|weg|lente|ster
boek|gekookte rijst / maaltijd|kleren|smaak|licht|soep|bos|overdag|gezicht|akker|voorkant|letter ㅎ
ekster|konijn|papa|schrijven / gebruiken|stoofpot|wortel|zwartebonensaus|bijvoet|aardbei|klein kind|snel|schoon
Korea|Seoul|reis|vriend|muziek|foto|geluk|natuur|bibliotheek|computer|smartphone|vliegtuig|metro|school|verhaal`,
  ru: `
бегемот|страна|голова|утка|талия|заранее|лоб|вероятно|мать|возраст|огурец|корм для птиц
море|лев|магазин|ласточка|сёстры|муравей|младенец|звук|женщина|кит|нога / мост|песня
дерево|молоко|туфли|юбка|виноград|страус|кофе|поезд|печенье|карман|перец чили|волна
гора|луна|ночь|мяч|дверь|глаз / снег|тело|река|комната|дорога|весна|звезда
книга|варёный рис / еда|одежда|вкус|свет|суп|лес|дневное время|лицо|поле|перед|буква ㅎ
сорока|кролик|папа|писать / использовать|густой суп|корень|соус из чёрных бобов|полынь|клубника|малыш|быстро|чистый
Корея|Сеул|путешествие|друг|музыка|фото|счастье|природа|библиотека|компьютер|смартфон|самолёт|метро|школа|история`,
  tr: `
su aygırı|ülke|baş|ördek|bel|önceden|alın|muhtemelen|anne|yaş|salatalık|kuş yemi
deniz|aslan|dükkân|kırlangıç|kız kardeşler|karınca|bebek|ses|kadın|balina|bacak / köprü|şarkı
ağaç|süt|klasik ayakkabı|etek|üzüm|devekuşu|kahve|tren|kurabiye|cep|acı biber|dalga
dağ|ay|gece|top|kapı|göz / kar|vücut|nehir|oda|yol|ilkbahar|yıldız
kitap|pişmiş pirinç / yemek|giysi|tat|ışık|çorba|orman|gündüz|yüz|tarla|ön|ㅎ harfi
saksağan|tavşan|baba|yazmak / kullanmak|sulu yemek|kök|siyah fasulye sosu|pelin otu|çilek|küçük çocuk|hızlıca|temiz
Kore|Seul|seyahat|arkadaş|müzik|fotoğraf|mutluluk|doğa|kütüphane|bilgisayar|akıllı telefon|uçak|metro|okul|hikâye`,
  ja: `
カバ|国|頭|アヒル|腰|あらかじめ|額|たぶん|母|年齢|キュウリ|鳥の餌
海|ライオン|店|ツバメ|姉妹|アリ|赤ちゃん|音|女性|クジラ|脚／橋|歌
木|牛乳|革靴|スカート|ブドウ|ダチョウ|コーヒー|列車|クッキー|ポケット|唐辛子|波
山|月|夜|ボール|ドア|目／雪|体|川|部屋|道|春|星
本|ご飯／食事|服|味|光|スープ|森|昼|顔|畑|前|文字ㅎ
カササギ|ウサギ|お父さん|書く／使う|チゲ|根|ジャージャーソース|ヨモギ|イチゴ|小さな子|早く|きれい
韓国|ソウル|旅行|友達|音楽|写真|幸せ|自然|図書館|コンピューター|スマートフォン|飛行機|地下鉄|学校|話`,
  "zh-Hans": `
河马|国家|头|鸭子|腰|提前|额头|大概|母亲|年龄|黄瓜|鸟食
海|狮子|商店|燕子|姐妹|蚂蚁|婴儿|声音|女人|鲸鱼|腿／桥|歌曲
树|牛奶|皮鞋|裙子|葡萄|鸵鸟|咖啡|火车|饼干|口袋|辣椒|波浪
山|月亮|夜晚|球|门|眼睛／雪|身体|河|房间|道路|春天|星星
书|米饭／饭食|衣服|味道|光|汤|森林|白天|脸|田地|前面|字母ㅎ
喜鹊|兔子|爸爸|写／使用|炖汤|根|炸酱|艾草|草莓|小孩子|快地|干净
韩国|首尔|旅行|朋友|音乐|照片|幸福|自然|图书馆|电脑|智能手机|飞机|地铁|学校|故事`,
  "zh-Hant": `
河馬|國家|頭|鴨子|腰|提前|額頭|大概|母親|年齡|黃瓜|鳥食
海|獅子|商店|燕子|姐妹|螞蟻|嬰兒|聲音|女人|鯨魚|腿／橋|歌曲
樹|牛奶|皮鞋|裙子|葡萄|鴕鳥|咖啡|火車|餅乾|口袋|辣椒|波浪
山|月亮|夜晚|球|門|眼睛／雪|身體|河|房間|道路|春天|星星
書|米飯／飯食|衣服|味道|光|湯|森林|白天|臉|田地|前面|字母ㅎ
喜鵲|兔子|爸爸|寫／使用|燉湯|根|炸醬|艾草|草莓|小孩子|快地|乾淨
韓國|首爾|旅行|朋友|音樂|照片|幸福|自然|圖書館|電腦|智慧型手機|飛機|捷運|學校|故事`,
  vi: `
hà mã|đất nước|đầu|vịt|eo|trước|trán|có lẽ|mẹ|tuổi|dưa chuột|thức ăn cho chim
biển|sư tử|cửa hàng|chim én|chị em gái|kiến|em bé|âm thanh|phụ nữ|cá voi|chân / cầu|bài hát
cây|sữa|giày tây|váy|nho|đà điểu|cà phê|tàu hỏa|bánh quy|túi|ớt|sóng
núi|mặt trăng|đêm|bóng|cửa|mắt / tuyết|cơ thể|sông|phòng|đường|mùa xuân|ngôi sao
sách|cơm / bữa ăn|quần áo|vị|ánh sáng|canh|rừng|ban ngày|khuôn mặt|ruộng|phía trước|chữ ㅎ
chim ác là|thỏ|ba|viết / dùng|món hầm|rễ|sốt tương đen|ngải cứu|dâu tây|trẻ nhỏ|nhanh|sạch
Hàn Quốc|Seoul|du lịch|bạn|âm nhạc|ảnh|hạnh phúc|thiên nhiên|thư viện|máy tính|điện thoại thông minh|máy bay|tàu điện ngầm|trường học|câu chuyện`,
  id: `
kuda nil|negara|kepala|bebek|pinggang|sebelumnya|dahi|mungkin|ibu|usia|mentimun|pakan burung
laut|singa|toko|burung layang-layang|saudari|semut|bayi|suara|wanita|paus|kaki / jembatan|lagu
pohon|susu|sepatu formal|rok|anggur|burung unta|kopi|kereta api|kue kering|saku|cabai|ombak
gunung|bulan|malam|bola|pintu|mata / salju|tubuh|sungai|kamar|jalan|musim semi|bintang
buku|nasi / makanan|pakaian|rasa|cahaya|sup|hutan|siang hari|wajah|ladang|depan|huruf ㅎ
burung murai|kelinci|ayah|menulis / menggunakan|semur|akar|saus kacang hitam|artemisia|stroberi|anak kecil|cepat|bersih
Korea|Seoul|perjalanan|teman|musik|foto|kebahagiaan|alam|perpustakaan|komputer|ponsel pintar|pesawat|kereta bawah tanah|sekolah|cerita`,
  ms: `
badak air|negara|kepala|itik|pinggang|lebih awal|dahi|barangkali|ibu|umur|timun|makanan burung
laut|singa|kedai|burung layang-layang|adik-beradik perempuan|semut|bayi|bunyi|wanita|paus|kaki / jambatan|lagu
pokok|susu|kasut formal|skirt|anggur|burung unta|kopi|kereta api|biskut|poket|cili|ombak
gunung|bulan|malam|bola|pintu|mata / salji|badan|sungai|bilik|jalan|musim bunga|bintang
buku|nasi / hidangan|pakaian|rasa|cahaya|sup|hutan|siang hari|wajah|ladang|depan|huruf ㅎ
burung murai|arnab|ayah|menulis / menggunakan|stew|akar|sos kacang hitam|artemisia|strawberi|kanak-kanak kecil|cepat|bersih
Korea|Seoul|perjalanan|kawan|muzik|foto|kebahagiaan|alam|perpustakaan|komputer|telefon pintar|kapal terbang|kereta api bawah tanah|sekolah|cerita`,
  fil: `
hipopotamo|bansa|ulo|pato|baywang|nang maaga|noo|marahil|ina|edad|pipino|pagkain ng ibon
dagat|leon|tindahan|ibon na layang-layang|magkapatid na babae|langgam|sanggol|tunog|babae|balyena|binti / tulay|awit
puno|gatas|pormal na sapatos|palda|ubas|abestrus|kape|tren|biskwit|bulsa|sili|alon
bundok|buwan|gabi|bola|pinto|mata / niyebe|katawan|ilog|silid|daan|tagsibol|bituin
aklat|kanin / pagkain|damit|lasa|liwanag|sopas|gubat|araw|mukha|bukid|harap|titik ㅎ
ibong magpie|kuneho|tatay|sumulat / gumamit|nilaga|ugat|sarsa ng itim na beans|halamang artemisia|presa|maliit na bata|mabilis|malinis
Korea|Seoul|paglalakbay|kaibigan|musika|larawan|kaligayahan|kalikasan|aklatan|kompyuter|smartphone|eroplano|tren sa ilalim ng lupa|paaralan|kuwento`,
  th: `
ฮิปโปโปเตมัส|ประเทศ|ศีรษะ|เป็ด|เอว|ล่วงหน้า|หน้าผาก|น่าจะ|แม่|อายุ|แตงกวา|อาหารนก
ทะเล|สิงโต|ร้านค้า|นกนางแอ่น|พี่น้องผู้หญิง|มด|ทารก|เสียง|ผู้หญิง|วาฬ|ขา / สะพาน|เพลง
ต้นไม้|นม|รองเท้าหนัง|กระโปรง|องุ่น|นกกระจอกเทศ|กาแฟ|รถไฟ|คุกกี้|กระเป๋าเสื้อ|พริก|คลื่น
ภูเขา|ดวงจันทร์|กลางคืน|ลูกบอล|ประตู|ตา / หิมะ|ร่างกาย|แม่น้ำ|ห้อง|ทาง|ฤดูใบไม้ผลิ|ดาว
หนังสือ|ข้าวสุก / อาหาร|เสื้อผ้า|รสชาติ|แสง|ซุป|ป่า|กลางวัน|ใบหน้า|ไร่|ข้างหน้า|ตัวอักษร ㅎ
นกกางเขน|กระต่าย|พ่อ|เขียน / ใช้|สตูว์|ราก|ซอสถั่วดำ|สมุนไพรโกฐจุฬาลัมพา|สตรอว์เบอร์รี|เด็กเล็ก|อย่างรวดเร็ว|สะอาด
เกาหลี|โซล|การเดินทาง|เพื่อน|ดนตรี|รูปถ่าย|ความสุข|ธรรมชาติ|ห้องสมุด|คอมพิวเตอร์|สมาร์ตโฟน|เครื่องบิน|รถไฟใต้ดิน|โรงเรียน|เรื่องราว`,
  ar: `
فرس النهر|بلد|رأس|بطة|خصر|مسبقًا|جبهة|ربما|أم|عمر|خيار|طعام الطيور
بحر|أسد|متجر|طائر السنونو|أخوات|نملة|رضيع|صوت|امرأة|حوت|ساق / جسر|أغنية
شجرة|حليب|حذاء رسمي|تنورة|عنب|نعامة|قهوة|قطار|بسكويت|جيب|فلفل حار|موجة
جبل|قمر|ليل|كرة|باب|عين / ثلج|جسم|نهر|غرفة|طريق|ربيع|نجمة
كتاب|أرز مطبوخ / وجبة|ملابس|طعم|ضوء|حساء|غابة|نهار|وجه|حقل|أمام|حرف ㅎ
عقعق|أرنب|بابا|يكتب / يستخدم|يخنة|جذر|صلصة الفاصولياء السوداء|شيح|فراولة|طفل صغير|بسرعة|نظيف
كوريا|سول|سفر|صديق|موسيقى|صورة|سعادة|طبيعة|مكتبة|حاسوب|هاتف ذكي|طائرة|مترو|مدرسة|قصة`,
  fa: `
اسب آبی|کشور|سر|اردک|کمر|از پیش|پیشانی|احتمالاً|مادر|سن|خیار|غذای پرنده
دریا|شیر|فروشگاه|پرستو|خواهران|مورچه|نوزاد|صدا|زن|نهنگ|پا / پل|آواز
درخت|شیر|کفش رسمی|دامن|انگور|شترمرغ|قهوه|قطار|بیسکویت|جیب|فلفل تند|موج
کوه|ماه|شب|توپ|در|چشم / برف|بدن|رود|اتاق|راه|بهار|ستاره
کتاب|برنج پخته / غذا|لباس|مزه|نور|سوپ|جنگل|روز|چهره|کشتزار|جلو|حرف ㅎ
زاغی|خرگوش|بابا|نوشتن / استفاده کردن|خورش|ریشه|سس لوبیای سیاه|درمنه|توت‌فرنگی|کودک کوچک|سریع|تمیز
کره|سئول|سفر|دوست|موسیقی|عکس|خوشبختی|طبیعت|کتابخانه|رایانه|گوشی هوشمند|هواپیما|مترو|مدرسه|داستان`,
  ur: `
دریائی گھوڑا|ملک|سر|بطخ|کمر|پہلے سے|پیشانی|شاید|ماں|عمر|کھیرا|پرندوں کی خوراک
سمندر|شیر|دکان|ابابیل|بہنیں|چیونٹی|شیر خوار بچہ|آواز|عورت|وہیل|ٹانگ / پل|گانا
درخت|دودھ|رسمی جوتے|اسکرٹ|انگور|شتر مرغ|کافی|ریل گاڑی|بسکٹ|جیب|مرچ|لہر
پہاڑ|چاند|رات|گیند|دروازہ|آنکھ / برف|جسم|دریا|کمرہ|راستہ|بہار|ستارہ
کتاب|پکے چاول / کھانا|کپڑے|ذائقہ|روشنی|سوپ|جنگل|دن|چہرہ|کھیت|سامنے|حرف ㅎ
میگپائی پرندہ|خرگوش|ابو|لکھنا / استعمال کرنا|سالن|جڑ|کالی پھلیوں کی چٹنی|افسنتین|اسٹرابیری|چھوٹا بچہ|جلدی|صاف
کوریا|سیول|سفر|دوست|موسیقی|تصویر|خوشی|قدرت|کتب خانہ|کمپیوٹر|اسمارٹ فون|ہوائی جہاز|زیر زمین ریل|اسکول|کہانی`,
  hi: `
दरियाई घोड़ा|देश|सिर|बत्तख|कमर|पहले से|माथा|शायद|माँ|उम्र|खीरा|पक्षियों का चारा
समुद्र|शेर|दुकान|अबाबील|बहनें|चींटी|शिशु|आवाज़|महिला|व्हेल|पैर / पुल|गीत
पेड़|दूध|औपचारिक जूते|स्कर्ट|अंगूर|शुतुरमुर्ग|कॉफ़ी|रेलगाड़ी|कुकी|जेब|मिर्च|लहर
पहाड़|चाँद|रात|गेंद|दरवाज़ा|आँख / बर्फ़|शरीर|नदी|कमरा|रास्ता|वसंत|तारा
किताब|पका चावल / भोजन|कपड़े|स्वाद|रोशनी|सूप|जंगल|दिन का समय|चेहरा|खेत|सामने|अक्षर ㅎ
मैगपाई पक्षी|खरगोश|पापा|लिखना / उपयोग करना|स्टू|जड़|काली फलियों की चटनी|नागदौना|स्ट्रॉबेरी|छोटा बच्चा|जल्दी|साफ़
कोरिया|सोल|यात्रा|दोस्त|संगीत|फ़ोटो|ख़ुशी|प्रकृति|पुस्तकालय|कंप्यूटर|स्मार्टफ़ोन|हवाई जहाज़|मेट्रो|स्कूल|कहानी`,
  bn: `
জলহস্তী|দেশ|মাথা|হাঁস|কোমর|আগে থেকে|কপাল|সম্ভবত|মা|বয়স|শসা|পাখির খাবার
সমুদ্র|সিংহ|দোকান|আবাবিল|বোনেরা|পিঁপড়া|শিশু|শব্দ|নারী|তিমি|পা / সেতু|গান
গাছ|দুধ|আনুষ্ঠানিক জুতা|স্কার্ট|আঙুর|উটপাখি|কফি|ট্রেন|বিস্কুট|পকেট|মরিচ|ঢেউ
পাহাড়|চাঁদ|রাত|বল|দরজা|চোখ / তুষার|শরীর|নদী|ঘর|পথ|বসন্ত|তারা
বই|ভাত / খাবার|পোশাক|স্বাদ|আলো|স্যুপ|বন|দিনের বেলা|মুখ|ক্ষেত|সামনে|অক্ষর ㅎ
ম্যাগপাই পাখি|খরগোশ|বাবা|লেখা / ব্যবহার করা|স্টু|শিকড়|কালো শিমের সস|মাগওয়ার্ট|স্ট্রবেরি|ছোট শিশু|দ্রুত|পরিষ্কার
কোরিয়া|সিউল|ভ্রমণ|বন্ধু|সংগীত|ছবি|সুখ|প্রকৃতি|গ্রন্থাগার|কম্পিউটার|স্মার্টফোন|বিমান|মেট্রো|স্কুল|গল্প`,
  ta: `
நீர்யானை|நாடு|தலை|வாத்து|இடுப்பு|முன்கூட்டியே|நெற்றி|அநேகமாக|அம்மா|வயது|வெள்ளரிக்காய்|பறவைத் தீவனம்
கடல்|சிங்கம்|கடை|தகைவிலான் குருவி|சகோதரிகள்|எறும்பு|குழந்தை|ஒலி|பெண்|திமிங்கிலம்|கால் / பாலம்|பாடல்
மரம்|பால்|முறையான காலணிகள்|பாவாடை|திராட்சை|நெருப்புக்கோழி|காபி|ரயில்|பிஸ்கட்|பாக்கெட்|மிளகாய்|அலை
மலை|நிலவு|இரவு|பந்து|கதவு|கண் / பனி|உடல்|ஆறு|அறை|பாதை|வசந்தம்|நட்சத்திரம்
புத்தகம்|சாதம் / உணவு|ஆடைகள்|சுவை|ஒளி|சூப்|காடு|பகல்|முகம்|வயல்|முன்புறம்|எழுத்து ㅎ
மேக்பை பறவை|முயல்|அப்பா|எழுதுதல் / பயன்படுத்துதல்|குழம்பு|வேர்|கருப்பு பீன் சாஸ்|மக்வார்ட் மூலிகை|ஸ்ட்ராபெர்ரி|சிறு குழந்தை|விரைவாக|சுத்தமான
கொரியா|சியோல்|பயணம்|நண்பர்|இசை|புகைப்படம்|மகிழ்ச்சி|இயற்கை|நூலகம்|கணினி|திறன்பேசி|விமானம்|மெட்ரோ|பள்ளி|கதை`,
  ne: `
जलघोडा|देश|टाउको|हाँस|कम्मर|पहिल्यै|निधार|सायद|आमा|उमेर|काँक्रो|चराको आहार
समुद्र|सिंह|पसल|गौँथली|दिदीबहिनी|कमिला|शिशु|आवाज|महिला|ह्वेल|खुट्टा / पुल|गीत
रूख|दूध|औपचारिक जुत्ता|स्कर्ट|अङ्गुर|अस्ट्रिच|कफी|रेल|बिस्कुट|खल्ती|खुर्सानी|छाल
पहाड|चन्द्रमा|रात|बल|ढोका|आँखा / हिउँ|शरीर|नदी|कोठा|बाटो|वसन्त|तारा
किताब|भात / भोजन|लुगा|स्वाद|प्रकाश|सुप|जङ्गल|दिनको समय|अनुहार|खेत|अगाडि|अक्षर ㅎ
म्यागपाई चरा|खरायो|बुबा|लेख्नु / प्रयोग गर्नु|झोलिलो परिकार|जरा|कालो सिमीको सस|तीतेपाती|स्ट्रबेरी|सानो बच्चा|छिटो|सफा
कोरिया|सोल|यात्रा|साथी|सङ्गीत|फोटो|खुसी|प्रकृति|पुस्तकालय|कम्प्युटर|स्मार्टफोन|हवाईजहाज|मेट्रो|विद्यालय|कथा`,
  si: `
හිපපොටේමස්|රට|හිස|තාරාවා|ඉණ|කල්තියා|නළල|බොහෝවිට|අම්මා|වයස|පිපිඤ්ඤා|කුරුලු ආහාර
මුහුද|සිංහයා|කඩය|වැහිලිහිණියා|සහෝදරියන්|කූඹියා|ළදරුවා|ශබ්දය|කාන්තාව|තල්මසා|පාදය / පාලම|ගීතය
ගස|කිරි|විධිමත් සපත්තු|සාය|මිදි|පැස්බරා|කෝපි|දුම්රිය|බිස්කට්|සාක්කුව|මිරිස්|රළ
කන්ද|සඳ|රාත්‍රිය|බෝලය|දොර|ඇස / හිම|ශරීරය|ගඟ|කාමරය|මාර්ගය|වසන්තය|තරුව
පොත|බත් / ආහාර වේල|ඇඳුම්|රසය|ආලෝකය|සුප්|වනාන්තරය|දිවා කාලය|මුහුණ|වගා බිම|ඉදිරිපස|ㅎ අකුර
මැග්පයි කුරුල්ලා|හාවා|තාත්තා|ලියන්න / භාවිත කරන්න|ස්ටූ|මුල|කළු බෝංචි සෝස්|මග්වෝර්ට් පැළෑටිය|ස්ට්‍රෝබෙරි|කුඩා දරුවා|ඉක්මනින්|පිරිසිදු
කොරියාව|සෝල්|සංචාරය|මිතුරා|සංගීතය|ඡායාරූපය|සතුට|ස්වභාවධර්මය|පුස්තකාලය|පරිගණකය|ස්මාර්ට් දුරකථනය|ගුවන් යානය|උමං දුම්රිය|පාසල|කතාව`,
  kk: `
бегемот|ел|бас|үйрек|бел|алдын ала|маңдай|бәлкім|ана|жас|қияр|құс жемі
теңіз|арыстан|дүкен|қарлығаш|әпке-сіңлілер|құмырсқа|нәресте|дыбыс|әйел|кит|аяқ / көпір|ән
ағаш|сүт|сәнді аяқкиім|белдемше|жүзім|түйеқұс|кофе|пойыз|печенье|қалта|ащы бұрыш|толқын
тау|ай|түн|доп|есік|көз / қар|дене|өзен|бөлме|жол|көктем|жұлдыз
кітап|піскен күріш / ас|киім|дәм|жарық|сорпа|орман|күндіз|бет|егістік|алды|ㅎ әрпі
сауысқан|қоян|әке|жазу / пайдалану|бұқтырылған тағам|тамыр|қара бұршақ тұздығы|жусан|құлпынай|кішкентай бала|тез|таза
Корея|Сеул|саяхат|дос|музыка|фото|бақыт|табиғат|кітапхана|компьютер|смартфон|ұшақ|метро|мектеп|әңгіме`,
  uz: `
begemot|mamlakat|bosh|o‘rdak|bel|oldindan|peshona|ehtimol|ona|yosh|bodring|qush yemi
dengiz|sher|do‘kon|qaldirg‘och|opa-singillar|chumoli|chaqaloq|tovush|ayol|kit|oyoq / ko‘prik|qo‘shiq
daraxt|sut|rasmiy poyabzal|yubka|uzum|tuyaqush|qahva|poyezd|pechenye|cho‘ntak|achchiq qalampir|to‘lqin
tog‘|oy|tun|to‘p|eshik|ko‘z / qor|tana|daryo|xona|yo‘l|bahor|yulduz
kitob|pishgan guruch / ovqat|kiyim|ta’m|yorug‘lik|sho‘rva|o‘rmon|kunduz|yuz|dala|old|ㅎ harfi
hakka|quyon|dada|yozish / ishlatish|dimlama|ildiz|qora loviya sousi|shuvoq|qulupnay|kichik bola|tez|toza
Koreya|Seul|sayohat|do‘st|musiqa|surat|baxt|tabiat|kutubxona|kompyuter|smartfon|samolyot|metro|maktab|hikoya`,
  mn: `
усны үхэр|улс|толгой|нугас|бэлхүүс|урьдчилан|дух|магадгүй|ээж|нас|өргөст хэмх|шувууны тэжээл
далай|арслан|дэлгүүр|хараацай|эгч дүүс|шоргоолж|нялх хүүхэд|дуу чимээ|эмэгтэй|халим|хөл / гүүр|дуу
мод|сүү|албаны гутал|банзал|усан үзэм|тэмээн хяруул|кофе|галт тэрэг|жигнэмэг|халаас|чинжүү|давалгаа
уул|сар|шөнө|бөмбөг|хаалга|нүд / цас|бие|гол|өрөө|зам|хавар|од
ном|болгосон будаа / хоол|хувцас|амт|гэрэл|шөл|ой|өдөр|нүүр|тариалангийн талбай|урд|ㅎ үсэг
шаазгай|туулай|аав|бичих / хэрэглэх|өтгөн шөл|үндэс|хар буурцгийн сүмс|шарилж|гүзээлзгэнэ|бага хүүхэд|хурдан|цэвэр
Солонгос|Сөүл|аялал|найз|хөгжим|зураг|аз жаргал|байгаль|номын сан|компьютер|ухаалаг утас|нисэх онгоц|метро|сургууль|түүх`,
  my: `
ရေမြင်း|နိုင်ငံ|ဦးခေါင်း|ဘဲ|ခါး|ကြိုတင်၍|နဖူး|ဖြစ်ကောင်းဖြစ်နိုင်သည်|အမေ|အသက်|သခွားသီး|ငှက်စာ
ပင်လယ်|ခြင်္သေ့|ဆိုင်|ပျံလွှားငှက်|ညီအစ်မများ|ပုရွက်ဆိတ်|ကလေးငယ်|အသံ|အမျိုးသမီး|ဝေလငါး|ခြေထောက် / တံတား|သီချင်း
သစ်ပင်|နွားနို့|အခမ်းအနားစီးဖိနပ်|စကတ်|စပျစ်သီး|ငှက်ကုလားအုတ်|ကော်ဖီ|ရထား|ကွတ်ကီး|အိတ်ကပ်|ငရုတ်သီး|လှိုင်း
တောင်|လ|ည|ဘောလုံး|တံခါး|မျက်စိ / နှင်း|ခန္ဓာကိုယ်|မြစ်|အခန်း|လမ်း|နွေဦး|ကြယ်
စာအုပ်|ထမင်း / အစားအစာ|အဝတ်အစား|အရသာ|အလင်း|ဟင်းချို|သစ်တော|နေ့အချိန်|မျက်နှာ|လယ်ကွင်း|ရှေ့|အက္ခရာ ㅎ
မက်ပိုင်ငှက်|ယုန်|အဖေ|ရေးသားသည် / အသုံးပြုသည်|ဟင်းပေါင်း|အမြစ်|ပဲနက်ဆော့စ်|အာတီမီစီယာဆေးပင်|စတော်ဘယ်ရီ|ကလေးလေး|မြန်မြန်|သန့်ရှင်းသော
ကိုရီးယား|ဆိုးလ်|ခရီးသွားခြင်း|သူငယ်ချင်း|ဂီတ|ဓာတ်ပုံ|ပျော်ရွှင်မှု|သဘာဝ|စာကြည့်တိုက်|ကွန်ပျူတာ|စမတ်ဖုန်း|လေယာဉ်|မြေအောက်ရထား|ကျောင်း|ပုံပြင်`,
  km: `
ហ៊ីប៉ូប៉ូតាម|ប្រទេស|ក្បាល|ទា|ចង្កេះ|ជាមុន|ថ្ងាស|ប្រហែលជា|ម្តាយ|អាយុ|ត្រសក់|ចំណីបក្សី
សមុទ្រ|តោ|ហាង|សត្វត្រចៀកកាំ|បងប្អូនស្រី|ស្រមោច|ទារក|សំឡេង|ស្ត្រី|ត្រីបាឡែន|ជើង / ស្ពាន|បទចម្រៀង
ដើមឈើ|ទឹកដោះគោ|ស្បែកជើងផ្លូវការ|សំពត់|ទំពាំងបាយជូរ|សត្វអូទ្រីស|កាហ្វេ|រថភ្លើង|នំខូគី|ហោប៉ៅ|ម្ទេស|រលក
ភ្នំ|ព្រះច័ន្ទ|យប់|បាល់|ទ្វារ|ភ្នែក / ព្រិល|រាងកាយ|ទន្លេ|បន្ទប់|ផ្លូវ|រដូវផ្ការីក|ផ្កាយ
សៀវភៅ|បាយ / អាហារ|សម្លៀកបំពាក់|រសជាតិ|ពន្លឺ|ស៊ុប|ព្រៃ|ពេលថ្ងៃ|មុខ|ចម្ការ|ខាងមុខ|អក្សរ ㅎ
សត្វម៉េកផាយ|ទន្សាយ|ប៉ា|សរសេរ / ប្រើ|សម្លចំហុយ|ឫស|ទឹកជ្រលក់សណ្តែកខ្មៅ|រុក្ខជាតិអាតេមីស្យា|ស្ត្របឺរី|កូនក្មេងតូច|លឿន|ស្អាត
កូរ៉េ|សេអ៊ូល|ការធ្វើដំណើរ|មិត្តភក្តិ|តន្ត្រី|រូបថត|សុភមង្គល|ធម្មជាតិ|បណ្ណាល័យ|កុំព្យូទ័រ|ទូរស័ព្ទឆ្លាតវៃ|យន្តហោះ|រថភ្លើងក្រោមដី|សាលារៀន|រឿង`,
  lo: `
ຮິບໂປ|ປະເທດ|ຫົວ|ເປັດ|ແອວ|ລ່ວງໜ້າ|ໜ້າຜາກ|ອາດຈະ|ແມ່|ອາຍຸ|ໝາກແຕງ|ອາຫານນົກ
ທະເລ|ສິງໂຕ|ຮ້ານ|ນົກນາງແອ່ນ|ເອື້ອຍນ້ອງ|ມົດ|ເດັກອ່ອນ|ສຽງ|ຜູ້ຍິງ|ປາວານ|ຂາ / ຂົວ|ເພງ
ຕົ້ນໄມ້|ນົມ|ເກີບທາງການ|ກະໂປງ|ໝາກອະງຸ່ນ|ນົກກະຈອກເທດ|ກາເຟ|ລົດໄຟ|ຄຸກກີ|ກະເປົາເສື້ອ|ໝາກເຜັດ|ຄື້ນ
ພູ|ດວງຈັນ|ກາງຄືນ|ບານ|ປະຕູ|ຕາ / ຫິມະ|ຮ່າງກາຍ|ແມ່ນ້ຳ|ຫ້ອງ|ທາງ|ລະດູໃບໄມ້ປົ່ງ|ດາວ
ປຶ້ມ|ເຂົ້າສຸກ / ອາຫານ|ເສື້ອຜ້າ|ລົດຊາດ|ແສງ|ແກງ|ປ່າ|ກາງເວັນ|ໃບໜ້າ|ໄຮ່|ຂ້າງໜ້າ|ຕົວອັກສອນ ㅎ
ນົກແມັກພາຍ|ກະຕ່າຍ|ພໍ່|ຂຽນ / ໃຊ້|ອາຫານຕຸ໋ນ|ຮາກ|ຊອດຖົ່ວດຳ|ຕົ້ນອາເຕມີເຊຍ|ສະຕໍເບີຣີ|ເດັກນ້ອຍ|ຢ່າງໄວ|ສະອາດ
ເກົາຫຼີ|ໂຊລ|ການເດີນທາງ|ໝູ່|ດົນຕີ|ຮູບຖ່າຍ|ຄວາມສຸກ|ທຳມະຊາດ|ຫ້ອງສະໝຸດ|ຄອມພິວເຕີ|ໂທລະສັບສະມາດ|ເຮືອບິນ|ລົດໄຟໃຕ້ດິນ|ໂຮງຮຽນ|ເລື່ອງ`,
};

export const coreGlossaryTranslations = Object.fromEntries(
  Object.entries(rows).map(([locale, row]) => [locale, row.trim().split(/[|\n]/).map((word) => word.trim())]),
) as Record<Exclude<Locale, "en" | "ko">, string[]>;

const coreIndices = new Map(coreGlossary.map((entry, index) => [entry.word, index]));
export function translatedCoreMeaning(word: string, locale: Locale): string | undefined {
  const index = coreIndices.get(word);
  if (index === undefined || locale === "en" || locale === "ko") return undefined;
  return coreGlossaryTranslations[locale]?.[index];
}
