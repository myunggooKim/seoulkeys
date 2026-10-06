# Seoul Keys — 작업 인계 문서

> **2026-10-06 GitHub 인계 업데이트:** 저장소는 `https://github.com/myunggooKim/seoulkeys`, 기본 브랜치는 `main`입니다.
> 최신 학습 안내 번역·커뮤니티·좋아요·헤더·애드센스 확인 코드·게임 화면 변경을 함께 보관합니다.
> 아래 8월·9월 기록과 과거 감사 파일의 미배포·테스트 실패·GitHub 없음 표시는 당시 기록입니다.
> 워커 이름은 **`hangeul-pop`**, 운영 주소는 `https://seoulkeys.com`, D1은 기존 `hangeul-pop-db`입니다.
> 마지막으로 직접 확인한 좋아요 운영 배포는 10월 5일 버전 `f7b781dc-4679-46ec-9081-9664f46b749d`입니다. 이후 다른 작업의 배포 여부는 별도로 확인해야 합니다.
> 이번 작업은 커밋·푸시이며 운영 재배포·애드센스 신청·AI 호출·원격 DB 초기화를 하지 않습니다.
> 새 기기: Node.js 22.13 이상 → `npm ci` → `npm run typecheck` → `npm test`. 기존 작업이 있으면 `git status`를 확인한 뒤 pull하세요.
> 보존 회귀 테스트의 임시 폴더 의존은 `tests/fixtures/community-preservation.json`으로 대체했습니다. 원래 스냅샷과 SHA-256 일치를 확인했으며 비교 범위를 줄이지 않았습니다.
> `.dev.vars`와 Cloudflare/GitHub 인증 정보는 제외됩니다. 새 기기에서 따로 로그인·설정하고 기존 운영 시크릿과 DB 연결을 유지하세요.

> 새 세션에서는 이 파일을 먼저 읽으세요.
> 마지막 갱신: 2026-08-08 (3차) / 배포 버전 `bf8cb41d` — **작업 트리 = 라이브. 미배포 변경 없음.**

> ### 배포 상태를 추측하지 말고 확인하세요
> 이 줄에 "미배포"라고 적혀 있었는데 실제로는 배포가 끝나 있어서, 다음 세션이
> 배포해도 되는지 한참 헤맸습니다. 커밋되지 않은 파일이 많다고 해서
> 미배포라는 뜻이 아닙니다 — **이 저장소는 git을 거치지 않고 로컬에서
> 바로 `wrangler deploy` 합니다.** 확인법:
> ```bash
> npx wrangler deployments list --config dist/server/wrangler.deploy.json | grep Created | tail -3
> git status --porcelain | grep "^ M" | awk '{print $2}' | xargs stat -c '%y %n' | sort -r | head -3
> ```
> 마지막 배포 시각이 가장 최근 파일 수정 시각보다 뒤면 작업 트리가 라이브입니다.
> 결정적인 확인은 라이브 HTML에서 로컬에만 있는 변경을 찾아보는 것입니다.

## 프로젝트 기본

| 항목 | 값 |
|---|---|
| 소스 | `F:\재즈\video-streaming-server\hangul-spark` |
| 운영 주소 | https://seoulkeys.com (+ www) |
| 배포 | `npm run deploy` (빌드 → `prepare-deploy-config` → `wrangler deploy`) |
| 워커 이름 | `hangeul-pop` |
| GitHub | https://github.com/myunggooKim/seoulkeys — `main` |
| DB | Cloudflare D1 `hangeul-pop-db` |
| 지원 언어 | 33개 (`app/locale-detection.ts`의 `Locale` 타입) |

> **폴더 이름에 속지 마세요.** 폴더는 `hangul-spark`, D1은 `hangeul-pop-db`인데
> 이건 옛 이름(Hangeul Pop)이 남은 것입니다. 프로젝트·워커·도메인은 전부
> `seoulkeys`입니다. **hangul-spark = 서울키즈, 같은 프로젝트입니다.**
> D1 이름은 바꾸면 연결이 끊기니 그대로 두세요.

> **PowerShell 5.1에서는 `&&`가 안 됩니다.** `cd ...; npm run deploy` 처럼
> 세미콜론으로 쓰세요. 사장님 터미널이 Windows PowerShell입니다.

