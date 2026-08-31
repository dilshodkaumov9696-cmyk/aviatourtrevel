/**
 * Живой словарь Анны: намерение → язык → фразы.
 * Сюда добавляют новые выражения. Логику чата из-за этого переписывать не нужно.
 *
 * Фразы — реальные формулировки при покупке билетов: разговорные,
 * с окончаниями, опечатками и смешанным языком. Не случайный набор слов.
 */
export type PhraseLang = "ru" | "tj" | "uz" | "ky" | "en";

export type PhraseIntent =
  | "find"
  | "dates"
  | "watch"
  | "open"
  | "human"
  | "passengers"
  | "baggage"
  | "refund"
  | "hello"
  | "thanks";

export const PHRASE_LANGS: PhraseLang[] = ["ru", "tj", "uz", "ky", "en"];

export const ANNA_PHRASE_INTENTS: PhraseIntent[] = [
  "find",
  "dates",
  "watch",
  "open",
  "human",
  "passengers",
  "baggage",
  "refund",
  "hello",
  "thanks",
];

function glue(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return `${a} ${b}`.replace(/\s+/g, " ").trim();
}

function uniq(items: string[]): string[] {
  return [...new Set(items.map((s) => s.replace(/\s+/g, " ").trim()).filter((s) => s.length >= 3))];
}

/** Ядро + разговорные подхваты слева/справа. Не полная декартова сетка. */
function expand(cores: string[], heads: string[] = [], tails: string[] = []): string[] {
  const out: string[] = [...cores];
  for (const c of cores) {
    for (const h of heads) out.push(glue(h, c));
    for (const t of tails) out.push(glue(c, t));
  }
  return uniq(out);
}

function withPlaces(stems: string[], places: string[]): string[] {
  const out: string[] = [];
  for (const s of stems) for (const p of places) out.push(glue(s, p));
  return out;
}

const RU_HEADS = ["хочу", "надо", "нужно", "можно", "плиз", "пожалуйста", "срочно", "давай", "помоги", "скинь"];
const RU_TAILS = ["пожалуйста", "плиз", "срочно", "если можно", "а", "пожалуйста срочно"];
const RU_PLACES = [
  "в дубай", "в стамбул", "в москву", "в ташкент", "в алматы", "в баку", "в ереван",
  "в сочи", "в питер", "в спб", "в минск", "в ригу", "в анталию", "на пхукет",
  "на бали", "в доху", "в тель авив", "в шарм", "в египет", "в турцию", "в грузию",
  "туда обратно", "в одну сторону", "на завтра", "на пятницу", "на выходные",
];

const TJ_HEADS = ["мехоҳам", "лозим", "лутфан", "имрӯз", "зуд", "илтимос"];
const TJ_TAILS = ["лутфан", "илтимос", "агар мумкин", "зуд"];
const TJ_PLACES = [
  "ба дубай", "ба истанбул", "ба москва", "ба тошканд", "ба алмаато", "ба боку",
  "ба сӯчӣ", "ба санкт петербург", "ба рига", "ба анталия", "ба пхукет", "ба бали",
  "рафтуомад", "як тарафа", "барои пагоҳ", "барои ҷумъа",
];

const UZ_HEADS = ["menga", "kerak", "iltimos", "tez", "bugun", "yordam", "qani"];
const UZ_TAILS = ["iltimos", "tezroq", "bo‘lsa", "bolsa", "mumkinmi"];
const UZ_PLACES = [
  "dubayga", "istanbulga", "moskvaga", "toshkentga", "olmatoga", "bokuga",
  "sochiga", "piturga", "antalyaga", "phuketga", "baliga", "dohaga",
  "borib kelish", "bir tomonlama", "ertaga", "jumaga", "dam olishga",
];

