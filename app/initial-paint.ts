// Fonts remain loaded with display=swap. Give a warm font cache a short chance
// to settle, without making the entire prepared app wait for a slow font CDN.
export function waitForInitialFonts(fontReady: Promise<unknown>, budgetMs = 150): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, budgetMs);
    void fontReady.then(
      () => { clearTimeout(timer); resolve(); },
      () => { clearTimeout(timer); resolve(); },
    );
  });
}
