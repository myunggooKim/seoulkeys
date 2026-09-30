import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, HemisphereLight,
  OrthographicCamera, Scene, SRGBColorSpace, Mesh,
} from "three/src/Three.Core.js";
import { createHandModel, poseHandModel } from "./hand-guide-model";
import type { GuideFinger } from "./HandGuide";

export type HandGuideState = { finger: GuideFinger | null; pressing?: boolean; paused?: boolean; reach?: "top" | "home" | "bottom" | "space" };
export type HandGuideScene = { update(state: HandGuideState): void; dispose(): void };

/** Owns GPU resources only. No listeners on typing inputs, no API calls. */
export async function createHandGuideScene(host: HTMLDivElement, initial: HandGuideState, failed: () => void): Promise<HandGuideScene> {
  const { WebGLRenderer } = await import("three/src/renderers/WebGLRenderer.js");
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0, 0);
  renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  renderer.domElement.setAttribute("aria-hidden", "true"); host.appendChild(renderer.domElement);
  const scene = new Scene(), camera = new OrthographicCamera(-4.3, 4.3, 2.7, -2.7, .1, 50);
  camera.position.set(0, -1.1, 12); camera.lookAt(0, .05, 0);
  scene.add(new HemisphereLight("#fff8ef", "#9e8aba", 1.3), new AmbientLight("#fff", .2));
  const key = new DirectionalLight("#fff0df", 2.2); key.position.set(-4, 5, 7);
  const fill = new DirectionalLight("#c6c9ff", .9); fill.position.set(5, 0, 4);
  const rim = new DirectionalLight("#fff", 1.5); rim.position.set(0, -3, -2); scene.add(key, fill, rim);
  const model = createHandModel(); scene.add(model.group);
  let state = initial, visible = true, disposed = false, lastFrame = -Infinity, phase = 0, firstFrame = true;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)"), canvas = renderer.domElement;
  const paint = (time: number) => {
    if (disposed || !visible || document.visibilityState !== "visible" || time - lastFrame < 1000 / 30) return;
    const delta = Number.isFinite(lastFrame) ? Math.min(.08, (time - lastFrame) / 1000) : 0;
    lastFrame = time;
    if (!state.paused && !motion.matches) phase += delta;
    const demonstration = motion.matches ? 0 : Math.sin(Math.min(1, Math.max(0, (phase % 1.6 - .45) / .8)) * Math.PI);
    poseHandModel(model.fingers, state.finger, state.pressing ? 1 : Math.max(0, demonstration), firstFrame ? 1 : Math.min(1, delta * 14));
    firstFrame = false; renderer.render(scene, camera);
    if (motion.matches || state.paused || !state.finger) renderer.setAnimationLoop(null);
  };
  const wake = () => {
    if (disposed || !visible || document.visibilityState !== "visible") { renderer.setAnimationLoop(null); return; }
    lastFrame = -Infinity; renderer.setAnimationLoop(paint);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect(); if (!width || !height) return;
    renderer.setSize(width, height);
    const halfHeight = Math.max(2.2, 4.25 / (width / height));
    camera.top = halfHeight; camera.bottom = -halfHeight; camera.left = -halfHeight * width / height; camera.right = -camera.left;
    camera.updateProjectionMatrix(); wake();
  };
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver((entries) => { visible = entries.some((entry) => entry.isIntersecting); wake(); }); visibilityObserver.observe(host);
  const lost = () => { renderer.setAnimationLoop(null); failed(); };
  canvas.addEventListener("webglcontextlost", lost); document.addEventListener("visibilitychange", wake); motion.addEventListener("change", wake); resize();
  return {
    update(next) { if (next.finger !== state.finger || next.pressing !== state.pressing) { phase = 0; firstFrame = true; } state = next; wake(); },
    dispose() {
      if (disposed) return; disposed = true; renderer.setAnimationLoop(null); sizeObserver.disconnect(); visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", wake); motion.removeEventListener("change", wake); canvas.removeEventListener("webglcontextlost", lost);
      const geometries = new Set<import("three").BufferGeometry>(), materials = new Set<import("three").Material>();
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return; geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        if ("skeleton" in object) (object.skeleton as import("three").Skeleton).dispose();
      });
      for (const geometry of geometries) geometry.dispose(); for (const material of materials) material.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
