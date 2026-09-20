import assert from "node:assert/strict";
import test from "node:test";

import { hangulNameOffer, toHangulName } from "../app/hangul-name.ts";

/* These are people's names. A wrong one is not a cosmetic bug — it is the site
 * telling somebody their name is something it is not — so the rules that were
 * found to be wrong are pinned here rather than left to be rediscovered. */

test("reads a plain Latin name the way Korean says it", () => {
  assert.equal(toHangulName("Ana Silva"), "아나 실바");
  assert.equal(toHangulName("John Smith"), "존 스미스");
  assert.equal(toHangulName("Elena Petrova"), "엘레나 페트로바");
});

test("u is 우, not 어", () => {
  // ㅓ is the English "sun" vowel. Almost every visitor whose name is not
  // English says ㅜ, and the English names that do not are in the lexicon.
  assert.equal(toHangulName("Lucas"), "루카스");
  assert.equal(toHangulName("Bruno"), "브루노");
  assert.equal(toHangulName("Ekaterina"), "에카테리나");
  /* "Jakub" and "Thu" used to be asserted here as 자쿠브 and 수. Both were
     wrong — Czech reads Jakub 야쿠프 and Vietnamese reads Thu 투 — which is
     exactly why they are now withheld rather than guessed at. */
  assert.equal(toHangulName("Jakub"), null);
  assert.equal(toHangulName("Thu"), null);
});

test("au is two sounds", () => {
  assert.equal(toHangulName("Paulo"), "파울로");
  assert.equal(toHangulName("Klaus"), "클라우스");
});

test("a doubled consonant is one sound", () => {
  assert.equal(toHangulName("Ferreira"), "페레이라");
  assert.equal(toHangulName("Rossi"), "로시");
});

test("a silent e lengthens the vowel but still lets the consonant close", () => {
  assert.equal(toHangulName("Vale"), "베일");
  assert.equal(toHangulName("Kane"), "케인");
});

test("l rides on the syllable before it, r does not", () => {
  assert.equal(toHangulName("Clara"), "클라라");
  assert.equal(toHangulName("Brown"), "브라운");
});

test("a w glide after a consonant takes its own syllable", () => {
  assert.equal(toHangulName("Suswara"), "수스와라");
  assert.equal(toHangulName("Gwen"), "그웬");
});

test("known spellings win over the rules", () => {
  assert.equal(toHangulName("Michael"), "마이클");
  assert.equal(toHangulName("Thomas"), "토마스");
  assert.equal(toHangulName("Nguyen"), "응우옌");
});

test("declines rather than guessing at a script it cannot read", () => {
  assert.equal(toHangulName("田中ゆき"), null);
  assert.equal(toHangulName("Ελένη"), null);
  assert.equal(toHangulName("محمد"), null);
  // Already Hangul: there is nothing to tell them.
  assert.equal(toHangulName("김유민"), null);
  assert.equal(toHangulName("   "), null);
});

test("never offers the card to a Korean member", () => {
  // Already Hangul — there is nothing to tell them.
  assert.equal(hangulNameOffer({ fullName: "김유민" }), null);
  // Romanised, but the account says Korea: their name is 김유민, not 유민 킴.
  assert.equal(hangulNameOffer({ fullName: "Yumin Kim", country: "KR" }), null);
  assert.equal(hangulNameOffer({ fullName: "Yumin Kim", country: "kr" }), null);
  // Reading the site in Korean is the same signal.
  assert.equal(hangulNameOffer({ fullName: "Yumin Kim", locale: "ko" }), null);
  // Everyone else is offered it.
  assert.deepEqual(
    hangulNameOffer({ fullName: "Ana Silva", country: "BR", locale: "pt-BR" }),
    { hangul: "아나 실바", original: "Ana Silva" },
  );
});

test("x is /ks/, not just k", () => {
  // 알레칸드라 was being shown to people called Alexandra.
  assert.equal(toHangulName("Alexandra"), "알렉산드라");
  assert.equal(toHangulName("Alex"), "알렉스");
  assert.equal(toHangulName("Felix"), "펠릭스");
});

test("a word-final g is hard", () => {
  // "".includes("") is true, so the soft-g test fired at the end of every word
  // and Prog came out 프로지.
  assert.equal(toHangulName("Prog"), "프로그");
  assert.equal(toHangulName("Greg"), "그레그");
  assert.equal(toHangulName("Craig"), "크레이그");
  // Soft g before a vowel still works.
  assert.equal(toHangulName("Giovanni"), "지오반니");
});

test("r before a consonant is its own syllable", () => {
  assert.equal(toHangulName("Marco"), "마르코");
  assert.equal(toHangulName("Carlos"), "카를로스");
  assert.equal(toHangulName("Fernando"), "페르난도");
  // A word-final r still closes the syllable.
  assert.equal(toHangulName("Peter"), "피터");
  assert.equal(toHangulName("Miller"), "밀러");
});

test("withholds a name whose reading depends on a language we do not know", () => {
  // Every one of these was being shown, and every one was wrong: 조우르그 for
  // Jorge, 필 for Pierre, 구일라움 for Guillaume.
  for (const name of ["Jorge", "Jose", "Jean", "Joao", "Pierre", "Antoine",
                      "Guillaume", "Xavier", "Katarzyna", "Wojciech", "Bjorn",
                      "Mehmet", "Siobhan", "Aditya", "Jakub Mařík"]) {
    assert.equal(toHangulName(name), null, `${name} should be withheld`);
  }
  // One uncertain word withholds the whole name, not just that word.
  assert.equal(toHangulName("Ana Jorge"), null);
});

test("still shows the names it can actually read", () => {
  assert.equal(toHangulName("Ana Silva"), "아나 실바");
  assert.equal(toHangulName("Klaus Bauer"), "클라우스 바우어");
  assert.equal(toHangulName("Ekaterina"), "에카테리나");
  // Hand-checked spellings stay exempt from the gate.
  assert.equal(toHangulName("Juan"), "후안");
  assert.equal(toHangulName("Thomas"), "토마스");
});
