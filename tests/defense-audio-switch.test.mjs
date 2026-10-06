import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';
import postcss from 'postcss';

const require = createRequire(import.meta.url);
const cache = new Map();
function loadComponent(file) {
  if (cache.has(file)) return cache.get(file);
  const compiledModule = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(compiled, {
    module: compiledModule, exports: compiledModule.exports, console,
    require: (specifier) => {
      if (specifier.endsWith('.css')) return {};
      if (!specifier.startsWith('.')) return require(specifier);
      const path = resolve(dirname(file), specifier);
      return loadComponent(path + (specifier === './DefenseAudioSwitch' || specifier === './GodotDefenseGame' ? '.tsx' : '.ts'));
    },
  });
  cache.set(file, compiledModule.exports);
  return compiledModule.exports;
}
const { DefenseAudioSwitch } = loadComponent(resolve('app/DefenseAudioSwitch.tsx'));
const common = { label: 'Music', onLabel: 'On', offLabel: 'Off', onCheckedChange: () => {} };

test('switch exposes a stable accessible name, true checked state and visible track/thumb', () => {
  for (const checked of [false, true]) {
    const markup = renderToStaticMarkup(createElement(DefenseAudioSwitch, { ...common, checked }));
    assert.match(markup, /type="button"/);
    assert.match(markup, /role="switch"/);
    assert.match(markup, /aria-label="Music"/);
    assert.match(markup, new RegExp(`aria-checked="${checked}"`));
    assert.match(markup, new RegExp(`class="defense-switch-state" aria-hidden="true">${checked ? 'On' : 'Off'}<`));
    assert.match(markup, /class="defense-switch-track" aria-hidden="true"/);
    assert.match(markup, /class="defense-switch-thumb"/);
    assert.doesNotMatch(markup, /aria-pressed|tabindex="-1"/);
  }
});

test('sound and music each change only their own state in all four combinations', () => {
  for (const sound of [false, true]) for (const music of [false, true]) {
    const states = { sound, music };
    const soundElement = DefenseAudioSwitch({ ...common, label: 'Sound', checked: sound, onCheckedChange: (value) => { states.sound = value; } });
    const musicElement = DefenseAudioSwitch({ ...common, checked: music, onCheckedChange: (value) => { states.music = value; } });
    soundElement.props.onClick();
    assert.deepEqual(states, { sound: !sound, music });
    musicElement.props.onClick();
    assert.deepEqual(states, { sound: !sound, music: !music });
  }
});

test('native button keyboard semantics are retained without manual key/focus interception', () => {
  const element = DefenseAudioSwitch({ ...common, checked: true });
  assert.equal(element.type, 'button');
  assert.equal(element.props.tabIndex, undefined);
  assert.equal(element.props.onKeyDown, undefined);
  assert.equal(element.props.onKeyUp, undefined);
  assert.equal(element.props.onMouseDown, undefined);
  const disabled = DefenseAudioSwitch({ ...common, checked: true, disabled: true });
  assert.equal(disabled.props.disabled, true);
});

test('Korean switches announce the stable label while exposing localized visible state', () => {
  for (const label of ['전체 소리', '배경음악']) {
    const markup = renderToStaticMarkup(createElement(DefenseAudioSwitch, { ...common, label, checked: false, onLabel: '켜짐', offLabel: '꺼짐' }));
    assert.ok(markup.includes(`aria-label="${label}"`));
    assert.ok(markup.includes('>꺼짐<'));
  }
});

test('site binds independent audio controls and fullscreen remains an action', () => {
  const page = readFileSync('app/page.tsx', 'utf8');
  const host = readFileSync('app/GodotDefenseGame.tsx', 'utf8');
  assert.match(page, /onSoundEnabledChange=\{setReturnSoundEnabled\}/);
  assert.match(page, /onMusicEnabledChange=\{setDefenseMusicEnabled\}/);
  assert.equal((host.match(/<DefenseAudioSwitch /g) || []).length, 2);
  assert.doesNotMatch(host, /aria-pressed=/);
  assert.match(host, /toggleFullscreen\(event\.detail > 0\)/);
  assert.match(host, /if \(returnToGame\) focusGame\(\)/);
  assert.match(host, /if \(exited && !suspended\) fullscreenButtonRef\.current\?\.focus/);
  assert.doesNotMatch(host, /rootRef\.current\?\.contains\(document\.activeElement\)/);
});

test('modern styling is defense-scoped and the shared crossword base stays unchanged', () => {
  const css = readFileSync('app/godot-defense.css', 'utf8');
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) assert.match(selector, /\.game-page|\.godot-defense-game/, `Unscoped selector: ${selector}`);
  });
  assert.doesNotMatch(css, /monospace|#d8a374|#736044|#f4ebd9|#302634/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /--defense-accent: #78a9ff/);
});
