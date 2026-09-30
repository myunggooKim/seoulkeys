import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PerspectiveCamera, SkinnedMesh, Vector3 } from "three/src/Three.Core.js";
import { createCinemaHands } from "../app/cinema-hand-rig";
import { codeForCharacter, fingerForCode, keyboardRows, nextKeyForText } from "../app/cinema-keyboard";
import { boxesClear, fingerPointerColor, keyLegendColor, pointerHalfWidth, pointerHeight, thumbPointerLiftPixels, separateKeyLegend } from "../app/cinema-guide-layout";

import test from "node:test";

test("theatre hands reach every key and leave legends, thumbs and Space visible", async () => {
assert.equal(nextKeyForText("한국을 여행해요.", "한국을"), "Space");
assert.equal(nextKeyForText("한국을 여행해요.", "한국을 "), "KeyD");
assert.equal(nextKeyForText("하마", "ㅎ"), "KeyK");
assert.equal(nextKeyForText("하마", "하마"), null);

const camera = new PerspectiveCamera(25, 1376 / 661, .1, 50);
camera.position.set(0, 5.6, 8.7); camera.lookAt(0, .1, -1); camera.updateMatrixWorld(true);
camera.setViewOffset(1376, 661, 0, 661 * .12, 1376, 661);
for (const [name, position] of Object.entries({ back: [0, .1, .1], front: [0, .1, 2.9], space: [0, .18, 2.59] })) {
  const ndc = new Vector3(...position).project(camera);
  console.log(name, { x: ndc.x, y: ndc.y, pixelY: (1 - ndc.y) * 661 / 2 });
  assert.ok(ndc.y > -.92 && ndc.y < 1, `${name} must fit inside the stage with a lower safety margin`);
}
const loader = new GLTFLoader();
const hands = await createCinemaHands(async side => {
  const data = await readFile(new URL(`../public/images/typing-theatre/${side}.glb`, import.meta.url));
  return loader.parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), "");
});
const anchored = ["left", "right"].map(side => hands.root.getObjectByName(`guide-hand-${side}`));
const anchors = anchored.map(hand => ({ position: hand.position.toArray(), quaternion: hand.quaternion.toArray(), scale: hand.scale.toArray() }));
assert.deepEqual(anchors.map(anchor => anchor.scale), [[18, 18, 18], [18, 18, 18]]);
assert.deepEqual(anchors.map(anchor => anchor.position[2]), [3.9, 3.9]);
assert.equal(hands.root.children.length, 2, "only two anatomical hands; no circular cuffs or artificial sleeves");
for (const hand of anchored) assert.equal(hand.getObjectByName("thumb-metacarpal").scale.x, .84, "thumbs are proportionally reduced");
hands.root.traverse(object => {
  if (object.isSkinnedMesh) {
    const material = object.material;
    assert.equal(material.transparent, true);
    const colors = object.geometry.getAttribute("color"); assert.equal(colors.itemSize, 4);
    assert.ok(Math.abs(colors.getW(0) - .44) < .001, "hands start translucent");
  }
});
for (const pressing of [0, 1]) {
  hands.pose("right-thumb", pressing, { x: 0, z: 2.59 }, 1);
  hands.root.updateMatrixWorld(true);
  hands.root.traverse(object => {
    if (!object.isSkinnedMesh) return;
    object.skeleton.update();
    const p = object.geometry.getAttribute("position"), si = object.geometry.getAttribute("skinIndex"), sw = object.geometry.getAttribute("skinWeight");
    let minimum = Infinity, maximum = -Infinity;
    for (let i = 0; i < p.count; i++) {
      let thumbWeight = 0;
      for (let j = 0; j < 4; j++) if (object.skeleton.bones[si.getComponent(i, j)]?.name.startsWith("thumb")) thumbWeight += sw.getComponent(i, j);
      if (thumbWeight < .6) continue;
      const v = new Vector3().fromBufferAttribute(p, i); object.applyBoneTransform(i, v); v.applyMatrix4(object.matrixWorld);
      minimum = Math.min(minimum, v.y); maximum = Math.max(maximum, v.y);
    }
    console.log("thumb", pressing, { minimum, maximum });
    assert.ok(minimum > (pressing ? .04 : .10), "thumb skin must clear the current space-bar surface");
  });
}
for (const [finger, key] of [
  ["left-pinky", { x: -2.77, z: .85 }], ["left-index", { x: -.29, z: 1.44 }],
  ["right-index", { x: .29, z: 1.44 }], ["right-thumb", { x: 0, z: 2.59 }],
]) {
  hands.pose(finger, 1, key, 1);
  assert.equal(hands.fingerTip(finger, new Vector3()), true, "every active finger exposes a real skeletal pointer target");
  anchored.forEach((hand, index) => {
    assert.ok(hand.position.distanceTo(new Vector3(...anchors[index].position)) <= .751, "far keys allow only a bounded wrist reach");
    assert.deepEqual(hand.quaternion.toArray(), anchors[index].quaternion); assert.deepEqual(hand.scale.toArray(), anchors[index].scale);
  });
}
console.log("PASS: space cue, composition, camera bounds, thumb clearances and anchored palms");