const KY_HEADS = ["мага", "керек", "өтүнөм", "тез", "бүгүн", "жардам"];
const KY_TAILS = ["өтүнөм", "тезирээк", "мүмкүнбү", "чы"];
const KY_PLACES = [
  "дубайга", "стамбулга", "москвага", "ташкентке", "алматыга", "бакуга",
  "сочиге", "питерге", "антальяга", "пхукетке", "балиге",
  "барып кайтуу", "бир тарап", "эртеңге", "жумага",
];

const EN_HEADS = ["please", "i need", "i want", "can you", "help me", "looking to"];
const EN_TAILS = ["please", "asap", "if possible", "thanks"];
const EN_PLACES = [
  "to dubai", "to istanbul", "to moscow", "to tashkent", "to almaty", "to baku",
  "to sochi", "to antalya", "to phuket", "to bali", "to doha",
  "round trip", "one way", "for tomorrow", "for friday", "for the weekend",
];

const RU: Record<PhraseIntent, string[]> = {
  find: uniq([
    ...expand(
      [
        "найди билет", "найди билеты", "найти билет", "найти билеты", "ищи билет", "ищи билеты",
        "поищи билет", "поищи билеты", "покажи билет", "покажи билеты", "покажи рейс", "покажи рейсы",
        "подбери билет", "подбери билеты", "подбери рейс", "подбери перелет", "подбери перелёт",
        "ищу билет", "ищу билеты", "ищем билеты", "нужен билет", "нужны билеты", "нужен рейс",
        "хочу билет", "хочу билеты", "хочу улететь", "хочу полететь", "надо улететь",
        "авиабилет", "авиабилеты", "авиа билеты", "авиобилеты", "билетик", "билетов",
        "билеты есть", "билет есть", "есть билеты", "есть рейсы", "какие есть рейсы",
        "есть прямые", "нужен прямой", "прямой рейс", "самый дешевый билет", "самый дешёвый билет",
        "билеты плиз", "билет пожалуйста", "можно билетик", "найди что нибудь", "найди что-нибудь",
        "открой поиск", "запусти поиск", "ищи рейсы", "варианты перелета", "что есть по рейсам",
        "скинь билеты", "дай билеты", "глянь билеты", "кинь варианты", "покажите варианты",
        "подобрать авиабилеты", "поиск авиабилетов", "найти авиабилеты", "ищу авиабилет",
        "билетв", "билеь", "билетов нет", "хочу авиабилет", "нужны авиабилеты на двоих",
      ],
      RU_HEADS,
      RU_TAILS,
    ),
    ...withPlaces(["найди билет", "найди билеты", "хочу билет", "нужен билет", "билеты", "рейс"], RU_PLACES),
  ]),
  dates: expand(
    uniq([
      "другие даты", "другие дни", "другие числа", "иные даты", "другая дата",
      "покажи другие даты", "есть другие даты", "какие другие даты", "хочу другие даты",
      "даты подешевле", "дни подешевле", "когда дешевле", "когда выгоднее", "когда лететь",
      "когда дешевле лететь", "когда выгоднее лететь", "гибкие даты", "соседние даты",
      "сдвинь дату", "сдвинуть дату", "поменять дату", "сменить дату", "дата подешевле",
      "календарь цен", "цены по дням", "на день раньше", "на день позже", "на два дня раньше",
      "на выходные", "дешовые даты", "дешовле", "подешевше", "подешевлк", "другие дат",
      "другые даты", "дешевые дни", "дешёвые дни", "самые дешевые даты", "самый дешевый день",
      "другие денки", "другие вариантики дат", "есть дни дешевле", "есть дата дешевле",
      "можно другую дату", "давай другую дату", "подбери дату дешевле", "посмотри календарь",
      "cheaper dates", "other dates", "when cheaper",
    ]),
    ["покажи", "есть", "хочу", "давай", "подбери", "можно"],
    ["пожалуйста", "плиз", "если можно"],
  ),
  watch: expand(
    [
      "следить за ценой", "следи за ценой", "подписка на цену", "подписаться на цену",
      "уведомление о цене", "когда цена упадет", "когда цена упадёт", "если станет дешевле",
      "если подешевеет напиши", "алерт на цену", "хочу следить", "поставь слежку",
      "поставь уведомление", "пиши если дешевле", "скажи если упадёт", "цена упала напиши",
      "монитор цены", "следить плиз", "слежка за билетом", "если цена упадет", "если цена упадёт",
      "уведоми о цене", "сообщи если подешевеет", "напиши когда подешевеет", "watch price",
      "подпиши на цену", "хочу алерт", "алерт цены", "слежка за рейсом",
    ],
    ["хочу", "надо", "можно", "плиз", "пожалуйста"],
    ["пожалуйста", "плиз"],
  ),
  open: expand(
    [
      "открой рейс", "открыть рейс", "этот рейс", "выбери рейс", "оформи рейс",
      "забронируй", "забронировать", "оформить заявку", "вот этот", "хочу этот",
      "беру этот", "оформи бронь", "открой этот билет", "открой карточку", "этот билет",
    ],
    ["хочу", "давай", "можно"],
    ["пожалуйста", "плиз"],
  ),
  human: expand(
    [
      "живой человек", "живой оператор", "поговорить с человеком", "написать человеку",
      "свяжите с оператором", "передать человеку", "не бот", "не робот", "агент поддержки",
      "напишите в поддержку", "служба поддержки", "оператору пожалуйста", "менеджеру вопрос",
      "хочу договориться с человеком", "договориться с человеком", "с человеком поговорить",
      "человек нужен", "нужен человек", "нужен оператор", "позови оператора", "соедини с человеком",
      "переведи на человека", "дайте человека", "можно человека", "talk to human",
    ],
    ["хочу", "надо", "можно", "пожалуйста"],
    ["пожалуйста", "срочно"],
  ),
  passengers: expand(
    [
      "пассажиры", "кто летит", "взрослые", "дети", "ребенок", "ребёнок", "младенец",
      "младенец с местом", "младенец без места", "на руках", "с местом", "двое взрослых",
      "с ребенком", "с ребёнком", "с детьми", "один взрослый", "пассажиров сколько",
      "место для младенца", "без места младенец", "поменять пассажиров", "изменить пассажиров",
      "состав пассажиров", "добавь взрослого", "добавь ребенка", "добавь ребёнка", "убери ребенка",
      "сколько человек", "сколько пассажиров", "трое взрослых", "взрослый и ребенок",
      "infant", "lap infant", "infant with seat", "два взрослых один ребенок",
    ],
    ["хочу", "надо", "можно", "как"],
    ["пожалуйста"],
  ),
  baggage: expand(
    [
      "багаж", "багажа", "багажом", "ручная кладь", "ручная", "кладь", "чемодан", "чемоданы",
      "сумка в салон", "сколько багажа", "норма багажа", "багаж входит", "багаж включен",
      "багаж включён", "без багажа", "с багажом", "кг багажа", "20 кг", "23 кг", "carry on",
    ],
    ["какой", "сколько", "есть ли"],
    ["входит", "пожалуйста"],
  ),
  refund: expand(
    [
      "возврат", "вернуть билет", "сдать билет", "обмен", "обменять", "переоформить",
      "невозвратный", "можно вернуть", "можно обменять", "штраф за возврат", "refund",
    ],
    ["хочу", "можно", "как"],
    ["пожалуйста"],
  ),
  hello: ["привет", "здравствуйте", "здравствуй", "добрый день", "добрый вечер", "доброе утро", "хай", "хелло", "салют"],
  thanks: ["спасибо", "спасибо большое", "благодарю", "мерси", "ок спасибо", "всё спасибо", "все спасибо", "спс"],
};

