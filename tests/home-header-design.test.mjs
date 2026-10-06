import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {homeGuideLabel,homeNavigation} from '../app/home-navigation.ts';
import {supportedLocaleCodes} from '../app/locale-detection.ts';

test('curriculum and community navigation labels exist in all 33 supported languages',()=>{
  assert.deepEqual(Object.keys(homeNavigation).sort(),[...supportedLocaleCodes].sort());
  assert.deepEqual(Object.keys(homeGuideLabel).sort(),[...supportedLocaleCodes].sort());
  for(const code of supportedLocaleCodes) for(const label of Object.values(homeNavigation[code])) assert.ok(label.length>1);
  assert.equal(homeNavigation.ko.curriculum,'학습 과정');
  assert.equal(homeNavigation.en.curriculum,'Curriculum');
  assert.equal(homeNavigation.ja.community,'コミュニティ');
  assert.equal(homeNavigation.es.community,'Comunidad');
});

test('community is always discoverable in the primary header and existing callbacks stay wired',async()=>{
  const source=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
  const header=source.slice(source.indexOf('<header className={`topbar'),source.indexOf('</header>'));
  assert.match(header,/<a href="#learn">\{homeNavigation\[locale\]\.curriculum\}/);
  assert.match(header,/<Link href="\/community" className="header-community-link">\{homeNavigation\[locale\]\.community\}/);
  assert.match(header,/onClick=\{\(\) => setSoundMenuOpen/);
  assert.match(header,/onChange=\{\(event\) => chooseInterfaceLocale/);
  assert.match(header,/onClick=\{toggleThemeMode\}/);
  assert.match(header,/onClick=\{\(\) => setKeyboardModalOpen\(true\)\}/);
  assert.doesNotMatch(header,/style=\{\{ padding: "6px 12px"/);
});

test('refined controls share one geometry and narrow-screen navigation remains visible',async()=>{
  const css=await readFile(new URL('../app/home-header.module.css',import.meta.url),'utf8');
  assert.match(css,/:is\(:global\(\.sound-menu-trigger\), :global\(\.language-picker\), :global\(\.theme-toggle-btn\), :global\(\.keyboard-setup-btn\)\) \{[^}]*height: 100% !important;[^}]*min-height: 32px !important;[^}]*border-radius: 10px !important;/s);
  assert.match(css,/:global\(\.nav-links\) \{[^}]*display: flex !important;/s);
  assert.match(css,/@media \(max-width: 1280px\)[\s\S]*grid-column: 1 \/ -1/);
  assert.match(css,/@media \(max-width: 680px\)[\s\S]*grid-template-rows: repeat\(2, minmax\(42px, 1fr\)\)/);
  assert.doesNotMatch(css,/display:\s*none|\.hero|\.practice|\.admin/);
});

test('settings use two aligned rows with dropdowns below actions and matching keyboard focus order',async()=>{
  const [css,source]=await Promise.all([
    readFile(new URL('../app/home-header.module.css',import.meta.url),'utf8'),
    readFile(new URL('../app/page.tsx',import.meta.url),'utf8'),
  ]);
  const tools=source.slice(source.indexOf('<div className="header-tools">'),source.indexOf('</header>'));
  assert.ok(tools.indexOf('className="theme-toggle-btn"')<tools.indexOf('className="button button-secondary keyboard-setup-btn"'));
  assert.ok(tools.indexOf('className="button button-secondary keyboard-setup-btn"')<tools.indexOf('className="sound-menu"'));
  assert.ok(tools.indexOf('className="sound-menu"')<tools.indexOf('className={`language-picker'));
  assert.match(css,/grid-template-areas: "theme keyboard" "sound language"/);
  assert.match(css,/:global\(\.header-navigation\) \{[^}]*align-self: stretch;/s);
  assert.match(css,/:global\(\.header-tools\) \{[^}]*align-self: stretch;/s);
  assert.match(css,/var\(--purple\) 4%, var\(--paper\)/);
});

test('header icons are light inline vectors and keep their inherited color and decorative semantics',async()=>{
  const source=await readFile(new URL('../app/HomeHeaderIcon.tsx',import.meta.url),'utf8');
  assert.match(source,/stroke="currentColor"/);
  assert.match(source,/aria-hidden="true" focusable="false"/);
  assert.doesNotMatch(source,/useEffect|fetch\(|Image|three|canvas|animation\s*[:=]/);
});

test('selected language stays centered in the button with symmetric icon and caret space',async()=>{
  const css=await readFile(new URL('../app/home-header.module.css',import.meta.url),'utf8');
  assert.match(css,/:global\(\.language-picker\) \{[^}]*justify-content: center !important;[^}]*padding-inline: 32px !important;/s);
  assert.match(css,/:global\(\.language-picker\) > select \{[^}]*text-align: center !important;[^}]*text-align-last: center !important;/s);
  assert.doesNotMatch(css,/padding-inline: 32px 25px/);
});

test('native language select covers the whole control including caret and icon without extra click handlers',async()=>{
  const [css,source]=await Promise.all([
    readFile(new URL('../app/home-header.module.css',import.meta.url),'utf8'),
    readFile(new URL('../app/page.tsx',import.meta.url),'utf8'),
  ]);
  assert.match(css,/:global\(\.language-picker\) > select \{[^}]*position: absolute !important;[^}]*inset: 0;[^}]*width: 100% !important;[^}]*height: 100% !important;[^}]*padding-inline: 32px !important;/s);
  assert.match(css,/:global\(\.language-picker\) > select \{[^}]*border-radius: 0 !important;/s);
  assert.match(css,/:global\(\.language-picker\) > svg \{[^}]*pointer-events: none;/s);
  const picker=source.slice(source.indexOf('<label className={`language-picker'),source.indexOf('</label>',source.indexOf('<label className={`language-picker')));
  assert.doesNotMatch(picker,/onClick|showPicker|dispatchEvent/);
  assert.match(picker,/onChange=\{\(event\) => chooseInterfaceLocale/);
});