### 빌드 시 주의 — 반드시 지킬 것

1. **Vite 캐시가 CSS 변경을 먹습니다.** `app/globals.css`를 고쳤는데 배포본에 안 들어가는 일이 반복됐습니다.
   → CSS를 수정했으면 `rm -rf node_modules/.vite` 후 빌드하세요.
2. **Cloudflare 엣지 캐시가 옛 HTML을 내줍니다.** 배포 직후 확인은 `?nocache=<랜덤>` 을 붙이거나 하드 리로드.
3. **`public/` 에서 `_` 로 시작하는 파일은 배포되지 않습니다.** (Cloudflare가 특수 취급)
4. **사이트맵이 두 벌 있습니다.** `app/sitemap.xml/route.ts`(동적)와
   `public/sitemap.xml`(정적). 어느 쪽이 서빙될지 확신하지 말고 **둘 다 똑같이
   고치세요.** 한쪽만 고치면 옛 내용이 계속 나갈 수 있습니다.

---

## 검증 방법 — 이게 핵심입니다

과거 여러 번 "전 언어 통과"라고 잘못 보고했습니다. 원인은 **iframe에 로케일을 심고, 적용되기 전에 측정**한 것이었습니다. 반드시 아래처럼 로케일 일치를 확인한 뒤 측정하세요.

```js
// 브라우저 콘솔에서. iframe #__af 가 있다고 가정.
localStorage.setItem('hangeul-pop-locale', loc);
localStorage.setItem('hangeul-pop-locale-source', 'manual-v1');
await new Promise(r => { f.onload = () => r(); f.src = '/?L=' + loc + '&t=' + Date.now(); });
await new Promise(r => setTimeout(r, 650));
const d = f.contentDocument;
if (d.documentElement.lang !== loc) { /* 반드시 재시도하거나 실패 처리 */ }
```

UI 자동 검사기: **`https://seoulkeys.com/uiaudit.js`**
→ 로드 후 `__uiAudit()` 호출. 줄바꿈/겹침/화면이탈/컨트롤 크기 불일치/텍스트 잘림 5종 검사.
(`Range.getClientRects()`로 실제 줄 박스를 셉니다 — 박스 높이로 세면 고정 높이 버튼이 전부 오탐)

### 번역 커버리지 측정 — 측정 방식을 먼저 확인하세요

```bash
npx tsx scratchpad/dict-gap.mts            # 언어별 커버리지 (이게 기준)
npx tsx scratchpad/dict-gap.mts --keys     # 구멍 난 키 + 빠진 언어
npx tsx scratchpad/i18n-gap.mts            # tr(locale,"리터럴") 호출만 측정
npx tsx scratchpad/summary.mts             # ja 전용 배치 vs 공용 사전 분리 집계
```

**`i18n-gap.mts` 숫자를 커버리지로 보고하면 안 됩니다.** 이전 세션의 "82%"가
그 함정이었습니다. 실제 문구 상당수는

```tsx
tr(locale, activity.description, activity.descriptionKo)   // 변수 → 스캔에 안 걸림
```

처럼 **변수로** 넘어가서 리터럴 스캔에 잡히지 않습니다. `dict-gap.mts`는 사전
키를 직접 순회하므로 이 구멍이 없습니다.

또 하나: 번역문이 영어와 **철자가 같으면**(nl "Privacy", fil "RANK") 두 스크립트
모두 "빠짐"으로 셉니다. `--keys` 목록은 그 점을 감안해 읽으세요.

최종 확인은 브라우저 런타임 대조가 가장 정확합니다. en으로 한 번 렌더해
텍스트 노드를 모으고, 각 로케일 렌더와 교집합을 구하면 실제로 새는 영어가
그대로 나옵니다. (고유명사·엔도님·자판 이름은 제외)

---

## 남은 작업 (우선순위 순)

### 1. ~~일본어 전용 배치~~ — 완료. 번역 작업은 끝났습니다.

`jaDict`의 99개 키(십자말 단서·십자말 UI·내 학습 페이지)를 나머지 30개 언어로
채웠습니다. → `app/ui-i18n-rest.ts`

