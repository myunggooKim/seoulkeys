import { OrthographicCamera, PerspectiveCamera, Vector3 } from "three";

export type CrosswordOccupiedBounds = { columns: number; rows: number; centerCol: number; centerRow: number };
export const CROSSWORD_FACE_Y = .375;
/** Logical indices remain unchanged; only the presentation is centered on occupied cells. */
export function crosswordOccupiedBounds(cells: readonly { row: number; col: number }[], size: number): CrosswordOccupiedBounds {
  if (!cells.length) return { columns: size, rows: size, centerCol: (size - 1) / 2, centerRow: (size - 1) / 2 };
  const columns = cells.map(cell => cell.col), rows = cells.map(cell => cell.row);
  const minCol = Math.min(...columns), maxCol = Math.max(...columns), minRow = Math.min(...rows), maxRow = Math.max(...rows);
  return { columns: maxCol - minCol + 1, rows: maxRow - minRow + 1, centerCol: (minCol + maxCol) / 2, centerRow: (minRow + maxRow) / 2 };
}

export function frameCrosswordCamera(camera: OrthographicCamera | PerspectiveCamera, size: number, width: number, height: number, yaw: number, bounds?: CrosswordOccupiedBounds, elevationDegrees = 44) {
  const angle = yaw * Math.PI / 180, elevation = Math.max(20,Math.min(80,elevationDegrees)) * Math.PI / 180;
  const columns = bounds?.columns ?? size, rows = bounds?.rows ?? size;
  const distance = Math.max(columns, rows) * 2.5;
  const target = new Vector3(0, .12, 0);
  camera.position.set(Math.sin(angle) * Math.cos(elevation) * distance, Math.sin(elevation) * distance + target.y, Math.cos(angle) * Math.cos(elevation) * distance);
  camera.near = .1; camera.far = Math.max(100, distance * 4);
  camera.lookAt(target); camera.updateMatrixWorld();
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  // Fit actual rectangular platform, thickness, and maximum finite celebratory lift.
  const points: Vector3[] = [];
  for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [-.40, .65]) {
    points.push(new Vector3(x * (columns + 1.0) / 2, y, z * (rows + 1.0) / 2));
  }
  if (camera instanceof PerspectiveCamera) {
    camera.aspect = aspect; camera.fov = 46; camera.updateProjectionMatrix();
    for (let pass = 0; pass < 4; pass++) {
      const edge = Math.max(...points.flatMap(p => { const v = p.clone().project(camera); return [Math.abs(v.x), Math.abs(v.y)]; }));
      if (edge <= .91) break;
      camera.position.sub(target).multiplyScalar(edge / .91).add(target); camera.lookAt(target); camera.updateMatrixWorld();
    }
    return;
  }
  const cameraPoints = points.map(p => p.applyMatrix4(camera.matrixWorldInverse));
  const halfWidth = Math.max(...cameraPoints.map(p => Math.abs(p.x))) / .93;
  const halfHeight = Math.max(...cameraPoints.map(p => Math.abs(p.y))) / .93;
  const span = Math.max(halfHeight, halfWidth / aspect);
  camera.left = -span * aspect; camera.right = span * aspect;
  camera.top = span; camera.bottom = -span;
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
}

const projected = new Vector3();
const corners = [[-.47, -.47], [.47, -.47], [.47, .47], [-.47, .47]];

/** Beauty text and DOM input share the actual elevated face plane. */
export function crosswordTileBounds(camera: OrthographicCamera | PerspectiveCamera, x: number, y: number, z: number, width: number, height: number) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  const polygon: { x: number; y: number }[] = [];
  for (const [dx, dz] of corners) {
    projected.set(x + dx, y + CROSSWORD_FACE_Y, z + dz).project(camera);
    const px = (projected.x + 1) * width / 2, py = (1 - projected.y) * height / 2;
    polygon.push({ x: px, y: py });
    left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
  }
  return { left, right, top, bottom, width: right - left, height: bottom - top, polygon };
}
