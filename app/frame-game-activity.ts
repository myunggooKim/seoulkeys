/** Read-only observer: accepted iframe game assets, inputs and audio stay intact. */
export function isCrosswordActivityRunning(document: Document): boolean {
  return document.querySelector('.studio-integrated')?.getAttribute('data-suspended') === 'false'
    && document.querySelector('.crossword-game-wrap') !== null
    && document.querySelector('.crossword-game-wrap.solved') === null;
}

export function observeGameFrame(frame: HTMLIFrameElement, interact: (event: Event) => void, wake: () => void) {
  let current: Document | null = null;
  let detach = () => {};
  const connect = () => {
    detach(); current = null;
    try {
      const document = frame.contentDocument;
      const window = document?.defaultView;
      if (!document || !window || document.location.origin !== frame.ownerDocument.location.origin) return;
      current = document;
      const events = ['keydown', 'input', 'compositionend', 'pointerdown'];
      // Window capture sees native IME events before an engine's document guard.
      // Passive observers cannot cancel, replace, consume or read any typed keys.
      for (const name of events) window.addEventListener(name, interact, { capture: true, passive: true });
      window.addEventListener('focus', wake); window.addEventListener('blur', wake);
      detach = () => {
        for (const name of events) window.removeEventListener(name, interact, { capture: true });
        window.removeEventListener('focus', wake); window.removeEventListener('blur', wake);
      };
    } catch { /* Navigation to a different origin must stop observation. */ }
  };
  frame.addEventListener('load', connect); connect();
  return { document: () => current, dispose: () => { detach(); current = null; frame.removeEventListener('load', connect); } };
}
