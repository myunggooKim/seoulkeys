export type ContentDeck<T> = {
  signature: string;
  queue: T[];
  lastKey: string;
};

export function createContentDeck<T>(): ContentDeck<T> {
  return { signature: "", queue: [], lastKey: "" };
}

export function cloneContentDeck<T>(deck: ContentDeck<T>): ContentDeck<T> {
  return {
    signature: deck.signature,
    queue: [...deck.queue],
    lastKey: deck.lastKey,
  };
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

/** Draws without replacement. A source item cannot repeat until every other
 * eligible item has been offered once; blocked items are kept for a later draw
 * instead of being discarded. */
export function drawFromContentDeck<T>(
  deck: ContentDeck<T>,
  source: readonly T[],
  keyOf: (item: T) => string,
  blocked = new Set<string>(),
  random: () => number = Math.random,
): T {
  if (!source.length) throw new Error("Content deck cannot draw from an empty source.");
  const unique = [...new Map(source.map((item) => [keyOf(item), item])).values()];
  const signature = unique.map(keyOf).sort().join("\u001f");
  if (deck.signature !== signature || deck.queue.length === 0) {
    deck.signature = signature;
    deck.queue = shuffled(unique, random);
    if (deck.queue.length > 1 && keyOf(deck.queue[0]) === deck.lastKey) {
      [deck.queue[0], deck.queue[1]] = [deck.queue[1], deck.queue[0]];
    }
  }

  const availableIndex = deck.queue.findIndex((item) => !blocked.has(keyOf(item)));
  const index = availableIndex >= 0 ? availableIndex : 0;
  const [item] = deck.queue.splice(index, 1);
  deck.lastKey = keyOf(item);
  return item;
}

export function takeContentBatch<T>(
  deck: ContentDeck<T>,
  source: readonly T[],
  count: number,
  keyOf: (item: T) => string,
  random: () => number = Math.random,
): T[] {
  const result: T[] = [];
  const blocked = new Set<string>();
  const limit = Math.min(count, new Set(source.map(keyOf)).size);
  while (result.length < limit) {
    const item = drawFromContentDeck(deck, source, keyOf, blocked, random);
    result.push(item);
    blocked.add(keyOf(item));
  }
  return result;
}