const TJ: Record<PhraseIntent, string[]> = {
  find: uniq([
    ...expand(
      [
        "чипта ёб", "чипта ёбед", "чипта мехоҳам", "чипта лозим", "чиптаҳоро ёб", "чиптаҳоро ёбед",
        "ҷустуҷӯи чипта", "ҷустуҷӯи чиптаҳо", "парвоз нишон диҳед", "парвоз ёб", "рейс ёб",
        "авиачипта", "авиачипта лозим", "мехоҳам парвоз кунам", "чипта ҳаст", "чиптаҳо ҳастанд",
        "билетро ёб", "найти чипта", "хочу чипта", "чипта нишон диҳед", "парвозҳоро нишон диҳед",
        "чиптаи ҳавоӣ", "чиптаи ҳавоӣ ёбед", "рейс ҳаст", "парвози мустақим", "арзонтарин чипта",
        "чипта ёфтан", "ҷустуҷӯ", "чиптаҳо ҳастанд?", "лутфан чипта ёбед",
      ],
      TJ_HEADS,
      TJ_TAILS,
    ),
    ...withPlaces(["чипта ёбед", "чипта мехоҳам", "парвоз", "чиптаҳо"], TJ_PLACES),
  ]),
  dates: expand(
    [
      "санаҳои дигар", "рӯзҳои дигар", "санаи дигар", "арзонтар", "кадом рӯз арзонтар",
      "нархҳои дигар", "тақвими нарх", "рӯзи арзон", "санаҳоро иваз кун", "дигар сана",
      "подешевле сана", "другие даты", "арзонтар ҳаст", "санаҳои арзонтар ҳаст",
      "рӯзҳои арзонтар", "санаи арзонтар", "рӯзи дигар нишон диҳед", "санаҳоро дигар кунед",
      "календар нарх", "рӯзи ҳамсоя", "як рӯз пеш", "як рӯз баъд", "рӯзҳои истироҳат",
    ],
    ["нишон диҳед", "мехоҳам", "лутфан", "ҳаст"],
    ["лутфан", "илтимос"],
  ),
  watch: expand(
    [
      "нархро пайгирӣ", "пайгирии нарх", "обуна ба нарх", "агар нарх паст шавад",
      "нарх паст шавад нависед", "следить за ценой", "пайгирӣ кун", "обуна кун",
      "хабар диҳед агар арзонтар шавад", "алерти нарх", "агар арзонтар шавад нависед",
    ],
    ["мехоҳам", "лутфан"],
    ["лутфан"],
  ),
  open: expand(
    ["парвозро кушо", "ин парвоз", "ҳамин парвоз", "расмият кунед", "бронь кун", "ин чиптаро гир", "ҳамин чипта"],
    ["мехоҳам", "лутфан"],
    ["лутфан"],
  ),
  human: expand(
    [
      "ба одам нависед", "одам лозим", "оператор", "кӯмакчи", "бо одам гап занам",
      "хочу договориться с человеком", "ба одам супоред", "одами зинда", "дастгирӣ",
      "бо оператор гап занам", "одами зинда лозим", "ба одам пайваст кунед",
    ],
    ["мехоҳам", "лутфан"],
    ["лутфан", "зуд"],
  ),
  passengers: expand(
    [
      "мусофирон", "калонсолон", "кӯдакон", "тифл", "тифл бо ҷой", "тифл бе ҷой",
      "пассажиры", "кӯдак", "чанд нафар", "калонсол", "младенец", "ду калонсол",
      "бо кӯдак", "як калонсол", "мусофиронро иваз кун", "ҷой барои тифл",
    ],
    ["мехоҳам", "лутфан", "чанд"],
    ["лутфан"],
  ),
  baggage: expand(
    ["бағоҷ", "бағоҷ ҳаст", "дасти", "бор", "багаж", "чӣ қадар бағоҷ", "бағоҷ дохил аст", "бе бағоҷ"],
    ["чӣ қадар", "ҳаст"],
    ["лутфан"],
  ),
  refund: expand(
    ["бозгашт", "иваз", "чиптаро бозгардон", "обмен", "возврат", "чиптаро иваз кунед", "метавон бозгардонд"],
    ["мехоҳам", "метавон"],
    ["лутфан"],
  ),
  hello: ["салом", "ассалом", "салом алейкум", "ассалому алайкум", "салом алейкум"],
  thanks: ["рахмат", "ташаккур", "ташаккури зиёд", "рахмати калон", "спасибо"],
};

