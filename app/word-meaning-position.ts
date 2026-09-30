export function fitGlossPosition(x: number, y: number, width: number, height: number, viewportWidth: number, viewportHeight: number) {
  const margin = 8;
  return {
    left: Math.max(margin, Math.min(x + 14, viewportWidth - width - margin)),
    top: Math.max(margin, y + height + 18 > viewportHeight - margin ? y - height - 12 : y + 18),
  };
}
