import {
  Bone, BufferGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, Skeleton, SkinnedMesh, SphereGeometry, TorusGeometry, Uint16BufferAttribute,
} from "three/src/Three.Core.js";
import type { GuideFinger } from "./HandGuide";

type FingerName = "pinky" | "ring" | "middle" | "index" | "thumb";
const skinColor = new Color("#dfb398"), activeColor = new Color("#8b5ce0");
export type ArticulatedFinger = { id: GuideFinger; joints: Bone[]; skin: MeshPhysicalMaterial; nail: MeshPhysicalMaterial; halo: Mesh; amount: number };

// Sculpted elliptical surfaces, rather than stacked cylinders or flat silhouettes.
function loft(rings: Array<[number, number, number, number]>, segments = 40) {
  const vertices: number[] = [], indices: number[] = [];
  for (const [y, width, depth, centerX] of rings) {
    for (let j = 0; j <= segments; j++) {
      const angle = j / segments * Math.PI * 2;
      vertices.push(centerX + Math.cos(angle) * width, y, Math.sin(angle) * depth);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j, b = a + segments + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeFinger(id: GuideFinger, length: number, radius: number): { root: Group; finger: ArticulatedFinger } {
  const rings: Array<[number, number, number, number]> = [];
  const rows = 56;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows, taper = 1 - t * .23;
    const tip = t > .89 ? Math.sqrt(Math.max(.001, 1 - ((t - .89) / .11) ** 2)) : 1;
    rings.push([t * length, radius * taper * tip * (1 + .045 * Math.cos(t * Math.PI * 6)), radius * .77 * taper * tip, 0]);
  }
  const geometry = loft(rings, 32);
  const skinIndices: number[] = [], skinWeights: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const second = Math.max(0, Math.min(1, (t - .30) / .25));
    const third = Math.max(0, Math.min(1, (t - .63) / .22));
    for (let j = 0; j <= 32; j++) { skinIndices.push(0, 1, 2, 0); skinWeights.push(1 - second, second * (1 - third), third, 0); }
  }
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
  const skin = new MeshPhysicalMaterial({ color: skinColor, roughness: .46, metalness: 0, clearcoat: .12, clearcoatRoughness: .65 });
  const mesh = new SkinnedMesh(geometry, skin);
  mesh.name = id;
  mesh.frustumCulled = false;
  const joints = [new Bone(), new Bone(), new Bone()];
  joints[1].position.y = length * .43;
  joints[2].position.y = length * .31;
  joints[0].add(joints[1]); joints[1].add(joints[2]); mesh.add(joints[0]);
  mesh.bind(new Skeleton(joints));
  const root = new Group(); root.add(mesh);
  const nail = new MeshPhysicalMaterial({ color: "#fff0e1", roughness: .27, clearcoat: .55, clearcoatRoughness: .25 });
  const nailMesh = new Mesh(new SphereGeometry(1, 24, 16), nail);
  nailMesh.scale.set(radius * .69, length * .10, .012);
  nailMesh.position.set(0, length * .14, radius * .55);
  joints[2].add(nailMesh);
  const halo = new Mesh(new TorusGeometry(radius * 1.34, .018, 8, 48), new MeshBasicMaterial({ color: "#a591ff", transparent: true, opacity: .94, depthWrite: false }));
  halo.position.set(0, length * .18, radius * .88); halo.visible = false; joints[2].add(halo);
  return { root, finger: { id, joints, skin, nail, halo, amount: 0 } };
}

/** Finger surfaces bend continuously over three bones; no visible segment gaps. */
export function createHandModel() {
  const group = new Group(), fingers: ArticulatedFinger[] = [];
  const palmSkin = new MeshPhysicalMaterial({ color: skinColor, roughness: .51, clearcoat: .08 });
  const cuffMaterial = new MeshPhysicalMaterial({ color: "#f0eee9", roughness: .61 });
  const palmRings: Array<[number, number, number, number]> = [];
  const profile = [
    [-1.85, .48, .16, 0], [-1.65, .49, .21, 0], [-1.36, .58, .25, -.02],
    [-1.06, .72, .28, -.02], [-.69, .84, .29, -.03], [-.27, .88, .27, -.03],
    [.08, .86, .23, -.02], [.23, .80, .17, -.02], [.31, .70, .035, -.02],
  ];
  for (let i = 0; i < profile.length - 1; i++) {
    for (let j = 0; j < 6; j++) {
      const t = j / 6, smooth = t * t * (3 - 2 * t);
      palmRings.push(profile[i].map((value, k) => value + (profile[i + 1][k] - value) * (k === 0 ? t : smooth)) as [number, number, number, number]);
    }
  }
  palmRings.push(profile[profile.length - 1] as [number, number, number, number]);
  const palmGeometry = loft(palmRings, 48);
  const cuffGeometry = loft([[-2.06, .51, .20, 0], [-2.03, .53, .22, 0], [-1.79, .53, .22, 0], [-1.76, .51, .20, 0]], 40);
  const specs: Array<[FingerName, number, number, number, number, number]> = [
    ["pinky", -.72, .08, 1.25, .15, .10], ["ring", -.29, .23, 1.63, .176, .035],
    ["middle", .15, .26, 1.83, .186, -.01], ["index", .59, .13, 1.61, .18, -.08],
    ["thumb", .77, -.82, 1.08, .205, -.70],
  ];
  for (const side of ["left", "right"] as const) {
    const hand = new Group();
    hand.position.set(side === "left" ? -1.95 : 1.95, 0, 0);
    hand.scale.x = side === "left" ? 1 : -1; hand.rotation.z = side === "left" ? -.055 : .055;
    hand.add(new Mesh(palmGeometry, palmSkin), new Mesh(cuffGeometry, cuffMaterial));
    const thenar = new Mesh(new SphereGeometry(1, 24, 16), palmSkin);
    thenar.scale.set(.37, .67, .255); thenar.rotation.z = -.28; thenar.position.set(.53, -.82, -.015); hand.add(thenar);
    for (const [name, x, y, length, radius, spread] of specs) {
      const { root, finger } = makeFinger(`${side}-${name}`, length, radius);
      root.position.set(x, y, .09); root.rotation.z = spread; hand.add(root); fingers.push(finger);
    }
    group.add(hand);
  }
  return { group, fingers };
}

export function poseHandModel(fingers: ArticulatedFinger[], active: GuideFinger | null, press: number, blend: number) {
  for (const finger of fingers) {
    const selected = finger.id === active;
    finger.amount += ((selected ? 1 : 0) - finger.amount) * blend;
    finger.skin.color.copy(skinColor).lerp(activeColor, finger.amount);
    finger.skin.emissive.setRGB(.038 * finger.amount, .012 * finger.amount, .13 * finger.amount);
    finger.nail.color.set(selected ? "#e6dcff" : "#fff0e1"); finger.halo.visible = selected;
    const bend = selected ? press : 0;
    finger.joints[0].rotation.x = -.065 - bend * .18;
    finger.joints[1].rotation.x = -.11 - bend * .35;
    finger.joints[2].rotation.x = -.08 - bend * .22;
  }
}