const UZ: Record<PhraseIntent, string[]> = {
  find: uniq([
    ...expand(
      [
        "chipta top", "chipta toping", "chiptalarni toping", "chipta qidir", "qidiruv",
        "aviachipta kerak", "reys toping", "parvoz qidir", "bilet top", "biletlarni toping",
        "хочу chipta", "найди chipta", "chipta bormi", "chipta kerak edi", "uchiq chipta",
        "chipta izlash", "qidir chipta", "topib bering chipta", "avia bilet", "aviabilet",
        "cipta", "chpta", "chiptaa", "reyslar bormi", "qanday reyslar bor", "to‘g‘ri reys",
        "togri reys", "eng arzon chipta", "arzon chipta", "chipta kerak", "parvoz kerak",
        "reys kerak", "chiptani toping", "chiptalarni qidiring", "qidirib bering",
        "bilet kerak", "biletlarni ko‘rsat", "biletlarni korsat", "aviachipta toping",
      ],
      UZ_HEADS,
      UZ_TAILS,
    ),
    ...withPlaces(["chipta toping", "chipta kerak", "reys", "aviachipta"], UZ_PLACES),
  ]),
  dates: expand(
    [
      "boshqa sanalar", "boshqa sana", "boshqa kun", "arzonroq sanalar", "arzonroq sanalar bormi",
      "qachon arzon", "qachon arzonroq", "qachon uchish arzon", "sanalarni o‘zgartir",
      "sanalarni ozgartir", "kunni siljit", "kalendar", "narx kalendari", "boshqa sanalar korsat",
      "другие даты", "подешевле sana", "arzon kunlar", "eng arzon kun", "sana arzonroq",
      "arzonrak", "sanna", "boshqa sanna", "boshqa kunlar", "kunni o‘zgartir", "kunni ozgartir",
      "bir kun oldin", "bir kun keyin", "dam olish kunlari", "mos sanalar", "boshqa sanalar bormi",
    ],
    ["ko‘rsat", "korsat", "kerak", "iltimos", "bor"],
    ["iltimos", "mumkinmi"],
  ),
  watch: expand(
    [
      "narxni kuzat", "narxni kuzatib turing", "narxni kuzatish", "obuna", "narx obunasi",
      "arzonlashsa yozing", "narx tushsa yozing", "narx tushsa xabar", "kuzatib tur",
      "следить за ценой", "watch price", "alert qoying", "narx alert", "kuzat narx",
      "narx tushsa ayt", "arzon bo‘lsa yozing", "arzon bolsa yozing", "obuna qil",
    ],
    ["menga", "iltimos", "kerak"],
    ["iltimos"],
  ),
  open: expand(
    ["reysni och", "shu reys", "shu reysni oching", "bron qil", "rasmiylashtir", "shu chiptani ol", "shu chipta"],
    ["iltimos", "menga"],
    ["iltimos"],
  ),
  human: expand(
    [
      "odamga yozing", "odam kerak", "operator", "yordamchi", "tirik odam", "odam bilan gaplashaman",
      "хочу договориться с человеком", "odamga o‘tkazing", "odamga otkazing", "support",
      "men odam bilan gaplashmoqchiman", "jonli operator", "odam bilan gaplashmoqchiman",
      "operatorga ulash", "tirik odam kerak", "odamga yoz", "kishi kerak",
    ],
    ["menga", "iltimos", "kerak"],
    ["iltimos", "tez"],
  ),
  passengers: expand(
    [
      "yo‘lovchilar", "yolovchilar", "kattalar", "bolalar", "chaqaloq", "chaqaloq joy bilan",
      "chaqaloq joysiz", "nechta odam", "passengers", "katta odam", "bola", "младенец",
      "взрослые", "ikki katta", "bola bilan", "nechta yo‘lovchi", "kattani qo‘sh", "bolani qo‘sh",
      "chaqaloq o‘rindiq bilan", "chaqaloq orindiq bilan", "yo‘lovchilarni o‘zgartir",
    ],
    ["menga", "nechta", "qanday"],
    ["iltimos"],
  ),
  baggage: expand(
    ["bagaj", "yuk", "qo‘l yuki", "qol yuki", "bagaj bormi", "necha kg", "багаж", "bagaj kiradimi", "bagsiz"],
    ["qanday", "necha"],
    ["iltimos"],
  ),
  refund: expand(
    ["qaytarish", "almashtirish", "chiptani qaytarish", "возврат", "обмен", "refund", "chiptani almashtirish", "qaytarib bo‘ladimi"],
    ["qanday", "mumkinmi"],
    ["iltimos"],
  ),
  hello: ["salom", "assalomu alaykum", "assalom", "hayrli kun", "hayrli kech"],
  thanks: ["rahmat", "katta rahmat", "raxmat", "spasibo", "rahmat katta"],
};