```bash
npx tsx scratchpad/summary.mts   # ja 전용 잔여 0
npx tsx scratchpad/dict-gap.mts  # 언어별 커버리지
```

**현재 상태**: 사전 키 514개, ja 전용 잔여 **0칸**, 14개 언어 100%,
나머지는 94~99.8%. 남은 98칸은 전부 **번역이 영어와 철자가 같은 단어**
(fil "RANK", nl "Privacy", "(Mac)", "CPM", de "STATUS" 등)라 추가할 것이 없습니다.

> `--keys` 목록에 이 단어들이 계속 뜨는 건 정상입니다. 측정기가 "번역==원문"을
> 구분하지 못할 뿐이며, 실제 누락이 아닙니다. 다시 채우려 하지 마세요.

### 2. ~~RTL 좌우 바뀜~~ — 확인 완료, 버그 아님

사장님이 지목한 두 언어를 특정했습니다. (이건 소스 기준이라 확실합니다)
- "중앙아시아 위에서 2번째" = **فارسی (fa, 페르시아어)** — `app/page.tsx`의 `Middle East & Central Asia` 그룹 2번째
- "남아시아 1개국" = **اردو (ur, 우르두어)** — `South Asia` 그룹에서 유일한 RTL

`rtlLocales = new Set(["ar","fa","ur"])` 이고 fa·ur는 원래 오른쪽→왼쪽 언어라
**화면이 좌우로 뒤집히는 것 자체는 정상 동작**입니다.

뒤집히면 안 되는 것도 **운영 배포본에서 `recalcLive: true` 확인 후 재측정**했습니다.

| 항목 | fa | ur |
|---|---|---|
| 자판 윗줄 순서 | `ㅂQ ㅈW ㄷE ㄱR ㅅT …` 좌→우 유지 | 동일 |
| `.keyboard-map` / `.practice-card` / `.meter-track` | 전부 `ltr` | 전부 `ltr` |
| 진행 막대 채움 방향 | 왼쪽부터(정상) | — |

→ **코드 수정 불필요.** 사장님께는 "정상 동작"으로 안내하면 됩니다.

부수적으로 발견해 고친 것: RTL에서 히어로 강조 바가 텍스트보다 **209px** 왼쪽으로
삐져나왔습니다. 줄바꿈을 허용한 뒤 `inline-block`이 available width로
shrink-to-fit 되면서 배경(`100%`)이 실제 글자보다 넓어진 것 → 비CJK 분기에
`display: inline` 적용. 209px → 16px(의도된 마커 여백).

> ### ⚠️ 측정 함정 — `getComputedStyle`이 거짓말합니다
> **Browser 창이 화면에 표시돼 있지 않으면 렌더러가 스타일 재계산을 멈춥니다.**
> `getComputedStyle`은 첫 페인트 값을 그대로 돌려주고, 그 뒤 어떤 변화도
> 반영하지 않습니다. 숨겨진 iframe도 같습니다.
>
> 확인법 — 재기 전에 이 sanity check를 먼저 돌리세요:
> ```js
> const before = getComputedStyle(el).color;
> el.style.color = 'rgb(1, 2, 3)';
> await new Promise(r => setTimeout(r, 150));
> if (getComputedStyle(el).color === before) throw new Error('재계산 멈춤 — 창을 띄우세요');
> ```
> 이 함정에 걸리면 전 언어가 **똑같은 값**으로 나옵니다(예: font-size가 33개
> 언어 모두 `14.0135px`). "전 언어 동일" 결과가 나오면 버그가 아니라 측정 실패를
> 먼저 의심하세요.
>
> 영향 없는 것: `textContent`·DOM 구조·`document.styleSheets` 규칙 파싱은
> 레이아웃과 무관해서 창이 숨겨져 있어도 정확합니다. (번역 검증은 유효)
>
> **해결책 — 사장님 실제 Chrome을 쓰세요.** `mcp__claude-in-chrome__*` 도구가
> 붙어 있습니다. 탭이 백그라운드면 `visibilityState: "hidden"`이라 똑같이 멈추는데,
> **스크린샷을 한 번 찍으면 렌더러가 깨어나서** 그 뒤 측정값이 정상이 됩니다.
> 순서: `navigate` → `computer{screenshot}` → sanity check → 측정.

