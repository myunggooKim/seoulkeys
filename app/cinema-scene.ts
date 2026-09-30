import {
  ACESFilmicToneMapping, AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  ConeGeometry, CylinderGeometry, ExtrudeGeometry, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  Line, LineBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Shape, SRGBColorSpace, PCFShadowMap, ShadowMaterial, Vector3,
} from "three/src/Three.Core.js";
import { PMREMGenerator } from "three/src/extras/PMREMGenerator.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createCinemaHands } from "./cinema-hand-rig";
import { codeForCharacter, fingerForCode, keyboardRows } from "./cinema-keyboard";
import { fingerPointerColor, keyLegendColor, pointerHalfWidth, pointerHeight, thumbPointerLiftPixels, separateKeyLegend, type GuideBox } from "./cinema-guide-layout";

export type CinemaState = { started: boolean; paused: boolean; code: string | null; pressed: string | null; hint: boolean; jamo?: string };
export type CinemaScene = { update(state: CinemaState): void; dispose(): void };
type Cap = { group: Group; skin: MeshPhysicalMaterial; label: Mesh<PlaneGeometry, MeshBasicMaterial>; lift: number; x: number; z: number; resting: number; hangul: string; glyph: string; draw: (glyph: string) => void };

export async function createCinemaScene(host: HTMLElement, initial: CinemaState, legend: (code: string) => string = code => code.replace(/^Key/, ""), failed: () => void = () => {}): Promise<CinemaScene> {
  const { WebGLRenderer } = await import("three/src/renderers/WebGLRenderer.js");
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setClearColor(0, 0);
  renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new Scene(), camera = new PerspectiveCamera(25, 1, .1, 50);
  const environment = new RoomEnvironment(), pmrem = new PMREMGenerator(renderer), environmentMap = pmrem.fromScene(environment, .05);
  scene.environment = environmentMap.texture; scene.environmentIntensity = .3; environment.dispose(); pmrem.dispose();
  scene.add(new AmbientLight("#d1d5ff", .12), new HemisphereLight("#e9ecff", "#191222", .55));
  const keyLight = new DirectionalLight("#f8eddf", 1.5); keyLight.position.set(-3, 7, 4);
  keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.camera.left = -5; keyLight.shadow.camera.right = 5; keyLight.shadow.camera.top = 5; keyLight.shadow.camera.bottom = -5; keyLight.shadow.bias = -.0003; keyLight.shadow.normalBias = .018;
  const rim = new DirectionalLight("#afa9ff", 1.3); rim.position.set(5, 3, -2); scene.add(keyLight, rim);
  const deck = new Group(); deck.position.set(0, -.06, 1.4); scene.add(deck);
  const bodyMaterial = new MeshPhysicalMaterial({ color: "#32364b", roughness: .3, metalness: .7, clearcoat: .5 });
  const body = new Mesh(new RoundedBoxGeometry(6.85, .21, 2.6, 4, .075), bodyMaterial); body.position.y = -.095; body.receiveShadow = true; deck.add(body);
  const edge = new Mesh(new BoxGeometry(6.7, .025, 2.5), new MeshBasicMaterial({ color: "#6963c7" })); edge.position.y = -.13; deck.add(edge);
  const shape = new Shape(); const half = .245, radius = .06;
  shape.moveTo(-half + radius, -half); shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius); shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half); shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius); shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);
  const capGeometry = new ExtrudeGeometry(shape, { depth: .12, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025 });
  const labelGeometry = new PlaneGeometry(.41, .41), textures: CanvasTexture[] = [];
  const caps = new Map<string, Cap>();
  const makeKey = (latin: string, hangul: string, x: number, z: number, width = 1) => {
    const code = latin === "SPACE" ? "Space" : codeForCharacter(latin);
    const group = new Group(); group.position.set(x, .03, z); deck.add(group);
    const skin = new MeshPhysicalMaterial({ color: "#343647", roughness: .34, metalness: .14, clearcoat: .4 });
  const key = new Mesh(capGeometry, skin); key.rotation.x = -Math.PI / 2; key.scale.x = width; key.castShadow = true; key.receiveShadow = true; group.add(key);
    const image = document.createElement("canvas"); image.width = 512; image.height = 512;
    const context = image.getContext("2d")!;
    const texture = new CanvasTexture(image); texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures.push(texture);
    const draw = (glyph: string) => {
      context.clearRect(0, 0, 512, 512); context.textAlign = "center";
      context.strokeStyle = "#030713"; context.lineWidth = 28; context.lineJoin = "round";
      context.fillStyle = "#ffffff"; context.font = "800 220px system-ui, sans-serif";
      context.strokeText(glyph, 256, 256); context.fillText(glyph, 256, 256);
      context.font = "700 100px system-ui, sans-serif"; context.lineWidth = 20;
      context.strokeText(legend(code), 256, 424); context.fillText(legend(code), 256, 424);
      texture.needsUpdate = true;
    };
    draw(hangul);
    const label = new Mesh(labelGeometry, new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
    label.rotation.x = -Math.PI / 2; label.position.set(0, .15, 0); group.add(label);
    caps.set(code, { group, skin, label, lift: 0, x, z: z + deck.position.z, resting: .03, hangul, glyph: hangul, draw });
  };
  for (const row of keyboardRows) Array.from(row.latin).forEach((latin, i) => makeKey(latin, Array.from(row.hangul)[i], (i - 4.5) * .58 + row.offset, row.z));
  makeKey("SPACE", "␣", 0, 1.19, 5.8);
  const groove = new Mesh(new BoxGeometry(1.3, .009, .018), new MeshBasicMaterial({ color: "#8c94a8" })); groove.position.set(0, .01, 1.13); deck.add(groove);
  const disposeMeshes = () => {
    const geometries = new Set<import("three").BufferGeometry>(), materials = new Set<import("three").Material>();
    scene.traverse(object => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      if ("skeleton" in object) (object.skeleton as import("three").Skeleton).dispose();
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    environmentMap.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
  let hands: Awaited<ReturnType<typeof createCinemaHands>>;
  try { hands = await createCinemaHands(); } catch (error) { disposeMeshes(); throw error; }
  scene.add(hands.root);
  const fingerPointer = new Group(), fingerPosition = new Vector3(), projectedPosition = new Vector3();
  const pointerCorners = Array.from({ length: 4 }, () => new Vector3()), legendCorners = Array.from({ length: 4 }, () => new Vector3());
  fingerPointer.name = "finger-pointer";
  const pointerInk = new MeshBasicMaterial({ color: fingerPointerColor, toneMapped: false, depthTest: false, depthWrite: false });
  const pointerEdge = new MeshBasicMaterial({ color: "#111827", toneMapped: false, depthTest: false, depthWrite: false });
  for (const [radius, height, material, order] of [[.062, .12, pointerEdge, 30], [.045, .095, pointerInk, 31]] as const) {
    const tip = new Mesh(new ConeGeometry(radius, height, 16), material);
    tip.rotation.z = Math.PI; tip.position.y = height / 2; tip.renderOrder = order; fingerPointer.add(tip);
  }
  for (const [radius, material, order] of [[.025, pointerEdge, 30], [.013, pointerInk, 31]] as const) {
    const stem = new Mesh(new CylinderGeometry(radius, radius, .15, 16), material);
    stem.position.y = .16; stem.renderOrder = order; fingerPointer.add(stem);
  }
  scene.add(fingerPointer);
  const legendLeader = new Line(new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]),
    new LineBasicMaterial({ color: keyLegendColor, transparent: true, opacity: .55, toneMapped: false, depthTest: false, depthWrite: false }));
  legendLeader.renderOrder = 18; scene.add(legendLeader);
  let viewportWidth = 1, viewportHeight = 1;
  const projectedBounds = (points: Vector3[]): GuideBox => {
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (const point of points) {
      projectedPosition.copy(point).project(camera);
      const x = (projectedPosition.x + 1) * viewportWidth / 2, y = (1 - projectedPosition.y) * viewportHeight / 2;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    return { left, right, top, bottom };
  };
  const floor = new Mesh(new PlaneGeometry(22, 25), new MeshBasicMaterial({ color: "#0a1020" }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.3, -2); scene.add(floor);
  const shadows = new Mesh(new PlaneGeometry(22, 25), new ShadowMaterial({ opacity: .24 }));
  shadows.rotation.x = -Math.PI / 2; shadows.position.set(0, -.297, -2); shadows.receiveShadow = true; scene.add(shadows);
  const lineMaterial = new MeshBasicMaterial({ color: "#242c50", transparent: true, opacity: .5 });
  for (let x = -10; x <= 10; x += 2) {
    const line = new Mesh(new BoxGeometry(.012, .004, 20), lineMaterial); line.position.set(x, -.295, -3); scene.add(line);
  }
  for (let z = -12; z <= 6; z += 2) {
    const line = new Mesh(new BoxGeometry(20, .004, .012), lineMaterial); line.position.set(0, -.295, z); scene.add(line);
  }
  let state = initial, disposed = false, visible = true, last = -Infinity, elapsed = 0, enter = 0;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const baseColor = new Color("#343647"), activeColor = new Color("#8660ec");
  const paint = (time: number) => {
    if (disposed || !visible || document.visibilityState !== "visible" || time - last < 1000 / 30) return;
    const dt = Number.isFinite(last) ? Math.min(.08, (time - last) / 1000) : 0; last = time;
    if (!state.paused && !motion.matches) elapsed += dt;
    const goal = state.started ? 1 : 0;
    enter += (goal - enter) * (motion.matches ? 1 : Math.min(1, dt * 3.5));
    camera.position.set(0, 6.6 - enter * 1.0, 6.6 + enter * 2.1); camera.lookAt(0, .3 - enter * .2, -.8 - enter * .2);
    const code = state.pressed ?? (state.hint ? state.code : null);
    const fingerId = code ? fingerForCode[code] ?? null : null;
    const press = state.pressed ? 1 : state.hint && !motion.matches && !state.paused ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (elapsed % 1.9 - .6) / .9)) * Math.PI)) * .55 : 0;
    hands.pose(fingerId, press, code ? caps.get(code) : undefined, motion.matches ? 1 : Math.min(1, dt * 12));
    fingerPointer.visible = state.started && state.hint && Boolean(fingerId) && enter > .85;
    if (fingerId && hands.fingerTip(fingerId, fingerPosition)) {
      fingerPointer.position.copy(fingerPosition); fingerPointer.position.y += .06;
      if (fingerId.endsWith("-thumb")) {
        // The thumb's rounded pad extends past its tip joint. Give only its
        // arrow extra screen-space breathing room while keeping its aim fixed.
        camera.updateMatrixWorld(true);
        projectedPosition.copy(fingerPointer.position).project(camera);
        projectedPosition.y += thumbPointerLiftPixels * 2 / viewportHeight;
        fingerPointer.position.copy(projectedPosition.unproject(camera));
      }
      // A camera-facing vertical pointer stays legible without leaning into
      // the instructional glyph. The pointer never leaves the actual fingertip.
      fingerPointer.quaternion.copy(camera.quaternion);
      fingerPointer.scale.setScalar(state.pressed ? 1.06 : 1);
    }
    for (const [name, cap] of caps) {
      const active = name === code; cap.skin.color.copy(baseColor).lerp(activeColor, active ? 1 : 0);
      cap.skin.emissive.set(active ? "#2e1560" : "#000000"); cap.group.position.y += ((cap.resting - (name === state.pressed ? .055 : 0)) - cap.group.position.y) * .45;
      // Only the next instructional character stands up; the other legends stay
      // printed on the lying keycaps. The active legend cannot be hidden by a hand.
      const teaching = state.hint && name === state.code;
      const glyph = teaching && state.jamo ? (name === "Space" ? "␣" : state.jamo) : cap.hangul;
      if (cap.glyph !== glyph) { cap.glyph = glyph; cap.draw(glyph); }
      cap.lift += ((teaching ? 1 : 0) - cap.lift) * (motion.matches ? 1 : Math.min(1, dt * 13));
      cap.label.rotation.x = -Math.PI / 2 * (1 - cap.lift);
      cap.label.position.set(0, .15 + cap.lift * .43, cap.lift * .08);
      cap.label.scale.setScalar(1 + cap.lift * 1.10);
      cap.label.material.color.set(cap.lift > .12 ? keyLegendColor : "#ffffff");
      cap.label.material.depthTest = cap.lift < .12;
      cap.label.renderOrder = cap.lift > .12 ? 20 : 0;
    }
    legendLeader.visible = false;
    const teachingCap = state.code ? caps.get(state.code) : undefined;
    if (fingerPointer.visible && teachingCap && teachingCap.lift > .12) {
      camera.updateMatrixWorld(true);
      teachingCap.label.updateWorldMatrix(true, false);
      for (let i = 0; i < 4; i++) {
        const x = i % 2 ? 1 : -1, y = i < 2 ? 0 : pointerHeight;
        pointerCorners[i].set(x * pointerHalfWidth, y, 0).multiplyScalar(fingerPointer.scale.x).applyQuaternion(camera.quaternion).add(fingerPointer.position);
        legendCorners[i].set(x * .41 / 2, (i < 2 ? -1 : 1) * .41 / 2, 0).applyMatrix4(teachingCap.label.matrixWorld);
      }
      const offset = separateKeyLegend(projectedBounds(legendCorners), projectedBounds(pointerCorners), viewportWidth, viewportHeight);
      if (offset.x || offset.y) {
        teachingCap.label.getWorldPosition(projectedPosition); projectedPosition.project(camera);
        projectedPosition.x += offset.x * 2 / viewportWidth; projectedPosition.y -= offset.y * 2 / viewportHeight;
        projectedPosition.unproject(camera);
        teachingCap.label.position.copy(teachingCap.group.worldToLocal(projectedPosition)); teachingCap.label.updateWorldMatrix(false, false);
        const points = legendLeader.geometry.getAttribute("position");
        projectedPosition.set(0, -.41 / 2, 0).applyMatrix4(teachingCap.label.matrixWorld);
        points.setXYZ(0, projectedPosition.x, projectedPosition.y, projectedPosition.z);
        teachingCap.group.getWorldPosition(projectedPosition); projectedPosition.y += .12;
        points.setXYZ(1, projectedPosition.x, projectedPosition.y, projectedPosition.z); points.needsUpdate = true;
        legendLeader.geometry.computeBoundingSphere(); legendLeader.visible = true;
      }
    }
    renderer.render(scene, camera);
    if (state.paused && Math.abs(goal - enter) < .002) renderer.setAnimationLoop(null);
  };
  const wake = () => {
    if (disposed || !visible || document.visibilityState !== "visible") { renderer.setAnimationLoop(null); return; }
    last = -Infinity; renderer.setAnimationLoop(paint);
  };
  const lost = (event: Event) => { event.preventDefault(); renderer.setAnimationLoop(null); failed(); };
  const resize = () => {
    const rect = host.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    viewportWidth = rect.width; viewportHeight = rect.height;
    renderer.setSize(rect.width, rect.height); camera.aspect = rect.width / rect.height;
    // Keep the same foreground width on laptops, not just ultra-wide displays.
    camera.fov = 2 * Math.atan(Math.tan(49 * Math.PI / 360) / camera.aspect) * 180 / Math.PI;
    // Reframe upwards without shrinking the keyboard or changing the HTML screen.
    const framing = Math.min(.12, Math.max(0, (camera.aspect - 1.4) * .2));
    camera.setViewOffset(rect.width, rect.height, 0, rect.height * framing, rect.width, rect.height);
    camera.updateProjectionMatrix(); wake();
  };
  const observer = new ResizeObserver(resize); observer.observe(host);
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting); wake();
  }); visibility.observe(host);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", wake); motion.addEventListener("change", wake); resize();
  return {
    update(next) { if (state.pressed !== next.pressed) elapsed = 0; state = next; wake(); },
    dispose() {
      if (disposed) return;
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); visibility.disconnect(); document.removeEventListener("visibilitychange", wake); motion.removeEventListener("change", wake);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      legendLeader.geometry.dispose(); legendLeader.material.dispose(); disposeMeshes();
    },
  };
}
