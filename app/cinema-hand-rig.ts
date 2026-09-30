import { Bone, Color, Float32BufferAttribute, Group, Matrix4, MeshPhysicalMaterial, Quaternion, SkinnedMesh, Vector3 } from "three/src/Three.Core.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import type { GuideFinger } from "./HandGuide";
import { fingerPointerColor } from "./cinema-guide-layout";

type FingerPose = { hover: Quaternion[]; down: Quaternion[]; reach: Vector3 };
type RigFinger = { id: GuideFinger; base: Bone; baseRest: Quaternion; basePose: Quaternion; joints: Bone[]; tip: Bone; rests: Quaternion[]; tipVertices: { index: number; strength: number }[]; current: Quaternion[]; idle: Quaternion[]; poses: Map<string, FingerPose> };
type RigHand = { mesh: SkinnedMesh; holder: Group; anchor: Vector3; reach: Vector3; fingers: RigFinger[]; colors: Float32BufferAttribute; highlighted: GuideFinger | null };

/** Anatomical MIT-licensed mesh with continuous palm/finger skin and a real skeleton. */
export async function createCinemaHands(loadAsset?: (side: "left" | "right") => Promise<GLTF>) {
  const root = new Group(), hands: RigHand[] = [];
  const loader = new GLTFLoader();
  const skinColor = new Color("#c6a087"), tipColor = new Color(fingerPointerColor), translucentAlpha = .44;
  for (const side of ["left", "right"] as const) {
    const asset = loadAsset ? await loadAsset(side) : await loader.loadAsync(`/images/typing-theatre/${side}.glb`);
    const mesh = asset.scene.getObjectByProperty("type", "SkinnedMesh") as SkinnedMesh;
    mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false;
    const wrist = asset.scene.getObjectByName("wrist") as Bone;
    asset.scene.updateMatrixWorld(true);
    const wristPosition = wrist.getWorldPosition(new Vector3());
    const fingers: RigFinger[] = [];
    // WebXR models store joints as siblings. Preserve their bind transforms while
    // turning them into real chains, so rotations bend the entire finger naturally.
    for (const name of ["thumb", "index", "middle", "ring", "pinky"] as const) {
      const prefix = name === "thumb" ? "thumb" : `${name}-finger`;
      const suffixes = name === "thumb" ? ["metacarpal", "phalanx-proximal", "phalanx-distal", "tip"] : ["metacarpal", "phalanx-proximal", "phalanx-intermediate", "phalanx-distal", "tip"];
      const chain = suffixes.map((suffix) => asset.scene.getObjectByName(`${prefix}-${suffix}`) as Bone);
      wrist.attach(chain[0]); for (let i = 1; i < chain.length; i++) chain[i - 1].attach(chain[i]);
      const joints = chain.slice(1, -1);
      const distal = chain[chain.length - 2], tipBone = chain[chain.length - 1];
      const distalIndex = mesh.skeleton.bones.indexOf(distal), tipIndex = mesh.skeleton.bones.indexOf(tipBone);
      const distalBind = new Vector3().setFromMatrixPosition(mesh.skeleton.boneInverses[distalIndex].clone().invert());
      const tipBind = new Vector3().setFromMatrixPosition(mesh.skeleton.boneInverses[tipIndex].clone().invert());
      const along = tipBind.clone().sub(distalBind), lengthSquared = along.lengthSq(), point = new Vector3();
      const p = mesh.geometry.getAttribute("position"), indices = mesh.geometry.getAttribute("skinIndex"), weights = mesh.geometry.getAttribute("skinWeight");
      const tipVertices: RigFinger["tipVertices"] = [];
      for (let i = 0; i < p.count; i++) {
        let endWeight = 0;
        for (let j = 0; j < 4; j++) if (indices.getComponent(i, j) === distalIndex || indices.getComponent(i, j) === tipIndex) endWeight += weights.getComponent(i, j);
        if (endWeight < .55) continue;
        point.fromBufferAttribute(p, i).applyMatrix4(mesh.bindMatrix).sub(distalBind);
        const fraction = point.dot(along) / lengthSquared;
        const strength = Math.min(1, Math.max(0, (fraction - .4) / .25));
        if (strength > 0) tipVertices.push({ index: i, strength });
      }
      fingers.push({ id: `${side}-${name}`, base: chain[0], baseRest: chain[0].quaternion.clone(), basePose: chain[0].quaternion.clone(), joints, tip: tipBone, rests: joints.map((bone) => bone.quaternion.clone()), tipVertices, current: [], idle: [], poses: new Map() });
    }
    asset.scene.position.sub(wristPosition);
    const holder = new Group(); holder.add(asset.scene);
    const handed = side === "left" ? -1 : 1;
    const orientation = new Matrix4().makeBasis(new Vector3(0, handed, 0), new Vector3(0, 0, 1), new Vector3(handed, 0, 0));
    holder.quaternion.setFromRotationMatrix(orientation);
    holder.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -.10));
    holder.scale.setScalar(18); holder.name = `guide-hand-${side}`;
    // Retreat towards the learner: crop the wrists lower in the frame and keep
    // fingertips over the home row instead of pushing them behind the screen.
    const center = side === "left" ? -1.65 : 1.65; holder.position.set(center, 1.04, 3.9);
    root.add(holder);
    // The open WebXR rest pose points the thumbs down through the desk. Lift
    // their actual metacarpal joints, not an overlay or an entire floating hand.
    root.updateMatrixWorld(true);
    const thumbBase = asset.scene.getObjectByName("thumb-metacarpal") as Bone;
    const liftAxis = new Vector3(0, 0, 1).applyQuaternion(wrist.getWorldQuaternion(new Quaternion()).invert());
    thumbBase.quaternion.premultiply(new Quaternion().setFromAxisAngle(liftAxis, (side === "left" ? 1 : -1) * 1.15));
    const thumb = fingers.find(finger => finger.id.endsWith("-thumb"))!;
    thumb.baseRest.copy(thumbBase.quaternion); thumb.basePose.copy(thumbBase.quaternion);
    thumbBase.scale.setScalar(.84);
    const previous = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; for (const material of previous) material.dispose();
    const colors = new Float32BufferAttribute(new Float32Array(mesh.geometry.getAttribute("position").count * 4), 4);
    for (let i = 0; i < colors.count; i++) colors.setXYZW(i, skinColor.r, skinColor.g, skinColor.b, translucentAlpha);
    mesh.geometry.setAttribute("color", colors);
    // RGBA per-vertex alpha allows only the active fingertip to be opaque while
    // the rest of both hands remains a see-through guide over the printed keys.
    mesh.material = new MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, transparent: true, depthWrite: false,
      roughness: .7, metalness: 0, clearcoat: .02, sheen: .05, sheenColor: "#ffe0cf", sheenRoughness: .85 });
    // No artificial circular cuffs/sleeves. The real wrist retreats below the
    // frame; transparency must not reveal a distracting cylinder inside it.
    hands.push({ mesh, holder, anchor: holder.position.clone(), reach: new Vector3(), fingers, colors, highlighted: null });
  }
  const axis = new Vector3(1, 0, 0), jointPosition = new Vector3(), tipPosition = new Vector3(), from = new Vector3(), to = new Vector3(), parentRotation = new Quaternion(), deltaRotation = new Quaternion(), localRotation = new Quaternion(), wanted = new Quaternion();
  const homeX: Record<string, number> = { thumb: .50, index: .87, middle: 1.45, ring: 2.03, pinky: 2.61 };
  const home = (finger: RigFinger) => {
    const name = finger.id.split("-")[1], side = finger.id.startsWith("left") ? -1 : 1;
    return new Vector3(side * homeX[name], name === "thumb" ? .48 : .34, name === "thumb" ? 2.40 : 1.44);
  };
  const reference = (finger: RigFinger) => [finger.baseRest.clone(), ...finger.rests.map(rest => rest.clone().multiply(new Quaternion().setFromAxisAngle(axis, -.10)))];
  const solve = (hand: RigHand, finger: RigFinger, target: Vector3, reach: Vector3) => {
    hand.holder.position.copy(hand.anchor).add(reach);
    const bones = [finger.base, ...finger.joints], rests = reference(finger);
    bones.forEach((bone, index) => bone.quaternion.copy(rests[index])); root.updateMatrixWorld(true);
    // CCD retargets the real skeletal chain to a key. Joint limits keep it a
    // curved finger rather than a stretched mesh or a sliding whole hand.
    for (let iteration = 0; iteration < 28; iteration++) {
      finger.tip.getWorldPosition(tipPosition);
      if (tipPosition.distanceToSquared(target) < .000016) break;
      for (let index = bones.length - 1; index >= 0; index--) {
        const bone = bones[index]; bone.getWorldPosition(jointPosition); finger.tip.getWorldPosition(tipPosition);
        from.copy(tipPosition).sub(jointPosition).normalize(); to.copy(target).sub(jointPosition).normalize();
        deltaRotation.setFromUnitVectors(from, to);
        const turn = new Quaternion().angleTo(deltaRotation);
        if (turn > .35) deltaRotation.slerp(new Quaternion(), 1 - .35 / turn);
        bone.parent!.getWorldQuaternion(parentRotation);
        localRotation.copy(parentRotation).invert().multiply(deltaRotation).multiply(parentRotation).multiply(bone.quaternion);
        // A thumb presses with its pad, not a hooked end joint. Most reach comes
        // from its metacarpal; the two visible phalanges stay gently curved.
        const thumb = finger.id.endsWith("thumb");
        const limit = thumb ? (index === 0 ? 1.65 : index === 1 ? .50 : .38)
          : index === 0 ? .24 : index === 1 ? 1.45 : index === 2 ? 1.6 : 1.2;
        const angle = rests[index].angleTo(localRotation);
        if (angle > limit) localRotation.copy(rests[index]).slerp(localRotation, limit / angle);
        bone.quaternion.copy(localRotation); bone.updateWorldMatrix(true, true);
      }
    }
    return bones.map(bone => bone.quaternion.clone());
  };
  const keyPose = (hand: RigHand, finger: RigFinger, key: { x: number; z: number }): FingerPose => {
    // A thumb uses the near corner of the wide space bar, not its geometric
    // centre. Forcing its shorter chain to the centre created a hooked joint.
    const thumb = finger.id.endsWith("thumb");
    const targetX = thumb ? (finger.id.startsWith("left") ? -.50 : .50) : key.x;
    const targetZ = thumb ? key.z - .19 : key.z;
    const cacheKey = `${targetX}:${targetZ}`;
    const cached = finger.poses.get(cacheKey); if (cached) return cached;
    hand.holder.position.copy(hand.anchor); root.updateMatrixWorld(true);
    const target = new Vector3(targetX, thumb ? .34 : .17, targetZ), bones = [finger.base, ...finger.joints, finger.tip];
    let length = 0;
    for (let i = 1; i < bones.length; i++) length += bones[i].getWorldPosition(from).distanceTo(bones[i - 1].getWorldPosition(to));
    finger.base.getWorldPosition(jointPosition);
    const reach = target.clone().sub(jointPosition); reach.y = 0;
    // Only keys outside a finger's anatomical reach move that wrist slightly.
    // The top-row pinky reach is at most one key-row depth, never a large slide.
    const extension = Math.min(.75, Math.max(0, jointPosition.distanceTo(target) - length * .985));
    reach.normalize().multiplyScalar(extension);
    const down = solve(hand, finger, target, reach);
    target.y = finger.id.endsWith("thumb") ? .50 : .36; const hover = solve(hand, finger, target, reach);
    const result = { hover, down, reach }; finger.poses.set(cacheKey, result); return result;
  };
  for (const hand of hands) {
    for (const finger of hand.fingers) {
      finger.idle = solve(hand, finger, home(finger), new Vector3());
      finger.current = finger.idle.map(rotation => rotation.clone());
    }
    hand.holder.position.copy(hand.anchor);
  }
  return {
    root,
    fingerTip(id: GuideFinger, position: Vector3) {
      root.updateMatrixWorld(true);
      for (const hand of hands) {
        const finger = hand.fingers.find(finger => finger.id === id);
        if (finger) { finger.tip.getWorldPosition(position); return true; }
      }
      return false;
    },
    pose(active: GuideFinger | null, press: number, key: { x: number; z: number } | undefined, blend: number) {
      for (const hand of hands) {
        const selected = hand.fingers.some(finger => finger.id === active) ? active : null;
        if (hand.highlighted !== selected) {
          for (const finger of hand.fingers) if (finger.id === hand.highlighted || finger.id === selected) {
            for (const { index, strength } of finger.tipVertices) {
              const amount = finger.id === selected ? strength : 0;
              hand.colors.setXYZW(index, skinColor.r + (tipColor.r - skinColor.r) * amount, skinColor.g + (tipColor.g - skinColor.g) * amount,
                skinColor.b + (tipColor.b - skinColor.b) * amount, translucentAlpha + (1 - translucentAlpha) * amount);
            }
          }
          hand.colors.needsUpdate = true; hand.highlighted = selected;
        }
        const selectedFinger = hand.fingers.find(finger => finger.id === active);
        const targetPose = selectedFinger && key ? keyPose(hand, selectedFinger, key) : null;
        hand.reach.lerp(targetPose?.reach ?? new Vector3(), blend);
        hand.holder.position.copy(hand.anchor).add(hand.reach);
        for (const finger of hand.fingers) {
          const bones = [finger.base, ...finger.joints];
          bones.forEach((bone, index) => {
            wanted.copy(finger.idle[index]);
            if (finger === selectedFinger && targetPose) wanted.copy(targetPose.hover[index]).slerp(targetPose.down[index], press);
            finger.current[index].slerp(wanted, blend); bone.quaternion.copy(finger.current[index]);
          });
        }
      }
    },
  };
}
