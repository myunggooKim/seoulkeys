export type CrosswordOrbit = { angle: number; elevation: number };
export const DEFAULT_CROSSWORD_ORBIT: CrosswordOrbit = { angle: 32, elevation: 44 };
export const ORBIT_DRAG_THRESHOLD = 6;
export function clampCrosswordElevation(value: number) { return Math.max(20, Math.min(80, value)); }
/** Keep horizontal motion continuous across ±180; only the top-facing tilt is bounded. */
export function crosswordOrbitDrag(start: CrosswordOrbit, dx: number, dy: number): CrosswordOrbit {
  return { angle: start.angle - dx * .38, elevation: clampCrosswordElevation(start.elevation + dy * .28) };
}
export function isCrosswordOrbitDrag(dx: number, dy: number) { return Math.hypot(dx,dy) >= ORBIT_DRAG_THRESHOLD; }