const allKeys = keyboardRows.flatMap(row => Array.from(row.latin).map((latin, i) => ({
  code: codeForCharacter(latin), x: (i - 4.5) * .58 + row.offset, z: row.z + 1.4,
})));
allKeys.push({ code: "Space", x: 0, z: 2.59 });
let checked = 0;
assert.notEqual(fingerPointerColor, keyLegendColor, "finger and key use distinct visual channels");
for (const aspect of [1.2, 1.75, 2.1]) {
  const height = 661, width = height * aspect;
  camera.aspect = aspect; camera.fov = 2 * Math.atan(Math.tan(49 * Math.PI / 360) / aspect) * 180 / Math.PI;
  camera.setViewOffset(width, height, 0, height * Math.min(.12, Math.max(0, (aspect - 1.4) * .2)), width, height);
  camera.updateProjectionMatrix();
  const bounds = (points) => {
    const projected = points.map(point => point.project(camera));
    return { left: Math.min(...projected.map(p => (p.x + 1) * width / 2)), right: Math.max(...projected.map(p => (p.x + 1) * width / 2)),
      top: Math.min(...projected.map(p => (1 - p.y) * height / 2)), bottom: Math.max(...projected.map(p => (1 - p.y) * height / 2)) };
  };
  for (const key of allKeys) for (const pressing of [0, 1]) for (const lift of [.2, .55, 1]) {
    const finger = fingerForCode[key.code];
    hands.pose(finger, pressing, key, 1);
    const point = new Vector3(); assert.ok(hands.fingerTip(finger, point)); point.y += .06;
    if (finger.endsWith("-thumb")) {
      const before = point.clone().project(camera);
      point.project(camera); point.y += thumbPointerLiftPixels * 2 / height; point.unproject(camera);
      const after = point.clone().project(camera);
      assert.ok(Math.abs((after.y - before.y) * height / 2 - 32) < .001, "thumb arrow gains 32px of clearance at every aspect ratio");
      assert.ok(Math.abs(after.x - before.x) < .000001, "the thumb arrow still points to the same fingertip");
    }
    const center = new Vector3(key.x, .12 + .43 * lift - .055 * pressing, key.z + .08 * lift);
    const half = .41 * (1 + 1.10 * lift) / 2, angle = -Math.PI / 2 * (1 - lift);
    const corners = [-1, 1].flatMap(x => [-1, 1].map(y => new Vector3(x * half, y * half * Math.cos(angle), y * half * Math.sin(angle)).add(center)));
    const label = bounds(corners.map(corner => corner.clone()));
    const scale = pressing ? 1.06 : 1;
    const pointer = bounds([-1, 1].flatMap(x => [0, pointerHeight].map(y => new Vector3(x * pointerHalfWidth * scale, y * scale, 0).applyQuaternion(camera.quaternion).add(point))));
    const offset = separateKeyLegend(label, pointer, width, height);
    const adjusted = center.clone().project(camera);
    adjusted.x += offset.x * 2 / width; adjusted.y -= offset.y * 2 / height; adjusted.unproject(camera).sub(center);
    const placed = bounds(corners.map(corner => corner.add(adjusted)));
    assert.ok(boxesClear(pointer, placed, 10),
      `pointer must clear the raised ${key.code} legend: ${JSON.stringify({ aspect, pressing, lift, pointer, label, placed })}`);
    checked++;
  }
}
console.log(`PASS: ${checked} projected pointer/legend separation cases`);
const restIndex = new Vector3(), restMiddle = new Vector3(), pressedIndex = new Vector3(), pressedMiddle = new Vector3();
hands.pose(null, 0, undefined, 1); hands.fingerTip("left-index", restIndex); hands.fingerTip("left-middle", restMiddle);
hands.pose("left-index", 1, { x: -.29, z: 1.44 }, 1); hands.fingerTip("left-index", pressedIndex); hands.fingerTip("left-middle", pressedMiddle);
const leftHand = anchored[0];
const indexKnuckle = leftHand.getObjectByName("index-finger-phalanx-proximal").getWorldPosition(new Vector3());
const middleKnuckle = leftHand.getObjectByName("middle-finger-phalanx-proximal").getWorldPosition(new Vector3());
assert.ok(indexKnuckle.distanceTo(middleKnuckle) < .95, "ㅎ reaches with the index without detaching its base from the middle finger");
assert.ok(pressedIndex.y > .15, "ㅎ index tip must not disappear into the keyboard");
const inspectAlpha = () => {
  let translucent = 0, opaque = 0, total = 0;
  hands.root.traverse(object => {
    if (!object.isSkinnedMesh) return;
    const colors = object.geometry.getAttribute("color");
    for (let i = 0; i < colors.count; i++) { total++; if (colors.getW(i) > .99) opaque++; if (Math.abs(colors.getW(i) - .44) < .001) translucent++; }
  });
  return { translucent, opaque, total };
};
const selectedAlpha = inspectAlpha();
assert.ok(selectedAlpha.opaque > 10 && selectedAlpha.opaque < selectedAlpha.total * .08, "only a small fingertip region is opaque");
assert.ok(selectedAlpha.translucent > selectedAlpha.total * .9, "both hands remain mostly translucent");
for (const key of allKeys) {
  hands.pose(fingerForCode[key.code], 1, key, 1);
  const alpha = inspectAlpha(); assert.ok(alpha.opaque > 10 && alpha.translucent > alpha.total * .9, `${key.code} highlights only its fingertip`);
}
hands.pose(null, 0, undefined, 1); assert.equal(inspectAlpha().opaque, 0, "all fingertips return to translucency when guidance is off");
console.log("PASS: transparent hands, opaque fingertips, ㅎ finger spacing and tip clearance", selectedAlpha);
let maximumTargetError = 0, minimumStroke = Infinity;
for (const key of allKeys) {
  const finger = fingerForCode[key.code], hover = new Vector3(), contact = new Vector3();
  hands.pose(finger, 0, key, 1); hands.fingerTip(finger, hover);
  hands.pose(finger, 1, key, 1); hands.fingerTip(finger, contact);
  const target = new Vector3(key.code === "Space" ? .50 : key.x, key.code === "Space" ? .34 : .17, key.code === "Space" ? key.z - .19 : key.z);
  maximumTargetError = Math.max(maximumTargetError, contact.distanceTo(target)); minimumStroke = Math.min(minimumStroke, hover.distanceTo(contact));
  assert.ok(contact.distanceTo(target) < .1, `${key.code} finger must actually reach its key: ${contact.distanceTo(target)}`);
  assert.ok(hover.distanceTo(contact) > .1, `${key.code} finger must press and return, not remain fixed`);
}
console.log("PASS: real key retargeting and articulated strokes", { maximumTargetError, minimumStroke });
});
