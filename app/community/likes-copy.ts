import type {Locale} from '../locale-detection';

// Human-written button labels. Rendering likes never generates an AI translation.
const labels: Record<Locale, readonly [string, string]> = {
  en: ['Like', 'Unlike'], ko: ['좋아요', '좋아요 취소'], es: ['Me gusta', 'Quitar Me gusta'],
  'pt-BR': ['Curtir', 'Descurtir'], ja: ['いいね', 'いいねを取り消す'],
  'zh-Hans': ['点赞', '取消点赞'], 'zh-Hant': ['讚', '收回讚'],
  fr: ['J’aime', 'Retirer le J’aime'], de: ['Gefällt mir', 'Gefällt mir zurücknehmen'],
  it: ['Mi piace', 'Non mi piace più'], pl: ['Lubię to', 'Nie lubię już'],
  nl: ['Vind ik leuk', 'Vind ik niet meer leuk'], ru: ['Нравится', 'Убрать отметку'],
  tr: ['Beğen', 'Beğeniyi kaldır'], ar: ['إعجاب', 'إلغاء الإعجاب'],
  fa: ['پسندیدن', 'لغو پسندیدن'], ur: ['پسند کریں', 'پسند واپس لیں'],
  fil: ['Gusto', 'Alisin ang gusto'], th: ['ถูกใจ', 'เลิกถูกใจ'],
  id: ['Suka', 'Batal suka'], ms: ['Suka', 'Batal suka'], vi: ['Thích', 'Bỏ thích'],
  my: ['နှစ်သက်သည်', 'နှစ်သက်မှုကို ပယ်ဖျက်ပါ'], km: ['ចូលចិត្ត', 'ឈប់ចូលចិត្ត'],
  lo: ['ມັກ', 'ຍົກເລີກການມັກ'], hi: ['पसंद करें', 'पसंद हटाएँ'],
  bn: ['পছন্দ', 'পছন্দ সরান'], ta: ['விருப்பம்', 'விருப்பத்தை நீக்கு'],
  ne: ['मन पर्‍यो', 'मन परेको हटाउनुहोस्'], si: ['කැමතියි', 'කැමැත්ත ඉවත් කරන්න'],
  kk: ['Ұнату', 'Ұнатуды алып тастау'], uz: ['Yoqdi', 'Yoqtirishni bekor qilish'],
  mn: ['Таалагдлаа', 'Таалагдсаныг цуцлах'],
};

export function likesCopy(locale: Locale) {
  const [like, unlike] = labels[locale];
  return {like, unlike};
}
