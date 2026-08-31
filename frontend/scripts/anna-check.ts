/**
 * Статистика словаря Анны и проверка живых запросов.
 * Запуск: npx tsx scripts/anna-check.ts
 */
import { phraseStats } from "../app/lib/annaPhrases";
import { matchAnnaQuery, type AnnaLang } from "../app/lib/annaTalk";

const stats = phraseStats();
console.log("=== phrase counts ===");
console.log({ ru: stats.ru, tj: stats.tj, uz: stats.uz, ky: stats.ky, en: stats.en, total: stats.total });
console.log("=== by intent ===");
for (const [intent, langs] of Object.entries(stats.byIntent)) {
  console.log(intent, langs);
}

const cases: { lang: AnnaLang; text: string; expect: string }[] = [
  { lang: "ru", text: "найди билеты в дубай", expect: "find" },
  { lang: "ru", text: "другие даты подешевле", expect: "dates" },
  { lang: "ru", text: "следи за ценой", expect: "watch" },
  { lang: "ru", text: "хочу договориться с человеком", expect: "human" },
  { lang: "ru", text: "младенец с местом", expect: "passengers" },
  { lang: "ru", text: "абракадабра фоо", expect: "unknown" },

  { lang: "tj", text: "чипта ёбед лутфан", expect: "find" },
  { lang: "tj", text: "санаҳои дигар", expect: "dates" },
  { lang: "tj", text: "нархро пайгирӣ", expect: "watch" },
  { lang: "tj", text: "ба одам нависед", expect: "human" },
  { lang: "tj", text: "тифл бо ҷой", expect: "passengers" },
  { lang: "tj", text: "xyz123 номаълум", expect: "unknown" },

  { lang: "uz", text: "chipta toping iltimos", expect: "find" },
  { lang: "uz", text: "boshqa sanalar", expect: "dates" },
  { lang: "uz", text: "narxni kuzatib turing", expect: "watch" },
  { lang: "uz", text: "odam bilan gaplashmoqchiman", expect: "human" },
  { lang: "uz", text: "chaqaloq joy bilan", expect: "passengers" },
  { lang: "uz", text: "Kechirasiz, hozircha to‘liq tushunmadim", expect: "unknown" },

  { lang: "ky", text: "билеттерди тап", expect: "find" },
  { lang: "ky", text: "башка күндөр", expect: "dates" },
  { lang: "ky", text: "бааны көзөмөлдө", expect: "watch" },
  { lang: "ky", text: "адамга жаз", expect: "human" },
  { lang: "ky", text: "ымыркай орун менен", expect: "passengers" },
  { lang: "ky", text: "аааа бббб", expect: "unknown" },

  { lang: "en", text: "find me a flight to dubai", expect: "find" },
  { lang: "en", text: "other dates please", expect: "dates" },
  { lang: "en", text: "watch the price", expect: "watch" },
  { lang: "en", text: "talk to a person", expect: "human" },
  { lang: "en", text: "infant with seat", expect: "passengers" },
  { lang: "en", text: "asdf qwerty", expect: "unknown" },
];

console.log("\n=== query tests ===");
let failed = 0;
for (const c of cases) {
  const got = matchAnnaQuery(c.text, c.lang);
  const okIntent = got.intent === c.expect;
  const okLang = c.expect === "unknown" ? true : got.lang === c.lang;
  const okUnknownLang = c.expect !== "unknown" || got.lang === c.lang || got.lang === "en";
  const pass = okIntent && (c.expect === "unknown" ? got.lang === c.lang : okLang);
  if (!pass) failed += 1;
  console.log(
    `${pass ? "OK" : "FAIL"} [${c.lang}] "${c.text}" → ${got.lang}/${got.intent} (want ${c.lang}/${c.expect})`,
  );
  void okUnknownLang;
}

const langStay = matchAnnaQuery("zzzz", "uz");
console.log(`\nunknown keeps fallback: ${langStay.lang}/${langStay.intent} (want uz/unknown)`);
if (langStay.lang !== "uz" || langStay.intent !== "unknown") failed += 1;

const uzUnknown = matchAnnaQuery("Kechirasiz, hozircha to‘liq tushunmadim. Quyidagi amallardan birini tanlang yoki aniqroq yozing.", "ru");
console.log(`uz unknown from ru fallback: ${uzUnknown.lang}/${uzUnknown.intent}`);
if (uzUnknown.lang !== "uz" || uzUnknown.intent !== "unknown") failed += 1;

console.log(`\n${failed === 0 ? "ALL PASSED" : `FAILED: ${failed}`}`);
if (failed > 0) process.exit(1);
