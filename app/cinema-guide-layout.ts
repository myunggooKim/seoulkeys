export type GuideBox = { left: number; right: number; top: number; bottom: number };
export const fingerPointerColor = "#50f0dc";
export const keyLegendColor = "#fff16b";
export const pointerHalfWidth = .062;
export const pointerHeight = .235;
export const thumbPointerLiftPixels = 32;

export function boxesClear(a: GuideBox, b: GuideBox, gap = 10) {
  return a.right + gap <= b.left || a.left - gap >= b.right || a.bottom + gap <= b.top || a.top - gap >= b.bottom;
}

/** The fingertip pointer is immovable; adjust the legend, never its target. */
export function separateKeyLegend(legend: GuideBox, pointer: GuideBox, width: number, height: number, gap = 14) {
  if (boxesClear(legend, pointer, gap)) return { x: 0, y: 0 };
  const candidates = [
    { x: pointer.left - gap - legend.right, y: 0 },
    { x: pointer.right + gap - legend.left, y: 0 },
    { x: 0, y: pointer.bottom + gap - legend.top },
  ];
  const fits = candidates.filter(offset => {
    const moved = { left: legend.left + offset.x, right: legend.right + offset.x, top: legend.top + offset.y, bottom: legend.bottom + offset.y };
    return moved.left >= 8 && moved.right <= width - 8 && moved.top >= 8 && moved.bottom <= height - 8;
  });
  fits.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  return fits[0] ?? candidates[0];
}
