import { Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene, type WebGLRenderer } from 'three';

/** Three neutral photographic softboxes. No colored room furniture or point-hotspots. */
export function createCeramicStudioEnvironment(renderer: WebGLRenderer) {
  const studio = new Scene();
  studio.background = new Color().setRGB(.12, .12, .12);
  const geometry = new PlaneGeometry(1, 1);
  const materials: MeshBasicMaterial[] = [];
  const radians = Math.PI / 180;
  const distance = 10;
  // At elevation 44°, yaw +32°, a flat top reflects toward (-.381,.695,-.610).
  // Center each strip at elevation 51° with half-height atan(h / 2d) = 7°:
  // its lower boundary is exactly 44°, crossing the flat-top reflected ray.
  // Crown normals spanning ~6.66° sweep ~13.32° in reflection, across that
  // boundary rather than across the uniform middle of a giant white card.
  // The mirrored strip serves the -32° view; each is ~46° wide, so neither
  // fills the other one's center-ray boundary. Material roughness provides
  // most of the edge diffusion; PMREM adds only a small anti-aliasing blur.
  const strips = [32, -32].map(yaw => ({
    position: [
      -Math.sin(yaw * radians) * Math.cos(51 * radians) * distance,
      Math.sin(51 * radians) * distance,
      -Math.cos(yaw * radians) * Math.cos(51 * radians) * distance,
    ],
    size: [8.5, 2 * distance * Math.tan(7 * radians)],
    power: 4.8,
  }));
  const cards = [
    ...strips,
    // Broad, lower-power front fill shapes the body/bevel without occupying
    // the upward/backward top reflection footprint at either default view.
    { position: [0, 5, 7], size: [8, 4], power: 2.2 },
  ];
  for (const card of cards) {
    const material = new MeshBasicMaterial({ color: new Color().setRGB(card.power, card.power, card.power), side: DoubleSide, toneMapped: false });
    materials.push(material);
    const panel = new Mesh(geometry, material);
    panel.position.set(card.position[0], card.position[1], card.position[2]);
    panel.scale.set(card.size[0], card.size[1], 1); panel.lookAt(0, 0, 0); studio.add(panel);
  }
  const pmrem = new PMREMGenerator(renderer);
  const map = pmrem.fromScene(studio, .025, .1, 100, { size: 256 });
  geometry.dispose(); materials.forEach(material => material.dispose()); pmrem.dispose();
  return map;
}