const KY: Record<PhraseIntent, string[]> = {
  find: uniq([
    ...expand(
      [
        "билеттерди тап", "билет тап", "билеттерди табуу", "издөө", "каттамды тап",
        "авиабилет керек", "рейс тап", "билет барбы", "билеттер барбы", "хочу билет",
        "найди билеттер", "учуу билет", "билеттерди көрсөт", "каттамдарды көрсөт",
        "эң арзан билет", "түз каттам", "авиабилет тап", "билет изде", "каттам изде",
      ],
      KY_HEADS,
      KY_TAILS,
    ),
    ...withPlaces(["билет тап", "билеттерди тап", "каттам", "авиабилет керек"], KY_PLACES),
  ]),
  dates: expand(
    [
      "башка күндөр", "башка күн", "башка дата", "арзаныраак күндөр", "арзаныраак күндөр барбы",
      "качан арзан", "арзан күн", "күндөрдү өзгөрт", "календар", "баа календары",
      "другие даты", "подешевле күн", "арзан дата", "ийкемдүү күн", "башка күндөрдү көрсөт",
      "бир күн мурун", "бир күн кийин", "дем алыш", "арзан күндөр барбы",
      "башка күндөрдү тап", "арзаныраак дата", "качан учуу арзан", "күндү жылдыр",
      "жума күндөрү", "ийкемдүү даталар", "эң арзан күн кайсы", "баа боюнча күндөр",
      "датаны алмаштыр", "башка ай", "кийинки күн", "мурунку күн", "дем алышка учуу",
    ],
    ["көрсөт", "керек", "өтүнөм"],
    ["өтүнөм", "чы"],
  ),
  watch: expand(
    [
      "бааны көзөмөлдө", "бааны көзөмөлдөө", "жазылуу", "баа түшсө жаз", "следить за ценой",
      "баа алерти", "баа түшсө кабарла", "жазылуу кыл", "бааны байкоо",
      "баа арзандаса жаз", "баа түшсө кат жаз", "баа эскерткич", "билеттин баасын көзөмөлдө",
      "арзандаса кабарла", "баа өзгөрсө жаз", "көзөмөлгө ал", "баа төмөндөсө айт",
    ],
    ["мага", "өтүнөм"],
    ["өтүнөм"],
  ),
  open: expand(
    ["каттамды ач", "ушул каттам", "брондо", "ушул билетти ал", "ушул билет", "карточканы ач"],
    ["өтүнөм"],
    ["чы"],
  ),
  human: expand(
    [
      "адамга жаз", "адам керек", "оператор", "жардамчы", "тирүү адам",
      "хочу договориться с человеком", "колдоо", "адам менен сүйлөшөм", "тирүү оператор",
      "операторго кош", "адамга өткөз", "менеджерге жаз", "колдоо кызматы",
      "бот эмес", "жандуу адам", "оператор менен сүйлөшөйүн", "адамга котор",
    ],
    ["мага", "өтүнөм"],
    ["өтүнөм", "тез"],
  ),
  passengers: expand(
    [
      "жүргүнчүлөр", "чоңдор", "балдар", "ымыркай", "ымыркай орун менен", "канча адам",
      "пассажиры", "бала менен", "эки чоң", "ымыркай орунсуз", "жүргүнчүлөрдү өзгөрт",
    ],
    ["канча", "мага"],
    ["өтүнөм"],
  ),
  baggage: expand(
    ["багаж", "жүк", "кол жүк", "канча кг", "багаж киреби", "багажсыз"],
    ["канча", "кандай"],
    ["өтүнөм"],
  ),
  refund: expand(
    ["кайтаруу", "алмаштыруу", "билетти кайтаруу", "возврат", "билетти алмаштыруу"],
    ["кыла аламбы"],
    ["өтүнөм"],
  ),
  hello: ["салам", "саламатсызбы", "салам алейкум", "ассалаума алейкум", "кайырлуу таң", "кайырлуу күн"],
  thanks: ["рахмат", "чоң рахмат", "чоң рахмат сизге", "спасибо", "ыракмат", "рахмат чоң"],
};

