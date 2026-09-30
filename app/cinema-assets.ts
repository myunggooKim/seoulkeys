type HandSide = "left" | "right";
const handData = new Map<HandSide, Promise<ArrayBuffer>>();

/** Cache only immutable bytes; each scene still gets its own skeleton/materials. */
export function loadCinemaHandData(side: HandSide): Promise<ArrayBuffer> {
  const existing = handData.get(side);
  if (existing) return existing;
  const pending = fetch(`/images/typing-theatre/${side}.glb`)
    .then(response => {
      if (!response.ok) throw new Error(`Hand asset unavailable: ${response.status}`);
      return response.arrayBuffer();
    })
    .catch(error => { handData.delete(side); throw error; });
  handData.set(side, pending);
  return pending;
}