### 3. ~~선생님 대시보드 흰 글씨~~ — 해결·검증 완료

리포트는 "흰 글씨"였지만 실제 원인은 **라이트 모드의 저대비**였습니다. 다크 모드는
처음부터 문제가 없었습니다(이전 세션의 `--edge`/`--on-accent` 분리 작업 덕분).

브랜드 파랑 `#58a6ff`와 브랜드 핑크 `#ff4d8d`를 흰 카드 위 **텍스트**로 쓴 것이
원인입니다. 배경으로 쓸 땐 괜찮지만 글자색으로는 WCAG AA(4.5:1) 미달입니다.

| 대상 | 수정 전 | 수정 후 |
|---|---|---|
| 초대 코드 `SK-…` | 2.41 | **5.62** |
| `CLASS` 라벨 | 2.53 | **5.88** |
| `샘플 예시:` | 2.53 | **5.88** |
| `🗑️ 클래스 삭제` | 3.14 | **5.87** |

**수정**: 테마별 텍스트 토큰 2개를 새로 만들었습니다.
- `--info` — 라이트 `#1462c4` / 다크 `#58a6ff`
- `--danger-ink` — 라이트 `#c2185b` / 다크 `#ff5f9a`

`app/teacher/page.tsx`의 **글자색 3곳 + 삭제 버튼 1곳**만 토큰으로 교체했고,
배경 용도(218행 브랜드 마크, 348행 카테고리 배지)는 브랜드 색 그대로 뒀습니다.

**검증** (Version `7c5c08ba`): 라이트·다크 양쪽 전체 스윕에서 **AA 미달 0건**.

> ### ⚠️ 테마 토글 직후에 재지 마세요
> 토글 클릭 후 500ms에 쟀더니 헤더가 `rgb(15,23,42)`(라이트 잉크)로 나와서
> "대비 1.13, 안 보임"이라는 **가짜 실패 4건**이 잡혔습니다. 스크린샷을 보니
> 멀쩡했습니다. 토글 후에는 600ms 이상 기다리고 **sanity check를 통과시킨 뒤**
> 재세요. 위 표의 수치는 `recalcLive: true` 확인 후 잰 값입니다.

### 4. ~~텍스트 침범~~ — 해결·검증 완료

**원인**: `.headline-accent`와 히어로 `h1` 안의 클래스 없는 `<span>`에 걸린
`white-space: nowrap` + `word-break: keep-all`. CJK 기준으로 짜인 규칙인데,
같은 문장이 2~3배 긴 언어에서는 줄바꿈 기회가 아예 없어 `inline-block`이
내용 크기로 부풀어 컬럼 밖으로 그려졌습니다.

**측정값** (타밀어, 1920px, 운영 배포본):

| | 수정 전 | 수정 후 |
|---|---|---|
| 제목 글자 오른쪽 끝 | 949px | 613px |
| 자기 박스(703px) 초과 | **+246px** | -90px |
| 자리연습 카드(751px) 침범 | **+198px** | **-138px (여유)** |
| 줄 수 | 3 | 4 |

**수정**: `globals.css` — CJK가 아닌 언어에만 `word-break: normal` /
`overflow-wrap: anywhere` / `white-space: normal`. `.headline-accent`만이 아니라
`.hero-copy h1 span`까지 걸어야 합니다(첫 줄이 클래스 없는 span입니다).

**회귀 확인**: ko·ja·zh-Hans는 `nowrap` 그대로, ta·si·km·ar·fa·pl은 `normal`.
전 언어 넘침 음수.

### 4-1. 학습컨셉 칩 라벨 줄바꿈 — 해결·검증 완료

`ch` 단위 상한(`max-width: 9~13ch`)이 원인이었습니다. `ch`는 숫자 "0"의 폭이라
한글은 약 2배, 타밀어 단어는 그 이상이라 **여유가 충분한데도 상한이 먼저 걸렸습니다.**

측정: 887px 행에서 타밀어 칩 4개의 자연 너비 합계는 **643px** — 넘칠 일이 없는데
`"வாசிப்பு & அடிப்படை"`가 `"வா…"`로 잘리고 있었습니다.