const EN: Record<PhraseIntent, string[]> = {
  find: uniq([
    ...expand(
      [
        "find tickets", "find flights", "search flights", "show flights", "i need a ticket",
        "i want tickets", "book a flight", "looking for flights", "any flights", "flights please",
        "cheapest flight", "direct flight", "one way", "round trip", "ticket pls", "tix",
        "find me a flight", "show me tickets", "need flights", "got any flights", "flight options",
        "search tickets", "find a fare", "cheapest tickets", "nonstop flight", "direct flights",
      ],
      EN_HEADS,
      EN_TAILS,
    ),
    ...withPlaces(["find flights", "need a ticket", "flights", "tickets"], EN_PLACES),
  ]),
  dates: expand(
    [
      "other dates", "another date", "cheaper dates", "cheapest day", "when is cheaper",
      "when to fly", "flexible dates", "change the date", "move the date", "nearby dates",
      "price calendar", "cheaper day", "other day", "different date", "best day to fly",
      "a day earlier", "a day later", "weekend dates", "any cheaper days", "show other dates",
    ],
    ["please", "can you", "show"],
    ["please", "if possible"],
  ),
  watch: expand(
    [
      "watch the price", "watch price", "track price", "price alert", "notify me",
      "tell me if cheaper", "subscribe to price", "alert me", "if the price drops",
      "email me if cheaper", "set a price alert", "track this fare",
    ],
    ["please", "can you"],
    ["please"],
  ),
  open: expand(
    ["open this flight", "open flight", "book this", "select this", "i'll take this", "choose this flight", "open this ticket"],
    ["please"],
    ["please"],
  ),
  human: expand(
    [
      "talk to a person", "real person", "human please", "agent", "support", "operator",
      "i want to talk to someone", "connect me to a person", "speak to a human",
      "not a bot", "live agent", "talk to someone",
    ],
    ["please", "i want to"],
    ["please"],
  ),
  passengers: expand(
    [
      "passengers", "adults", "children", "infant", "infant with seat", "how many people",
      "add a child", "lap infant", "add an adult", "change passengers", "two adults",
      "adult and child", "infant without seat",
    ],
    ["how many", "please"],
    ["please"],
  ),
  baggage: expand(
    ["baggage", "luggage", "carry-on", "carry on", "checked bag", "how much luggage", "is baggage included", "bag included"],
    ["how much", "is there"],
    ["please"],
  ),
  refund: expand(
    ["refund", "exchange", "change ticket", "cancel ticket", "is it refundable", "can i refund", "change the ticket"],
    ["can i", "how to"],
    ["please"],
  ),
  hello: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"],
  thanks: ["thanks", "thank you", "thx", "cheers", "thanks a lot"],
};

