/** Keep earned jade while the current clue has a distinct blue ceramic glaze. */
export function crosswordCeramicPalette(solved: boolean, active = false, focused = false) {
  if (solved) return {face:'#54cbb0',sheen:'#a8f5d8'};
  if (active) return focused
    ? {face:'#3188da',sheen:'#a8d6ff'}
    : {face:'#60a8ed',sheen:'#bddfff'};
  return {face:'#ffffff',sheen:'#ffffff'};
}