**수정 3줄**
1. `.theme-chip b`에 `white-space: nowrap` 복구 (그래야 `text-overflow: ellipsis`가 동작)
2. 칩·라벨의 `ch` 상한 제거 → 내용 크기로 자람
3. `.theme-picker`에 `overflow-x: auto` (넘칠 때 잘려서 못 누르는 일 방지)

**검증**: ko 4개 칩 전부 1줄·잘림 없음, ta 4개 전부 1줄·잘림 없음.
좁은 카드(380px) 회귀 확인 — `overflow-x`를 `hidden`(원래값)/`auto`(수정값)로
바꿔가며 재보니 기하값이 완전히 동일했고, 마지막 칩이 카드 오른쪽 경계 안쪽
2px에 있어 밖으로 새지 않습니다.

> **교훈: 칩·버튼 라벨에 `ch` 단위 `max-width`를 쓰지 마세요.** 한글·CJK·인도계에서
> 전부 어긋납니다. 내용 크기로 두고 컨테이너 쪽에서 넘침을 처리하세요.

### 4-2. 학습컨셉 / 진행방식 두 그룹 겹침 — 해결·검증 완료

사장님 리포트: "다른 나라에서는 대부분 겹쳐서 버튼이 안 보인다."

**실제로는 겹침이 아니라 '스크롤에 숨겨짐'이었습니다.** `.theme-picker-row`가
`overflow-x: auto` + `scrollbar-width: none` 이라, 넘친 칩이 잘린 채 **스크롤바도
없어 존재 자체를 알 수 없었습니다.** 타밀어 측정: `scrollWidth 661px /
clientWidth 320px` → 4개 중 2개만 보임.

원인은 9022행의 `flex-wrap: nowrap`. 한 줄에 필요한 폭이
`학습컨셉 661 + 라벨 48 + 진행방식 501 + gap ≈ 1220px`인데 행은 **887px**입니다.
**한 줄로는 물리적으로 불가능**한데 nowrap을 강제해서 눌린 쪽이 숨겨졌습니다.

**수정**: `.practice-choice-row`를 `flex-wrap: wrap`으로. `wrap`은 들어가면 한 줄을
유지하고 안 들어갈 때만 두 줄이 되므로, 한국어는 그대로 한 줄입니다.
`.theme-picker`의 `overflow: hidden`도 `visible`로 (자리가 생기면 가릴 이유 없음).

**운영 배포본 검증** (Version `ba749499`):

| 언어 | 행 높이 | 숨겨진 버튼 | 스크롤 필요 |
|---|---|---|---|
| ko | 28px (1줄) | 0 | 아니오 |
| ta | 66px (2줄) | 0 | 아니오 |
| de | 66px (2줄) | 0 | 아니오 |

> **주의**: 이전 세션이 "학습컨셉/진행방식 2줄"을 버그로 보고 nowrap을 강제했는데,
> 그게 이번 "버튼 안 보임"의 원인이었습니다. **두 줄은 버그가 아니라 정상 동작**입니다 —
> 버튼을 숨기는 것보다 낫습니다. 다시 nowrap으로 되돌리지 마세요.

### 4-3. 헤더 겹침 (브랜드·메뉴·도구) — 해결·검증 완료

타밀어에서 브랜드명에 메뉴가 붙고("Seoul Keysக") 로그아웃이 사운드 컨트롤 뒤로
들어가던 문제입니다.

**원인**: `.topbar`가 `grid-template-columns: auto minmax(0, 1fr) auto` 였습니다.
줄어들 수 있는 칸이 가운데(nav)뿐인데, `.nav-links`는 `white-space: nowrap` +
`justify-content: center` 라 **줄어드는 대신 양옆으로 넘칩니다.**

측정(타밀어·1920px): nav 내용 435px / 칸 373px → 왼쪽 62px가 브랜드 위로,
오른쪽 62px가 도구 영역으로. 세 그룹 합계 **1541px vs 헤더 1480px** — 61px 부족이라
어떤 칸 너비로도 해결 불가.

**수정**: grid → `display: flex; flex-wrap: wrap` + `.nav-links { min-width: max-content }`.
`max-content` 덕분에 nav가 내용보다 좁아질 수 없고, 세 그룹이 안 들어가면 도구가
둘째 줄로 내려갑니다.