const RAW: Record<PhraseIntent, Record<PhraseLang, string[]>> = {
  find: { ru: RU.find, tj: TJ.find, uz: UZ.find, ky: KY.find, en: EN.find },
  dates: { ru: RU.dates, tj: TJ.dates, uz: UZ.dates, ky: KY.dates, en: EN.dates },
  watch: { ru: RU.watch, tj: TJ.watch, uz: UZ.watch, ky: KY.watch, en: EN.watch },
  open: { ru: RU.open, tj: TJ.open, uz: UZ.open, ky: KY.open, en: EN.open },
  passengers: { ru: RU.passengers, tj: TJ.passengers, uz: UZ.passengers, ky: KY.passengers, en: EN.passengers },
  human: { ru: RU.human, tj: TJ.human, uz: UZ.human, ky: KY.human, en: EN.human },
  baggage: { ru: RU.baggage, tj: TJ.baggage, uz: UZ.baggage, ky: KY.baggage, en: EN.baggage },
  refund: { ru: RU.refund, tj: TJ.refund, uz: UZ.refund, ky: KY.refund, en: EN.refund },
  hello: { ru: RU.hello, tj: TJ.hello, uz: UZ.hello, ky: KY.hello, en: EN.hello },
  thanks: { ru: RU.thanks, tj: TJ.thanks, uz: UZ.thanks, ky: KY.thanks, en: EN.thanks },
};

