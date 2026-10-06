/** Persistent solved jade is independent of the transient selected-word state. */
export function crosswordCeramicPalette(solved: boolean) {
  return solved ? {face:'#54cbb0',sheen:'#a8f5d8'} : {face:'#ffffff',sheen:'#ffffff'};
}