**운영 검증** (Version `25525eb2`):

| 언어 | 헤더 높이 | 메뉴 링크 | 넘침 | 겹침 |
|---|---|---|---|---|
| ko | 88px (1줄) | 4개 전부 | 없음 | 0px |
| ta | 130px (2줄) | 4개 전부 | 없음 | 0px |

> ### ⚠️ dev 서버 함정 (CSS 고칠 때 매번 걸립니다)
> 1. CSS를 고치면 HMR이 **안 물어옵니다.** `rm -rf node_modules/.vite` 후 서버 재시작.
> 2. 그런데 캐시를 지우면 브라우저가 옛 `react.js?v=…`를 캐시에서 꺼내 쓰면서
>    `Cannot read properties of null (reading 'useContext')` 런타임 에러가 납니다.
>    → **Ctrl+Shift+R 하드 리로드**하면 해결됩니다. 일반 새로고침으로는 계속 납니다.
> 3. 규칙이 실제로 도착했는지는 이렇게 확인하세요:
>    ```js
>    let ok=false; const walk=rs=>{for(const r of rs){if(r.selectorText&&/내선택자/.test(r.selectorText))ok=true; if(r.cssRules)walk(r.cssRules);}};
>    for(const s of document.styleSheets){try{walk(s.cssRules)}catch(e){}} ok
>    ```

### 5. ~~`npm test` 4개 실패~~ — 해결 (17/17 통과)

전부 **소스가 바뀐 뒤 테스트만 안 고친** 낡은 단정문이었습니다.

| 테스트 | 원인 | 조치 |
|---|---|---|
| `lesson-evaluation.test.mjs` | `./hangul-keyboard` 확장자 없는 import를 node ESM이 못 찾음 | 러너를 `tsx --test`로 교체 (`tsx`를 devDependency로 명시) |
| 커리큘럼 | `"ㅁㄴㅁㄴ ㅁㄴㅁㄴ"` 등 4개 문자열이 개편으로 사라짐 | 현재 드릴 문자열로 교체 |
| 손 애니메이션 | `.hero-copy h1 { overflow: hidden; max-height: 310px }` — **버그를 지키던 단정문** | `overflow: visible; max-height: none` 로 반전 |
| 낙하 단어 | `CITY DESTROYED · MISSION FAILED` 문구 변경 | `Mission Failed — City Destroyed` |

### 6. ~~타밀어 설명글 잘림~~ — 재현 안 됨, 버그 아님

운영 배포본에서 `recalcLive: true` 확인 후 재보니 **언어 티어가 정상 작동**합니다.
타밀어 `13.31px`(= `1.5cqi`, 타밀 전용 티어), 한국어 `21.73px`(= `2.45cqi`, CJK 티어).
기본 티어라면 17px이어야 하므로 각자 자기 티어를 타고 있습니다.
말줄임(`scrollWidth > clientWidth`)도 발생하지 않았습니다.

아래는 폐기된 오진의 기록입니다 — 같은 실수를 반복하지 않도록 남겨둡니다.

#### (폐기) 앞선 진단이 틀렸던 이유

인계문서에 있던 "CJK·인도계 전용 규칙이 매칭되지 않음"은 **위 측정 함정 때문에
나온 오진**이었습니다. 정적으로 확인한 사실은 이렇습니다.

- 운영 CSS(`/assets/index-HVP2H3a-.css`)에 언어 티어 규칙이 **정상적으로 존재**합니다.
  `html[lang="ta"] … { font-size: clamp(11px, 1.5cqi, 14px) }` — 선택자 문자코드까지
  확인했고 이스케이프 깨짐 없습니다(백슬래시 0개).
- 선택자 특이성·순서상 기본 티어(`clamp(12px, 1.95cqi, 17px)`)보다 뒤에 있고 더
  구체적이라 정상적으로 이겨야 합니다.

→ 즉 "규칙이 없다/안 먹는다"는 근거가 없습니다. 창을 띄우고 실제 렌더에서
`font-size`와 `scrollWidth > clientWidth`(말줄임 발생 여부)를 다시 재세요.
좁은 화면(모바일 폭)에서 재현될 가능성이 높습니다 — 데스크톱 1280px에서는
말줄임이 관측되지 않았습니다.

