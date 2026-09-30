import assert from "node:assert/strict";
import test from "node:test";
import { PerspectiveCamera, Vector3 } from "three/src/Three.Core.js";
import { cinemaKeyboardBounds, cinemaScreenCorners, cinemaScreenRect, frameCinemaCamera } from "../app/cinema-composition";

test("the complete Space bar and screen fit short, resized and portrait windows throughout entry", () => {
  for (const [width, height] of [[1200, 420], [960, 360], [790, 440], [700, 300], [360, 360], [300, 260], [1100, 660], [1600, 900]]) {
    for (const entry of [0, .25, .5, .75, 1]) {
      const camera = new PerspectiveCamera();
      frameCinemaCamera(camera, width, height, entry);
      for (const point of [...cinemaKeyboardBounds, ...cinemaScreenCorners]) {
        const ndc = point.clone().project(camera);
        assert.ok(Math.abs(ndc.x) <= .90001, `${width}×${height}: full horizontal keyboard edges`);
        assert.ok(ndc.y >= -.85001 && ndc.y <= .89001, `${width}×${height}: Space has a bottom safety margin: ${ndc.y}`);
      }
      const rectangle = cinemaScreenRect(camera, width, height);
      const rearLeft = new Vector3(-3.425, .1, .02).project(camera);
      assert.ok(Math.abs(rectangle.left - (rearLeft.x + 1) * width / 2) < .001);
      assert.ok(Math.abs(rectangle.left + rectangle.width / 2 - width / 2) < .001, "reading rectangle and keyboard have the same centre");
      assert.ok(rectangle.top >= height * .04, "screen stays below the top safety margin");
      const keyboardWidth = cinemaKeyboardBounds.reduce((range, p) => {
        const x = p.clone().project(camera).x;
        return [Math.min(range[0], x), Math.max(range[1], x)];
      }, [Infinity, -Infinity]);
      const screenWidth = cinemaScreenCorners[1].clone().project(camera).x - cinemaScreenCorners[0].clone().project(camera).x;
      assert.ok(screenWidth < keyboardWidth[1] - keyboardWidth[0], "foreground keyboard is larger than the screen");
    }
  }
});

test("reading screen is never tilted or transformed", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const screenRule = css.match(/\.typing-panel\[data-projected="true"\] \{[^}]*\}/s)?.[0];
  assert.ok(screenRule, "the projected screen has a dedicated CSS rule");
  assert.match(screenRule, /transform: none;/);
  assert.doesNotMatch(screenRule, /cinema-screen-transform|matrix3d|rotateX/);
});
