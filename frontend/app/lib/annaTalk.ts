import { hasCities, paxTotal, type ChatRoute, type PinnedFlight } from "./chatRoute";
import { lookupAnnaPhrases, normAnnaText, type PhraseIntent, type PhraseLang } from "./annaPhrases";

export type AnnaLang = PhraseLang;
export type AnnaIntent = PhraseIntent | "unknown";

const MONTHS: Record<AnnaLang, string[]> = {
  ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  tj: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
  ky: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export function fmtAnnaDate(iso: string, lang: AnnaLang): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[lang][Number(m) - 1]}`;
}

export function annaRouteTitle(r: ChatRoute | null, lang: AnnaLang): string {
  if (!r || (!r.fromIata && !r.toIata)) return COPY[lang].noRoute;
  const from = r.fromCity || r.fromIata || "…";
  const to = r.toCity || r.toIata || "…";
  if (!r.fromIata || !r.toIata) return `${from} → ${to}`;
  const bits = [`${from} → ${to}`];
  if (r.date) bits.push(fmtAnnaDate(r.date, lang) + (r.returnDate ? ` — ${fmtAnnaDate(r.returnDate, lang)}` : ""));
  const n = paxTotal(r);
  if (n > 0) bits.push(`${n} ${COPY[lang].paxShort}`);
  return bits.join(" · ");
}

function norm(s: string): string {
  return normAnnaText(s);
}

/** Служебные слова языка — не намерения. Нужны, когда фраза из словаря не попала. */
const LANG_HINTS: Record<AnnaLang, string[]> = {
  ru: ["что", "как", "мне", "это", "нужно", "привет", "пожалуйста", "можно ли", "не понял"],
  tj: ["мехоҳам", "лутфан", "ҳаст", "чипта", "салом", "нависед", "намефаҳмам"],
  uz: [
    "salom", "chipta", "iltimos", "bormi", "kerak", "kechirasiz", "hozircha", "tushun",
    "tushunmadim", "quyidagi", "tanlang", "yozing", "aniqroq", "so'rov", "yoki", "menga",
  ],
  ky: ["салам", "керек", "барбы", "өтүнөм", "жазыңыз", "түшүнгөн жок"],
  en: ["hello", "please", "the", "what", "how", "can you", "i don't", "sorry"],
};

const TINY_HELLO = new Set(["hi", "hey", "йо"]);

function scriptScores(t: string): Record<AnnaLang, number> {
  const scores: Record<AnnaLang, number> = { ru: 0, tj: 0, uz: 0, ky: 0, en: 0 };
  if (/[ғӣқӯҳҷ]/i.test(t)) scores.tj += 8;
  if (/[ңүө]/i.test(t)) scores.ky += 8;
  if (/ў/.test(t)) scores.uz += 6;
  if (/g'|o'|g‘|o‘|gʻ|oʻ/.test(t)) scores.uz += 5;
  (Object.keys(LANG_HINTS) as AnnaLang[]).forEach((lang) => {
    LANG_HINTS[lang].forEach((w) => {
      if (t.includes(w)) scores[lang] += 2;
    });
  });
  return scores;
}

function pickLang(scores: Record<AnnaLang, number>, fallback: AnnaLang, min = 2): AnnaLang {
  let best: AnnaLang = fallback;
  let bestScore = scores[fallback] ?? 0;
  (Object.keys(scores) as AnnaLang[]).forEach((lang) => {
    if (scores[lang] > bestScore) {
      bestScore = scores[lang];
      best = lang;
    }
  });
  return bestScore >= min ? best : fallback;
}

export function detectAnnaLang(text: string, fallback: AnnaLang): AnnaLang {
  return matchAnnaQuery(text, fallback).lang;
}

export function matchAnnaIntent(text: string, fallback: AnnaLang = "ru"): AnnaIntent {
  return matchAnnaQuery(text, fallback).intent;
}

export function matchAnnaQuery(text: string, fallback: AnnaLang): { intent: AnnaIntent; lang: AnnaLang } {
  const t = norm(text);
  if (!t) return { intent: "unknown", lang: fallback };

  const hits = lookupAnnaPhrases(t);
  const scripts = scriptScores(t);

  if (hits.length > 0) {
    const topLen = hits[0].len;
    const top = hits.filter((h) => h.len === topLen);
    const langScores: Record<AnnaLang, number> = { ru: 0, tj: 0, uz: 0, ky: 0, en: 0 };
    top.forEach((h) => {
      langScores[h.lang] += 4 + Math.min(h.len, 12);
    });
    (Object.keys(scripts) as AnnaLang[]).forEach((lang) => {
      langScores[lang] += scripts[lang];
    });
    if (langScores[fallback] > 0) langScores[fallback] += 1;
    const lang = pickLang(langScores, fallback, 1);
    const intentHit = top.find((h) => h.lang === lang) || top[0];
    return { intent: intentHit.intent, lang };
  }

  if (TINY_HELLO.has(t)) {
    return { intent: "hello", lang: t === "йо" ? (fallback === "ru" ? "ru" : fallback) : pickLang({ ...scripts, en: scripts.en + 3 }, fallback, 1) };
  }

  return { intent: "unknown", lang: pickLang(scripts, fallback, 2) };
}

type Copy = {
  noRoute: string;
  paxShort: string;
  statusRoute: string;
  statusSite: string;
  close: string;
  clear: string;
  switched: string;
  send: string;
  placeholder: string;
  cancel: string;
  watchTitle: string;
  watchPricePh: string;
  watchSubmit: string;
  watchSaving: string;
  humanTitle: string;
  humanPh: string;
  humanSubmit: string;
  humanSending: string;
  find: string;
  dates: string;
  watch: string;
  open: string;
  human: string;
  passengers: string;
  greetNone: string;
  greetRoute: (route: string) => string;
  continueRoute: string;
  needCities: string;
  needDate: string;
  findOk: string;
  datesNeedCities: string;
  datesEmpty: string;
  datesIntro: (date: string, price: string) => string;
  datesIntroNoSelected: string;
  datesFail: string;
  datePick: (date: string) => string;
  watchNeed: string;
  watchIntro: string;
  watchNeedEmail: string;
  watchNeedPrice: string;
  watchOk: (email: string, route: string, date: string, price: string) => string;
  watchFail: string;
  openNeed: string;
  openOk: (flight: string) => string;
  humanNeedLogin: string;
  humanNeedOrder: string;
  humanAsk: string;
  humanAskGuest: string;
  humanOk: (ref: string) => string;
  humanFail: string;
  baggage: string;
  refund: string;
  hello: (route: string) => string;
  thanks: string;
  unknown: string;
  sawFlight: (flight: string) => string;
};

const COPY: Record<AnnaLang, Copy> = {
  ru: {
    noRoute: "Маршрут не выбран",
    paxShort: "пасс",
    statusRoute: "Справка по маршруту",
    statusSite: "Справка по сайту",
    close: "Закрыть чат",
    clear: "Очистить",
    switched: "Дальше отвечаю на этом языке. Можно писать обычными фразами.",
    send: "Отправить",
    placeholder: "Напишите как обычно…",
    cancel: "Отмена",
    watchTitle: "Подписка на цену",
    watchPricePh: "Цена, ниже которой писать",
    watchSubmit: "Следить",
    watchSaving: "Сохраняем…",
    humanTitle: "Сообщение человеку",
    humanPh: "Коротко, что случилось…",
    humanSubmit: "Передать",
    humanSending: "Отправляем…",
    find: "Найти билеты",
    dates: "Другие даты",
    watch: "Следить за ценой",
    open: "Открыть рейс",
    human: "Написать человеку",
    greetNone: "Я Анна. Напишите обычной фразой — поищу билеты, другие даты из календаря или включу слежку за ценой. Сначала укажите откуда и куда на этом экране. Цены и тарифы не выдумываю.",
    greetRoute: (route) =>
      `Вижу ${route}. Пишите как удобно: другие даты из календаря, слежка за ценой или человек из поддержки. Рейсы и багаж не придумываю — только то, что уже есть на сайте.`,
    continueRoute: "Могу продолжить с этим маршрутом — напишите, что нужно.",
    needCities: "Нужны оба города в форме на экране. Я её не меняю — заполните откуда и куда, и повторите.",
    needDate: "Нет даты вылета. Напишите «другие даты» — если кэш знает дешёвые дни, подставлю один в тот же поиск.",
    findOk: "Открываю выдачу с параметрами с экрана. Поиск тот же, я его не подменяю.",
    datesNeedCities: "Сначала нужны город вылета и прилёта — тогда покажу дни с ценой из того же календаря.",
    datesEmpty: "По этому месяцу в кэше нет дневных цен. Это не значит, что рейсов нет — можно искать выбранную дату.",
    datesIntro: (date, price) =>
      `Выбранный день: ${date} · от ${price}. Ниже дни дешевле из того же календаря, если кэш их знает. Тап подставит дату в текущий поиск.`,
    datesIntroNoSelected: "Дни с ценой в кэше на этот месяц. Тап подставит дату в тот же поиск.",
    datesFail: "Календарь цен сейчас не ответил. Поиск и дата на экране не менялись.",
    datePick: (date) => `Ищу на ${date} — тот же поиск, только дата.`,
    watchNeed: "Чтобы следить за ценой, нужны маршрут и дата вылета на экране.",
    watchIntro: "Это та же подписка, что на выдаче: письмо, когда цена станет ниже указанной. Не гарантия билета.",
    watchNeedEmail: "Нужна почта — туда придёт письмо, если цена опустится.",
    watchNeedPrice: "Укажите порог больше нуля — ниже него придёт письмо.",
    watchOk: (email, route, date, price) =>
      `Готово: напишем на ${email}, если ${route} на ${date} станет дешевле ${price}.`,
    watchFail: "Не удалось сохранить подписку.",
    openNeed: "Рейс попадает в чат, когда вы открываете карточку на выдаче. Список я сама не выбираю.",
    openOk: (flight) => `Открываю ${flight}.`,
    humanNeedLogin: "Обращение к человеку идёт через кабинет. Войдите и откройте поездку — или оформите заявку. Переписку в этой вкладке сохраню.",
    humanNeedOrder: "Без заявки текущая поддержка тикет не создаёт. Оформите бронь или откройте поездку в кабинете.",
    humanAsk: "Допишите вопрос — уйдёт в поддержку по заявке вместе с маршрутом. Ответ на почту, не в это окно.",
    humanAskGuest: "Чтобы отправить через поддержку, нужны вход и заявка. Можете описать вопрос — оставлю в ленте.",
    humanOk: (ref) => `Передали по заявке ${ref}. Это не чат в реальном времени: ответ на почту, копия в кабинете.`,
    humanFail: "Не удалось отправить обращение.",
    baggage: "Нормы багажа в кэше часто неизвестны — на карточке будет «уточняется», если данных нет. Правила не выдумываю. Откройте рейс на выдаче или напишите человеку.",
    refund: "Возврат и обмен зависят от тарифа конкретного рейса. Если в карточке «уточняется» — я не подставляю ответ. Могу открыть рейс или передать человеку.",
    passengers: "На сайте четыре категории: взрослые 12+, дети 2–11, младенец без места до 2 лет и младенец с местом. Число меняется в форме на этом экране — я её не трогаю.",
    hello: (route) =>
      route
        ? `Здравствуйте. Сейчас на экране ${route}. Чем помочь — даты, цена, поиск или человек?`
        : "Здравствуйте. Укажите маршрут на экране или напишите, что нужно.",
    thanks: "Пожалуйста. Если ещё что-то по этому маршруту — напишите обычной фразой.",
    unknown: "Извините, сейчас запрос не до конца поняла. Выберите одно из действий ниже или напишите чуть точнее.",
    sawFlight: (flight) => `Вижу ${flight} с открытой карточки. Могу открыть оформление — рейс я сама не выбирала.`,
  },
  tj: {
    noRoute: "Масир интихоб нашудааст",
    paxShort: "мус",
    statusRoute: "Маълумот оид ба масир",
    statusSite: "Маълумот оид ба сомона",
    close: "Пӯшидани чат",
    clear: "Тоза кардан",
    switched: "Минбаъд ба ҳамин забон ҷавоб медиҳам. Озод нависед.",
    send: "Фиристодан",
    placeholder: "Чӣ тавре ки дар ҳаёт менависед…",
    cancel: "Бекор",
    watchTitle: "Пайгирии нарх",
    watchPricePh: "Нархе, ки аз он пасттар нависем",
    watchSubmit: "Пайгирӣ",
    watchSaving: "Нигоҳ медорем…",
    humanTitle: "Паём ба одам",
    humanPh: "Мухтасар нависед…",
    humanSubmit: "Супоридан",
    humanSending: "Мефиристем…",
    find: "Чипта ёфтан",
    dates: "Санаҳои дигар",
    watch: "Нархро пайгирӣ кардан",
    open: "Парвозро кушодан",
    human: "Ба одам навистан",
    greetNone: "Ман Анна. Бо ҷумлаи оддӣ нависед — чипта, санаҳои дигар аз тақвим ё пайгирии нарх. Аввал аз куҷо ва ба куҷо. Нарх ва тарифро тахмин намекунам.",
    greetRoute: (route) =>
      `${route}-ро мебинам. Озод нависед: санаҳои арзонтар аз тақвим, пайгирии нарх ё ба одам. Парвоз ва бағоҷро намесозам — танҳо он чи дар сомона ҳаст.`,
    continueRoute: "Бо ҳамин масир давом дода метавонам — нависед, чӣ лозим аст.",
    needCities: "Ҳар ду шаҳр дар форма лозим аст. Ман формаро намевазкунам — пур кунед ва такрор кунед.",
    needDate: "Санаи парвоз нест. «Санаҳои дигар» нависед — агар захира рӯзҳои арзон дошта бошад, ба ҳамон ҷустуҷӯ мегузорам.",
    findOk: "Натиҷаро бо параметрҳои экран мекушоям. Ҷустуҷӯ ҳамон аст.",
    datesNeedCities: "Аввал шаҳри парвоз ва фуруд лозим — баъд рӯзҳоро аз ҳамон тақвим нишон медиҳам.",
    datesEmpty: "Барои ин моҳ дар захира нархи рӯзона нест. Ин маънои набудани парвоз нест.",
    datesIntro: (date, price) =>
      `Рӯзи интихобшуда: ${date} · аз ${price}. Поён рӯзҳои арзонтар аз ҳамон тақвим. Зарба санаро ба ҷустуҷӯ мегузорад.`,
    datesIntroNoSelected: "Рӯзҳо бо нарх дар захира. Зарба санаро ба ҳамон ҷустуҷӯ мегузорад.",
    datesFail: "Тақвими нарх ҷавоб надод. Ҷустуҷӯ ва сана тағйир наёфт.",
    datePick: (date) => `Барои ${date} меҷӯям — ҳамон ҷустуҷӯ, санаи дигар.`,
    watchNeed: "Барои пайгирии нарх масир ва санаи парвоз дар экран лозим аст.",
    watchIntro: "Ҳамон обунаи саҳифаи натиҷа: мактуб, вақте нарх аз ҳадди шумо пасттар шавад.",
    watchNeedEmail: "Почта лозим аст — мактуб ҳамон ҷо мерасад.",
    watchNeedPrice: "Ҳадди нархро зиёдтар аз сифр нависед.",
    watchOk: (email, route, date, price) =>
      `Тайёр: ба ${email} менависем, агар ${route} дар ${date} аз ${price} арзонтар шавад.`,
    watchFail: "Обуна захира нашуд.",
    openNeed: "Парвоз ба чат меояд, вақте корти парвозро дар натиҷа мекушоед. Ман рӯйхатро интихоб намекунам.",
    openOk: (flight) => `${flight}-ро мекушоям.`,
    humanNeedLogin: "Муроҷиат ба одам аз кабинет меравад. Ворид шавед ва сафарро кушоед. Гуфтугӯро дар ин ҷо нигоҳ медорам.",
    humanNeedOrder: "Бе дархост дастгирии ҳозира чипта намесозад. Дархост кунед ё сафарро дар кабинет кушоед.",
    humanAsk: "Саволро нависед — бо масир ба дастгирӣ меравад. Ҷавоб ба почта, на дар ин тиреза.",
    humanAskGuest: "Барои фиристодан вуруд ва дархост лозим. Метавонед саволро нависед — дар лента мемонад.",
    humanOk: (ref) => `Ба дархости ${ref} супоридем. Ин чати зинда нест: ҷавоб ба почта, нусха дар кабинет.`,
    humanFail: "Муроҷиат нарафт.",
    baggage: "Меъёри бағоҷ дар захира аксар вақт номаълум аст. Агар дар корт «уточняется» бошад, ман қоида намесозам. Парвозро кушоед ё ба одам нависед.",
    refund: "Бозгашт ва иваз аз тарифи ҳамон парвоз вобаста аст. Агар номаълум бошад — ҷавоб намегузорам. Парвозро кушода метавонам ё ба одам месупорам.",
    passengers: "Дар сомона чор гурӯҳ аст: калонсолон 12+, кӯдакон 2–11, тифл бе ҷой то 2 сол ва тифл бо ҷой. Шумораро дар формаи ҳамин экран иваз мекунанд — ман формаро намезанам.",
    hello: (route) =>
      route
        ? `Салом. Ҳозир дар экран ${route}. Сана, нарх, ҷустуҷӯ ё одам?`
        : "Салом. Масирро дар экран гузоред ё нависед, чӣ лозим аст.",
    thanks: "Хоҳиш мекунам. Агар боз чизе оид ба ҳамин масир бошад — озод нависед.",
    unknown: "Бубахшед, ҳозир дархостро пурра нафаҳмидам. Аз амалҳои поён якеро интихоб кунед ё аниқтар нависед.",
    sawFlight: (flight) => `${flight}-ро аз корти кушода мебинам. Ба расмият дароварда метавонам — ман парвозро интихоб накардам.`,
  },
  uz: {
    noRoute: "Marshrut tanlanmagan",
    paxShort: "yo‘l",
    statusRoute: "Marshrut bo‘yicha ma’lumot",
    statusSite: "Sayt bo‘yicha ma’lumot",
    close: "Chatni yopish",
    clear: "Tozalash",
    switched: "Endi shu tilda javob beraman. Oddiy yozing.",
    send: "Yuborish",
    placeholder: "Oddiy gap bilan yozing…",
    cancel: "Bekor",
    watchTitle: "Narxni kuzatish",
    watchPricePh: "Shu narxdan arzon bo‘lsa yozamiz",
    watchSubmit: "Kuzatish",
    watchSaving: "Saqlayapmiz…",
    humanTitle: "Odamga xabar",
    humanPh: "Qisqa yozing…",
    humanSubmit: "O‘tkazish",
    humanSending: "Yuboryapmiz…",
    find: "Chiptalarni topish",
    dates: "Boshqa sanalar",
    watch: "Narxni kuzatish",
    open: "Reysni ochish",
    human: "Odamga yozish",
    greetNone: "Men Anna. Oddiy yozing — chipta, taqvimdagi boshqa sanalar yoki narx kuzatuvi. Avval qayerdan va qayerga. Narx va tarifni o‘ylab topmayman.",
    greetRoute: (route) =>
      `${route} ni ko‘ryapman. Erkin yozing: arzonroq sanalar taqvimdan, narx kuzatuvi yoki odam. Reys va bagajni o‘ylab chiqarmayman — faqat saytdagi ma’lumot.`,
    continueRoute: "Shu marshrut bilan davom etaman — nima kerakligini yozing.",
    needCities: "Formada ikkala shahar ham kerak. Formani o‘zgartirmayman — to‘ldiring va qaytaring.",
    needDate: "Uchish sanasi yo‘q. «Boshqa sanalar» deb yozing — kesh arzon kunlarni bilsa, o‘sha qidiruvga qo‘yaman.",
    findOk: "Ekrandagi parametrlar bilan natijani ochaman. Qidiruv o‘sha-o‘sha.",
    datesNeedCities: "Avval uchish va qo‘nish shahri kerak — keyin o‘sha taqvimdagi kunlarni ko‘rsataman.",
    datesEmpty: "Bu oy uchun keshda kunlik narx yo‘q. Bu reys yo‘q degani emas.",
    datesIntro: (date, price) =>
      `Tanlangan kun: ${date} · ${price} dan. Pastda o‘sha taqvimdagi arzonroq kunlar. Bosilsa, sana joriy qidiruvga tushadi.`,
    datesIntroNoSelected: "Bu oydagi kesh narxlari. Bosilsa, sana o‘sha qidiruvga tushadi.",
    datesFail: "Narx taqvimi javob bermadi. Qidiruv va sana o‘zgarmadi.",
    datePick: (date) => `${date} uchun qidiraman — o‘sha qidiruv, boshqa sana.`,
    watchNeed: "Narxni kuzatish uchun ekranda marshrut va uchish sanasi kerak.",
    watchIntro: "Natijadagi o‘sha obuna: narx siz aytgan summadan arzon bo‘lsa, xat keladi.",
    watchNeedEmail: "Pochta kerak — xat shu yerga keladi.",
    watchNeedPrice: "Noldan katta chegara yozing.",
    watchOk: (email, route, date, price) =>
      `Tayyor: ${email} ga yozamiz, agar ${route} ${date} da ${price} dan arzon bo‘lsa.`,
    watchFail: "Obunani saqlab bo‘lmadi.",
    openNeed: "Reys chatga tushadi, kartochkani natijada ochganingizda. Ro‘yxatni o‘zim tanlamayman.",
    openOk: (flight) => `${flight} ni ochaman.`,
    humanNeedLogin: "Odamga murojaat kabinet orqali. Kiring va safarni oching. Suhbatni shu tabda saqlayman.",
    humanNeedOrder: "Arizasiz hozirgi yordam tiket ochmaydi. Bron qiling yoki kabinetda safarni oching.",
    humanAsk: "Savolni yozing — marshrut bilan yordamga ketadi. Javob pochtaga, bu oynaga emas.",
    humanAskGuest: "Yuborish uchun kirish va ariza kerak. Savolni yozishingiz mumkin — lentada qoladi.",
    humanOk: (ref) => `${ref} arizasiga o‘tkazdik. Bu jonli chat emas: javob pochtaga, nusxa kabinetda.`,
    humanFail: "Murojaat ketmadi.",
    baggage: "Bagaj me’yori keshda ko‘pincha noma’lum. Kartada «aniqlanadi» bo‘lsa, qoida to‘qimayman. Reysni oching yoki odamga yozing.",
    refund: "Qaytarish va almashtirish shu reys tarifiga bog‘liq. Noma’lum bo‘lsa, javob qo‘ymayman. Reysni ochaman yoki odamga o‘tkazaman.",
    passengers: "Saytda to‘rt toifa bor: kattalar 12+, bolalar 2–11, chaqaloq joysiz 2 yoshgacha va chaqaloq joy bilan. Sonni shu ekrandagi formadan o‘zgartirasiz — men formani tegmayman.",
    hello: (route) =>
      route
        ? `Salom. Hozir ekranda ${route}. Sana, narx, qidiruv yoki odam?`
        : "Salom. Ekranda marshrutni qo‘ying yoki nima kerakligini yozing.",
    thanks: "Arzimaydi. Shu marshrut bo‘yicha yana nima bo‘lsa — oddiy yozing.",
    unknown: "Kechirasiz, hozircha so‘rovni to‘liq tushunmadim. Quyidagi amallardan birini tanlang yoki aniqroq yozing.",
    sawFlight: (flight) => `Ochiq kartochkadagi ${flight} ni ko‘ryapman. Rasmiylashtirishni ochaman — reysni o‘zim tanlamadim.`,
  },
  ky: {
    noRoute: "Маршрут тандала элек",
    paxShort: "жүр",
    statusRoute: "Маршрут боюнча маалымат",
    statusSite: "Сайт боюнча маалымат",
    close: "Чатты жабуу",
    clear: "Тазалоо",
    switched: "Мындан ары ушул тилде жооп берем. Кадимкидей жазыңыз.",
    send: "Жөнөтүү",
    placeholder: "Кадимкидей жазыңыз…",
    cancel: "Жокко чыгаруу",
    watchTitle: "Бааны көзөмөлдөө",
    watchPricePh: "Ушул баадан арзан болсо жазабыз",
    watchSubmit: "Көзөмөлдөө",
    watchSaving: "Сактап жатабыз…",
    humanTitle: "Адамга билдирүү",
    humanPh: "Кыска жазыңыз…",
    humanSubmit: "Өткөрүү",
    humanSending: "Жөнөтүп жатабыз…",
    find: "Билеттерди табуу",
    dates: "Башка күндөр",
    watch: "Бааны көзөмөлдөө",
    open: "Каттамды ачуу",
    human: "Адамга жазуу",
    greetNone: "Мен Анна. Кадимки сүйлөм менен жазыңыз — билет, календардагы башка күндөр же баа көзөмөлү. Адегенде кайдан жана кайда. Баа менен тарифти ойлоп чыгарбайм.",
    greetRoute: (route) =>
      `${route} көрүнүп турат. Эркин жазыңыз: календардагы арзан күндөр, баа көзөмөлү же адам. Каттам менен багажды ойлоп чыгарбайм — сайттагыны гана.`,
    continueRoute: "Ушул маршрут менен улантам — эмне керек болсо жазыңыз.",
    needCities: "Формада эки шаар тең керек. Форманы өзгөртпөйм — толтуруп кайталаңыз.",
    needDate: "Учуу күнү жок. «Башка күндөр» деп жазыңыз — кэш арзан күндөрдү билсе, ошол издөөгө коём.",
    findOk: "Экрандагы параметрлер менен жыйынтыкты ачам. Издөө ошол эле.",
    datesNeedCities: "Адегенде учуу жана конуу шаары керек — анан ошол календардагы күндөрдү көрсөтөм.",
    datesEmpty: "Бул ай үчүн кэшде күндүк баа жок. Бул каттам жок дегенди билдирбейт.",
    datesIntro: (date, price) =>
      `Тандалган күн: ${date} · ${price} ден. Төмөндө ошол календардагы арзан күндөр. Бассаңыз, күн учурдагы издөөгө түшөт.`,
    datesIntroNoSelected: "Бу айдагы кэш баалары. Бассаңыз, күн ошол издөөгө түшөт.",
    datesFail: "Баа календары жооп берген жок. Издөө менен күн өзгөргөн жок.",
    datePick: (date) => `${date} үчүн издейм — ошол издөө, башка күн.`,
    watchNeed: "Бааны көзөмөлдөө үчүн экранда маршрут жана учуу күнү керек.",
    watchIntro: "Жыйынтыктагы ошол жазылуу: баа сиз айткан суммадан арзан болсо, кат келет.",
    watchNeedEmail: "Почта керек — кат ошол жакка келет.",
    watchNeedPrice: "Нөлдөн чоң чекти жазыңыз.",
    watchOk: (email, route, date, price) =>
      `Даяр: ${email} дарегине жазабыз, эгер ${route} ${date} күнү ${price} ден арзан болсо.`,
    watchFail: "Жазылуу сакталган жок.",
    openNeed: "Каттам чатка карточканы жыйынтыкта ачканыңызда кирет. Тизмени өзүм тандабайм.",
    openOk: (flight) => `${flight} ачам.`,
    humanNeedLogin: "Адамга кайрылуу кабинет аркылуу. Кирип сапарды ачыңыз. Сүйлөшүүнү бул салмакта сактайм.",
    humanNeedOrder: "Арызсыз азыркы колдоо билет ачпайт. Брондоңуз же кабинеттен сапарды ачыңыз.",
    humanAsk: "Суроону жазыңыз — маршрут менен колдоого кетет. Жооп почтага, бул терезеге эмес.",
    humanAskGuest: "Жөнөтүү үчүн кирүү жана арыз керек. Суроону жазсаңыз болот — лентада калат.",
    humanOk: (ref) => `${ref} арызына өткөрдүк. Бул тирүү чат эмес: жооп почтага, көчүрмө кабинетте.`,
    humanFail: "Кайрылуу кеткен жок.",
    baggage: "Багаж ченеми кэшде көп учурда белгисиз. Карточкада «уточняется» болсо, эреже ойлоп чыгарбайм. Каттамды ачыңыз же адамга жазыңыз.",
    refund: "Кайтаруу жана алмаштыруу ошол каттамдын тарифине жараша. Белгисиз болсо, жооп койбойм. Каттамды ачам же адамга өткөрөм.",
    passengers: "Сайтта төрт топ бар: чоңдор 12+, балдар 2–11, ымыркай орунсуз 2 жашка чейин жана ымыркай орун менен. Санды ушул экрандагы формадан өзгөртөсүз — мен форманы тийбейм.",
    hello: (route) =>
      route
        ? `Салам. Азыр экранда ${route}. Күн, баа, издөө же адам?`
        : "Салам. Экранга маршрут коюңуз же эмне керек болсо жазыңыз.",
    thanks: "Ордуңар. Ушул маршрут боюнча дагы бир нерсе болсо — кадимкидей жазыңыз.",
    unknown: "Кечиресиз, азыр сурамды толук түшүнгөн жокмун. Төмөнкү аракеттердин бирин тандаңыз же тактап жазыңыз.",
    sawFlight: (flight) => `Ачык карточкадагы ${flight} көрүнүп турат. Тапшырууну ачам — каттамды өзүм тандаган жокмун.`,
  },
  en: {
    noRoute: "No route selected",
    paxShort: "pax",
    statusRoute: "Help with this route",
    statusSite: "Site help",
    close: "Close chat",
    clear: "Clear",
    switched: "I’ll keep answering in this language. Write as you normally would.",
    send: "Send",
    placeholder: "Write as you normally would…",
    cancel: "Cancel",
    watchTitle: "Price alert",
    watchPricePh: "Write if the price drops below",
    watchSubmit: "Watch",
    watchSaving: "Saving…",
    humanTitle: "Message for a person",
    humanPh: "Briefly, what happened…",
    humanSubmit: "Send",
    humanSending: "Sending…",
    find: "Find tickets",
    dates: "Other dates",
    watch: "Watch the price",
    open: "Open this flight",
    human: "Talk to a person",
    greetNone: "I’m Anna. Write a normal sentence — tickets, cheaper dates from the calendar, or a price alert. First set from and to on this screen. I don’t invent fares.",
    greetRoute: (route) =>
      `I can see ${route}. Write naturally: cheaper dates from the same calendar, a price watch, or a person in support. I won’t invent flights or baggage rules.`,
    continueRoute: "I can keep going with this route — tell me what you need.",
    needCities: "Both cities need to be on the form. I don’t change it — fill from and to, then ask again.",
    needDate: "There’s no departure date. Say “other dates” — if the cache has cheaper days, I’ll put one into the same search.",
    findOk: "Opening results with what’s on the screen. Same search as the button — I don’t replace it.",
    datesNeedCities: "I need origin and destination first — then I can show days from the same price calendar.",
    datesEmpty: "No daily prices in the cache for this month. That doesn’t mean there are no flights.",
    datesIntro: (date, price) =>
      `Selected day: ${date} · from ${price}. Cheaper days below are from the same calendar, if the cache has them. Tap puts the date into the current search.`,
    datesIntroNoSelected: "Days with a cached price this month. Tap puts the date into the same search.",
    datesFail: "The price calendar didn’t answer. Search and the date on screen didn’t change.",
    datePick: (date) => `Searching ${date} — same search, different date.`,
    watchNeed: "To watch the price I need a route and a departure date on screen.",
    watchIntro: "Same alert as on results: an email if the price goes below your number. Not a ticket guarantee.",
    watchNeedEmail: "I need an email — that’s where the alert goes.",
    watchNeedPrice: "Enter a threshold above zero.",
    watchOk: (email, route, date, price) =>
      `Done: we’ll write to ${email} if ${route} on ${date} drops below ${price}.`,
    watchFail: "Couldn’t save the alert.",
    openNeed: "A flight appears here when you open a card on results. I don’t pick from the list myself.",
    openOk: (flight) => `Opening ${flight}.`,
    humanNeedLogin: "A person gets the request through your account. Sign in and open a trip — or file a booking. I’ll keep this tab’s chat.",
    humanNeedOrder: "Without a booking, current support can’t open a ticket. Book or open a trip in the account.",
    humanAsk: "Add a short question — it goes to support with the route. The reply is by email, not this window.",
    humanAskGuest: "Sending via support needs a sign-in and a booking. You can still describe the question — I’ll keep it in the thread.",
    humanOk: (ref) => `Passed to booking ${ref}. This isn’t a live chat: reply by email, a copy in the account.`,
    humanFail: "Couldn’t send the request.",
    baggage: "Baggage in the cache is often unknown — the card will say it needs clarifying. I don’t invent rules. Open the flight on results or ask a person.",
    refund: "Refunds and changes depend on that flight’s fare. If the card says unknown, I don’t fill it in. I can open the flight or pass you to a person.",
    passengers: "There are four categories on the site: adults 12+, children 2–11, infant without a seat under 2, and infant with a seat. Change the numbers in the form on this screen — I don’t edit it.",
    hello: (route) =>
      route
        ? `Hello. The screen has ${route}. Dates, price, search, or a person?`
        : "Hello. Set a route on the screen, or tell me what you need.",
    thanks: "You’re welcome. Anything else on this route — just write it normally.",
    unknown: "Sorry, I didn’t fully catch that. Pick one of the actions below, or write a bit more clearly.",
    sawFlight: (flight) => `I can see ${flight} from the open card. I can open booking — I didn’t pick the flight myself.`,
  },
};

export function annaText(lang: AnnaLang): Copy {
  return COPY[lang] ?? COPY.ru;
}

export function annaActions(route: ChatRoute | null, pinned: PinnedFlight | null, lang: AnnaLang) {
  const c = annaText(lang);
  const actions: { id: "find" | "dates" | "watch" | "open" | "human"; label: string }[] = [];
  if (hasCities(route) && route.date && route.page !== "search") actions.push({ id: "find", label: c.find });
  if (hasCities(route)) actions.push({ id: "dates", label: c.dates });
  if (hasCities(route) && route.date) actions.push({ id: "watch", label: c.watch });
  if (pinned && route?.page !== "book") actions.push({ id: "open", label: c.open });
  actions.push({ id: "human", label: c.human });
  return actions;
}