관련 CSS: `globals.css`의 `.practice-card h2.practice-instruction` 3개 블록.

### 7. ~~검색 색인 안 됨 (중복 11개)~~ — 해결·배포·검증 완료 (2026-08-08)

GSC 색인 리포트: **색인 6개 / 미색인 14개, 그중 11개가 "사용자가 선택한 표준이
없는 중복 페이지"**.

**원인은 두 개가 겹친 것입니다.**

1. **로케일이 서버에서 전혀 반영되지 않습니다.** 언어는 클라이언트에서만
   결정됩니다(localStorage → 브라우저 → 접속국가). `?lang=ko`·`?lang=ja` 같은
   쿼리는 **서버 코드 어디에서도 읽지 않습니다.** 확인:
   ```bash
   for l in "" "?lang=ko" "?lang=ja"; do curl -s "https://seoulkeys.com/$l" | grep -o '<html lang="[^"]*"'; done
   # 전부 lang="en" — 바이트 단위로 동일한 문서입니다
   ```
2. **그런데 사이트맵이 그 10개 주소를 hreflang 대체 페이지라고 신고**하고
   있었습니다. canonical도 없어서 구글이 정본을 고를 근거가 없었고, 결과적으로
   동일 문서 11벌이 "표준 없는 중복"으로 묶였습니다.

**수정**

| 파일 | 내용 |
|---|---|
| `app/layout.tsx` | canonical 기본값. `SITE_ORIGIN` 상수로 **운영 도메인 고정** |
| `app/legal`·`my`·`admin/page.tsx` | 각자 canonical (`admin`은 noindex,nofollow 추가) |
| `app/teacher/layout.tsx`·`app/join/layout.tsx` | **신규.** 두 page가 `"use client"`라 metadata를 못 내보내서 서버 레이아웃을 씌웠습니다 (`join`은 noindex) |
| `app/sitemap.xml/route.ts` + `public/sitemap.xml` | **가짜 hreflang 10개 제거**, 누락됐던 `/teacher` 추가 |

> canonical에 `metadataBase`(요청 호스트 기반)를 쓰면 안 됩니다. workers.dev
> 배포 URL로 접속했을 때 그 주소가 스스로를 정본이라 선언해서 seoulkeys.com과
> 경쟁하게 됩니다. 그래서 `SITE_ORIGIN`을 하드코딩했습니다.

> ### ⚠️ hreflang을 다시 넣지 마세요
> 서버가 로케일별로 **다른 문서를 렌더하기 전까지는** hreflang이 도움이 아니라
> 중복 신고입니다. 다국어 SEO를 하려면 먼저 `?lang=`(또는 `/ko/` 경로)을
> 서버에서 읽어 `<html lang>`·title·본문이 실제로 달라지게 만들어야 하고,
> 그 다음에 hreflang을 붙여야 합니다. 순서를 뒤집으면 이번 문제가 재발합니다.

**검증** (Version `bf8cb41d`, 라이브 + 캐시 우회)

```bash
for p in "/" "/?lang=ko" "/teacher" "/legal" "/my" "/join" "/admin"; do
  sep="?"; case "$p" in *\?*) sep="&";; esac
  printf "%-14s -> " "$p"
  curl -s "https://seoulkeys.com${p}${sep}nocache=$RANDOM" | grep -o '<link rel="canonical" href="[^"]*"'
done
```

`/?lang=*` 전부 `https://seoulkeys.com/` 로 수렴, 나머지는 각자 자기 주소.
사이트맵 4개 URL·hreflang 0개. 전 페이지 200, 0.48~0.65초. 구글이 같은 날
사이트맵을 성공적으로 재읽음(발견된 페이지 4개), `/teacher` 실시간 테스트에서
"사용자 선언 표준 URL = https://seoulkeys.com/teacher" 확인.

**검색엔진 등록 현황**