export function annaPhrases(intent: PhraseIntent, lang: PhraseLang): string[] {
  return RAW[intent][lang];
}

export function phraseStats(): Record<PhraseLang, number> & {
  total: number;
  byIntent: Record<PhraseIntent, Record<PhraseLang, number>>;
} {
  const byIntent = {} as Record<PhraseIntent, Record<PhraseLang, number>>;
  const byLang: Record<PhraseLang, number> = { ru: 0, tj: 0, uz: 0, ky: 0, en: 0 };
  for (const intent of ANNA_PHRASE_INTENTS) {
    byIntent[intent] = { ru: 0, tj: 0, uz: 0, ky: 0, en: 0 };
    for (const lang of PHRASE_LANGS) {
      const n = RAW[intent][lang].length;
      byIntent[intent][lang] = n;
      byLang[lang] += n;
    }
  }
  return { ...byLang, total: PHRASE_LANGS.reduce((s, l) => s + byLang[l], 0), byIntent };
}

export function normAnnaText(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[’‘ʻ`]/g, "'")
    .replace(/[?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type PhraseHit = { intent: PhraseIntent; lang: PhraseLang; phrase: string; len: number };

let INDEX: PhraseHit[] | null = null;

export function phraseIndex(): PhraseHit[] {
  if (INDEX) return INDEX;
  const rows: PhraseHit[] = [];
  for (const intent of ANNA_PHRASE_INTENTS) {
    for (const lang of PHRASE_LANGS) {
      for (const phrase of RAW[intent][lang]) {
        const n = normAnnaText(phrase);
        if (n.length < 3) continue;
        rows.push({ intent, lang, phrase: n, len: n.length });
      }
    }
  }
  rows.sort((a, b) => b.len - a.len || a.phrase.localeCompare(b.phrase));
  INDEX = rows;
  return rows;
}

function wordishMatch(haystack: string, needle: string): boolean {
  if (needle.length >= 5) return haystack.includes(needle);
  const padded = ` ${haystack} `;
  return padded.includes(` ${needle} `);
}

export function lookupAnnaPhrases(text: string): PhraseHit[] {
  const t = normAnnaText(text);
  if (!t) return [];
  const hits: PhraseHit[] = [];
  const seen = new Set<string>();
  for (const row of phraseIndex()) {
    if (!wordishMatch(t, row.phrase)) continue;
    const key = `${row.intent}:${row.lang}:${row.phrase}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push(row);
    if (hits.length >= 12) break;
  }
  return hits;
}
