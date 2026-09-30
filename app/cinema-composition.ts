import { PerspectiveCamera, Vector3 } from "three/src/Three.Core.js";

// The camera determines width and placement, but the reading surface remains
// a level frontal rectangle: no skew, tilted letters or trapezoidal input.
export const cinemaScreen = { width: 5.6, top: 3.1, bottom: .5, z: -.35 } as const;
export const cinemaScreenCorners = [
  new Vector3(-cinemaScreen.width / 2, cinemaScreen.top, cinemaScreen.z),
  new Vector3(cinemaScreen.width / 2, cinemaScreen.top, cinemaScreen.z),
  new Vector3(-cinemaScreen.width / 2, cinemaScreen.bottom, cinemaScreen.z),
  new Vector3(cinemaScreen.width / 2, cinemaScreen.bottom, cinemaScreen.z),
];
// Whole case and space-bar edges, not just their centres. That distinction
// matters on short laptop windows, where the old fixed framing cut the bar.
export const cinemaKeyboardBounds = [-3.55, 3.55].flatMap(x =>
  [.02, 2.88].flatMap(z => [-.25, .28].map(y => new Vector3(x, y, z))),
);
const bounds = [...cinemaScreenCorners, ...cinemaKeyboardBounds];
const projected = new Vector3();

export function frameCinemaCamera(camera: PerspectiveCamera, width: number, height: number, entered: number) {
  camera.clearViewOffset();
  camera.aspect = width / height;
  camera.fov = 2 * Math.atan(Math.tan(49 * Math.PI / 360) / camera.aspect) * 180 / Math.PI;
  camera.position.set(0, 6.6 - entered, 6.6 + entered * 2.1);
  camera.lookAt(0, .3 - entered * .2, -.8 - entered * .2);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  let minY = Infinity, maxY = -Infinity, maxX = 0;
  for (const corner of bounds) {
    projected.copy(corner).project(camera);
    minY = Math.min(minY, projected.y); maxY = Math.max(maxY, projected.y);
    maxX = Math.max(maxX, Math.abs(projected.x));
  }
  const fit = Math.max(1, (maxY - minY) / 1.74, maxX / .9);
  camera.fov = 2 * Math.atan(Math.tan(camera.fov * Math.PI / 360) * fit) * 180 / Math.PI;
  // Centre the complete screen+keyboard envelope with clear top/bottom margins.
  const shift = (.02 - (minY + maxY) / (2 * fit)) / 2;
  camera.setViewOffset(width, height, 0, height * shift, width, height);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
}

export function cinemaScreenRect(camera: PerspectiveCamera, width: number, height: number) {
  const rearLeft = new Vector3(-3.425, .1, .02).project(camera);
  const rearRight = new Vector3(3.425, .1, .02).project(camera);
  const top = cinemaScreenCorners[0].clone().project(camera);
  return {
    left: (rearLeft.x + 1) * width / 2,
    top: (1 - top.y) * height / 2,
    width: (rearRight.x - rearLeft.x) * width / 2,
  };
}