| 엔진 | 상태 |
|---|---|
| 구글 | 사이트맵 성공·4페이지. 소유확인 = DNS TXT `google-site-verification` |
| 빙 | 사이트맵 제출 (2026-08-08) |
| 네이버 | 사이트 등록 26.07.26, 사이트맵 제출 26.08.08. robots.txt에 Yeti 명시됨 |
| 다음 | 웹마스터 콘솔 자체가 없음. Daum·Daumoa 크롤링 정상 → **조치 불필요** |
| 얀덱스 | 소유확인 완료 (DNS TXT `yandex-verification: d26cab505e6033e3`, 계정 travels98) |

> **트래픽 기대치**: 이번 작업은 "유입을 늘린 것"이 아니라 **"유입을 막던 장애물을
> 치운 것"** 입니다. 실질 페이지가 4개뿐이라 검색 노출의 상한 자체가 낮습니다.
> 유입을 늘리려면 검색될 만한 페이지(자모 설명·두벌식 배열 안내·타자 팁 등)가
> 더 필요합니다. 사장님께 보고할 때 이 구분을 흐리지 마세요.

---

## 이번 세션에서 고친 것 (되돌리지 말 것)

| 문제 | 원인 | 위치 |
|---|---|---|
| 학습컨셉 칩 라벨 2줄 ("친구·대 / 화") | `.theme-chip b`에 `white-space: normal`(8388행)이 걸려 `text-overflow: ellipsis`가 무력화 → 말줄임 대신 접힘. 게다가 `max-width`가 `ch` 단위라 한글 글자폭을 절반으로 과소평가 | `globals.css` 칩 블록 |
| 커버리지 측정이 실제보다 후하게 나옴 | 리터럴 `tr()` 호출만 셈. 변수로 넘기는 문구와 비공개 `dict`가 통째로 누락 | `dict`/`jaDict` export + `scratchpad/dict-gap.mts` |
| 키보드 설치·문의·공유·가입·게임오버 영어 | 사전에 아예 없음 | `app/ui-i18n-setup.ts` (신규) |
| 손가락 안내·자판 패널·연습 지시문·여행 회화·활동 카드 영어 | 기존 사전이 주요 14개 언어만 담음 | `app/ui-i18n-fill.ts` (신규, 1,497칸) |
| 연속일 공유 문구가 전 언어 영어 | 템플릿 리터럴 보간이라 사전 키와 영원히 불일치 | `SocialShareButtons.tsx` → `{n}` 자리표시자 |
| 테마 토글·정확도 목표·선생님 배너 영어 | `tr()`을 안 거치고 인라인 하드코딩 | `page.tsx` 3곳 |
| 해외 방문자에게 한글이 □로 보임 | 웹폰트를 **하나도 로드하지 않음**. 폰트 이름만 나열 | `app/layout.tsx` Noto Sans KR 링크 |
| `/my` 흰 화면, 로그아웃 후 재로그인 | 서비스워커가 `/` 포함 전체를 캐시 우선 제공 | `public/sw.js` v2 |
| 자모 드릴 정확도 0% | 한글 IME 조합(`ㅁㅓ`→`머`)을 문자 단위로 비교 | `hangul-keyboard.ts`의 `comparableJamo` / `sameJamoSequence` |
| 다크모드가 단순 반전 | `--ink` 하나가 글자·테두리·그림자를 겸함 | `--edge` / `--shadow-ink` / `--on-accent` 분리 |
| 자리연습 창 아래 잘림 | `.hero { overflow: hidden }` + 작업영역이 1단으로 접힘 | `globals.css` |
| 커리큘럼 설명 영어 | 데이터에 ko/en만 존재 | `app/curriculum-i18n.ts` |
| 헤더 메뉴 줄바꿈·침범 | 사운드 묶음 522px, 언어선택 198px | `--control-h` 스케일 |
| 학습컨셉/진행방식 2줄 | 언어별 수치 튜닝 → 실패 | 행 `nowrap` + 칩 가로스크롤 + `overflow:hidden` |

---

## 사장님 작업 원칙

- **끝없이 이어지는 콘텐츠**가 최우선. 사용자가 그만둘 때까지 흐름이 끊기면 안 됨.
- **키보드 우선.** 마우스 없이 계속 사용 가능해야 함 (Esc → 확인 → Enter 식).
- 존댓말로 보고할 것.
- **추측으로 "고쳤다"고 말하지 말 것.** 측정값으로만 보고.
