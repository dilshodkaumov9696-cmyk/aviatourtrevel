"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/auth";
import { useChatRoute } from "../context/chatRoute";
import { cabinetData, createPriceAlert, type CabinetOrder } from "../lib/api";
import { useSettings } from "../context/settings";
import {
  annaActions,
  annaRouteTitle,
  annaText,
  fmtAnnaDate,
  matchAnnaQuery,
  type AnnaLang,
} from "../lib/annaTalk";
import {
  ANNA_STORAGE_KEY,
  cheapestDays,
  hasCities,
  parseRouteFromUrl,
  pinnedFlightFromBookUrl,
  routeKey,
  searchHref,
  type ChatRoute,
  type PinnedFlight,
} from "../lib/chatRoute";

type ActionId = "find" | "dates" | "watch" | "open" | "human" | `date:${string}`;

interface ChatAction {
  id: ActionId;
  label: string;
}

interface Msg {
  id: string;
  from: "anna" | "user" | "system";
  text: string;
  time: string;
  actions?: ChatAction[];
  dates?: { date: string; price: number }[];
  flight?: PinnedFlight;
}

type Composer = "text" | "watch" | "human";

const ANNA_LANGS: { code: AnnaLang; short: string }[] = [
  { code: "ru", short: "RU" },
  { code: "tj", short: "TJ" },
  { code: "uz", short: "UZ" },
  { code: "ky", short: "KY" },
  { code: "en", short: "EN" },
];

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function anna(text: string, extra?: Partial<Msg>): Msg {
  return { id: uid(), from: "anna", text, time: nowTime(), ...extra };
}

function userMsg(text: string): Msg {
  return { id: uid(), from: "user", text, time: nowTime() };
}

function systemMsg(text: string): Msg {
  return { id: uid(), from: "system", text, time: nowTime() };
}

function defaultActions(route: ChatRoute | null, pinned: PinnedFlight | null, lang: AnnaLang) {
  return annaActions(route, pinned, lang);
}

function greeting(route: ChatRoute | null, pinned: PinnedFlight | null, lang: AnnaLang): Msg {
  const c = annaText(lang);
  const title = hasCities(route) ? annaRouteTitle(route, lang) : "";
  return anna(hasCities(route) ? c.greetRoute(title) : c.greetNone, {
    actions: defaultActions(route, pinned, lang),
  });
}

function readStored(): string | null {
  try {
    return localStorage.getItem(ANNA_STORAGE_KEY) || sessionStorage.getItem(ANNA_STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadSession(): { messages: Msg[]; routeKey: string; talkLang?: AnnaLang } | null {
  try {
    const raw = readStored();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { messages?: Msg[]; routeKey?: string; talkLang?: AnnaLang };
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return { messages: parsed.messages, routeKey: parsed.routeKey || "", talkLang: parsed.talkLang };
  } catch {
    return null;
  }
}

function saveSession(messages: Msg[], key: string, talkLang: AnnaLang) {
  const payload = JSON.stringify({ messages, routeKey: key, talkLang });
  try {
    localStorage.setItem(ANNA_STORAGE_KEY, payload);
  } catch {
    try {
      sessionStorage.setItem(ANNA_STORAGE_KEY, payload);
    } catch {
      /* квота / приватный режим — чат просто не запомнит */
    }
  }
}

function transcript(messages: Msg[], route: ChatRoute | null, pinned: PinnedFlight | null, lang: AnnaLang): string {
  const lines = [
    `Маршрут: ${annaRouteTitle(route, lang)}`,
    route ? `URL-контекст: ${route.fromIata}-${route.toIata} ${route.date} пасс. ${route.adults}/${route.children}/${route.infants}/${route.infantsSeat}` : "",
    pinned ? `Рейс: ${pinned.airlineName} ${pinned.flightNumber} ${pinned.departTime} ${pinned.dateISO}` : "",
    "",
    "Переписка:",
    ...messages
      .filter((m) => m.from !== "system")
      .map((m) => `${m.from === "anna" ? "Анна" : "Клиент"} (${m.time}): ${m.text}`),
  ];
  return lines.filter(Boolean).join("\n");
}

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const { user } = useAuth();
  const { lang: siteLang, format } = useSettings();
  const { homeRoute, pinnedFlight } = useChatRoute();
  const [talkLang, setTalkLang] = useState<AnnaLang>(siteLang);
  const talkLangRef = useRef<AnnaLang>(siteLang);
  const copy = annaText(talkLang);

  const route = useMemo(
    () => parseRouteFromUrl(pathname, search, pathname === "/" ? homeRoute : null),
    [pathname, search, homeRoute],
  );
  const pinned = useMemo(() => {
    if (pathname.startsWith("/book")) return pinnedFlightFromBookUrl(search) || pinnedFlight;
    return pinnedFlight;
  }, [pathname, search, pinnedFlight]);

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [composer, setComposer] = useState<Composer>("text");
  const [watchEmail, setWatchEmail] = useState("");
  const [watchPrice, setWatchPrice] = useState("");
  const [humanNote, setHumanNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastRouteKey = useRef("");
  const skipRouteNotice = useRef(true);
  const lastPinnedHref = useRef("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = routeKey(route);

  useEffect(() => {
    talkLangRef.current = talkLang;
  }, [talkLang]);

  useEffect(() => {
    const saved = loadSession();
    const lang = saved?.talkLang && ["ru", "tj", "uz", "ky", "en"].includes(saved.talkLang) ? saved.talkLang : siteLang;
    setTalkLang(lang);
    talkLangRef.current = lang;
    if (saved) {
      setMessages(saved.messages);
      lastRouteKey.current = saved.routeKey;
    } else {
      setMessages([greeting(route, pinned, lang)]);
      lastRouteKey.current = key;
    }
    setHydrated(true);
    // только при монтировании
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSession(messages, lastRouteKey.current, talkLang);
  }, [messages, hydrated, talkLang]);

  useEffect(() => {
    if (!hydrated) return;
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (skipRouteNotice.current) {
      skipRouteNotice.current = false;
      lastRouteKey.current = key;
      return;
    }
    if (!key || lastRouteKey.current === key) return;
    lastRouteKey.current = key;
    const title = annaRouteTitle(route, lang);
    setMessages((m) => [
      ...m,
      systemMsg(title),
      anna(c.continueRoute, { actions: defaultActions(route, pinned, lang) }),
    ]);
  }, [hydrated, key, route, pinned]);

  useEffect(() => {
    if (!hydrated || !pinned?.bookHref) return;
    if (lastPinnedHref.current === pinned.bookHref) return;
    lastPinnedHref.current = pinned.bookHref;
    if (pathname.startsWith("/book")) return;
    const lang = talkLangRef.current;
    const c = annaText(lang);
    setMessages((m) => [
      ...m,
      anna(c.sawFlight(`${pinned.airlineName} ${pinned.flightNumber}`), {
        flight: pinned,
        actions: [
          { id: "open", label: c.open },
          { id: "human", label: c.human },
        ],
      }),
    ]);
    if (!open) setUnread(true);
  }, [hydrated, pinned, pathname, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, typing, composer]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  useEffect(() => {
    if (user?.email && !watchEmail) setWatchEmail(user.email);
  }, [user, watchEmail]);

  function speak(next: Msg | Msg[], delay = 450) {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => m.concat(next));
      if (!open) setUnread(true);
    }, delay);
  }

  async function onDates() {
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (!hasCities(route)) {
      speak(anna(c.datesNeedCities));
      return;
    }
    const month = (route.date || new Date().toISOString().slice(0, 10)).slice(0, 7);
    try {
      const res = await fetch(`/api/calendar-prices?origin=${route.fromIata}&destination=${route.toIata}&month=${month}`);
      const data = (await res.json()) as { prices?: Record<string, number> };
      const prices = data.prices || {};
      const days = cheapestDays(prices, route.date);
      if (days.length === 0) {
        speak(anna(c.datesEmpty, { actions: defaultActions(route, pinned, lang) }));
        return;
      }
      const selected = route.date && prices[route.date];
      const intro = selected
        ? c.datesIntro(fmtAnnaDate(route.date, lang), format(selected))
        : c.datesIntroNoSelected;
      speak(
        anna(intro, {
          dates: days,
          actions: days.map((d) => ({
            id: `date:${d.date}` as ActionId,
            label: `${fmtAnnaDate(d.date, lang)} · ${format(d.price)}`,
          })),
        }),
      );
    } catch {
      speak(anna(c.datesFail));
    }
  }

  async function onWatch() {
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (!hasCities(route) || !route.date) {
      speak(anna(c.watchNeed));
      return;
    }
    setComposer("watch");
    setWatchEmail((e) => e || user?.email || "");
    if (!watchPrice) {
      try {
        const month = route.date.slice(0, 7);
        const res = await fetch(`/api/calendar-prices?origin=${route.fromIata}&destination=${route.toIata}&month=${month}`);
        const data = (await res.json()) as { prices?: Record<string, number> };
        const p = data.prices?.[route.date];
        if (p) setWatchPrice(String(Math.round(p)));
      } catch {
        /* поле останется пустым — человек введёт сам */
      }
    }
    speak(anna(c.watchIntro));
  }

  async function submitWatch() {
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (!hasCities(route) || !route.date) return;
    const email = watchEmail.trim();
    const price = Number(watchPrice.replace(/\s/g, "").replace(",", "."));
    if (!email || !email.includes("@")) {
      speak(anna(c.watchNeedEmail));
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      speak(anna(c.watchNeedPrice));
      return;
    }
    setBusy(true);
    try {
      await createPriceAlert({
        email,
        origin: route.fromIata,
        destination: route.toIata,
        departDate: route.date,
        returnDate: route.returnDate || undefined,
        targetPrice: price,
        cabin: route.cabin,
      });
      setComposer("text");
      speak(
        anna(
          c.watchOk(email, `${route.fromIata} → ${route.toIata}`, fmtAnnaDate(route.date, lang), format(price)),
          { actions: defaultActions(route, pinned, lang) },
        ),
      );
    } catch (e) {
      speak(anna(e instanceof Error ? e.message : c.watchFail));
    } finally {
      setBusy(false);
    }
  }

  async function submitHuman() {
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (!user) {
      speak(anna(c.humanNeedLogin, { actions: defaultActions(route, pinned, lang) }));
      setComposer("text");
      return;
    }
    setBusy(true);
    try {
      let ref = route?.orderRef;
      if (!ref) {
        const orders = await cabinetData<CabinetOrder[]>("/orders");
        const match = hasCities(route)
          ? orders.find((o) => o.origin === route.fromIata && o.destination === route.toIata)
          : undefined;
        ref = match?.ref || orders[0]?.ref;
      }
      if (!ref) {
        speak(anna(c.humanNeedOrder, { actions: defaultActions(route, pinned, lang) }));
        setComposer("text");
        return;
      }
      const extra = humanNote.trim();
      const message = [extra && `Сообщение клиента:\n${extra}`, transcript(messages, route, pinned, lang)]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 2000);
      const body = message.length >= 8 ? message : annaRouteTitle(route, lang);
      await cabinetData(`/orders/${ref}/support`, {
        method: "POST",
        body: JSON.stringify({ kind: "question", message: body }),
      });
      setComposer("text");
      setHumanNote("");
      speak(anna(c.humanOk(ref), { actions: defaultActions(route, pinned, lang) }));
    } catch (e) {
      speak(anna(e instanceof Error ? e.message : c.humanFail));
    } finally {
      setBusy(false);
    }
  }

  function runAction(id: ActionId, echo = true) {
    const lang = talkLangRef.current;
    const c = annaText(lang);
    if (id.startsWith("date:")) {
      const date = id.slice(5);
      if (!hasCities(route)) return;
      if (echo) setMessages((m) => [...m, userMsg(fmtAnnaDate(date, lang))]);
      speak(anna(c.datePick(fmtAnnaDate(date, lang))));
      router.push(searchHref(route, date));
      return;
    }
    if (id === "find") {
      if (!hasCities(route)) {
        speak(anna(c.needCities));
        return;
      }
      if (!route.date) {
        speak(anna(c.needDate, { actions: defaultActions(route, pinned, lang) }));
        return;
      }
      if (echo) setMessages((m) => [...m, userMsg(c.find)]);
      speak(anna(c.findOk));
      router.push(searchHref(route));
      return;
    }
    if (id === "dates") {
      if (echo) setMessages((m) => [...m, userMsg(c.dates)]);
      void onDates();
      return;
    }
    if (id === "watch") {
      if (echo) setMessages((m) => [...m, userMsg(c.watch)]);
      void onWatch();
      return;
    }
    if (id === "open") {
      if (echo) setMessages((m) => [...m, userMsg(c.open)]);
      if (!pinned) {
        speak(anna(c.openNeed, { actions: defaultActions(route, pinned, lang) }));
        return;
      }
      speak(anna(c.openOk(`${pinned.airlineName} ${pinned.flightNumber}`)));
      router.push(pinned.bookHref);
      return;
    }
    if (id === "human") {
      if (echo) setMessages((m) => [...m, userMsg(c.human)]);
      setComposer("human");
      speak(anna(user ? c.humanAsk : c.humanAskGuest));
    }
  }

  function sendFreeText() {
    const t = input.trim();
    if (!t) return;
    setInput("");
    const { intent, lang } = matchAnnaQuery(t, talkLangRef.current);
    setTalkLang(lang);
    talkLangRef.current = lang;
    const c = annaText(lang);
    setMessages((m) => [...m, userMsg(t)]);
    const title = hasCities(route) ? annaRouteTitle(route, lang) : "";
    if (intent === "dates") {
      void onDates();
      return;
    }
    if (intent === "watch") {
      void onWatch();
      return;
    }
    if (intent === "find") {
      runAction("find", false);
      return;
    }
    if (intent === "open") {
      runAction("open", false);
      return;
    }
    if (intent === "human") {
      runAction("human", false);
      return;
    }
    if (intent === "passengers") {
      speak(anna(c.passengers, { actions: defaultActions(route, pinned, lang) }));
      return;
    }
    if (intent === "baggage") {
      speak(anna(c.baggage, { actions: defaultActions(route, pinned, lang) }));
      return;
    }
    if (intent === "refund") {
      speak(anna(c.refund, { actions: defaultActions(route, pinned, lang) }));
      return;
    }
    if (intent === "hello") {
      speak(anna(c.hello(title), { actions: defaultActions(route, pinned, lang) }));
      return;
    }
    if (intent === "thanks") {
      speak(anna(c.thanks, { actions: defaultActions(route, pinned, lang) }));
      return;
    }
    const rest = defaultActions(route, pinned, lang).filter((a) => a.id !== "human");
    speak(anna(c.unknown, { actions: [{ id: "human" as const, label: c.human }, ...rest] }));
  }

  function switchLang(lang: AnnaLang) {
    if (lang === talkLangRef.current) return;
    setTalkLang(lang);
    talkLangRef.current = lang;
    const c = annaText(lang);
    setMessages((m) => [...m, systemMsg(c.switched), anna(hasCities(route) ? c.greetRoute(annaRouteTitle(route, lang)) : c.greetNone, { actions: defaultActions(route, pinned, lang) })]);
  }

  function clearChat() {
    const lang = talkLangRef.current;
    try {
      localStorage.removeItem(ANNA_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(ANNA_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setComposer("text");
    setHumanNote("");
    setWatchPrice("");
    lastRouteKey.current = key;
    lastPinnedHref.current = "";
    setMessages([greeting(route, pinned, lang)]);
  }

  const statusLabel = hasCities(route) ? copy.statusRoute : copy.statusSite;
  const routeLine = annaRouteTitle(route, talkLang);

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-[5.5rem] z-[60] flex max-h-[min(88dvh,36rem)] w-auto flex-col overflow-hidden rounded-2xl border border-[var(--color-ink-border)] bg-[var(--color-ink)] text-white shadow-[0_24px_60px_rgba(10,27,56,0.45)] md:inset-x-auto md:right-5 md:bottom-24 md:w-[min(22.5rem,calc(100vw-2.5rem))]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-heading text-sm font-bold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/50">
                  А
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold">Анна</div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={copy.close}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <div className="text-[11px] text-white/55">{statusLabel}</div>
                <div className="mt-1.5 truncate font-mono text-[11px] text-[var(--color-gold)]" title={routeLine}>
                  {routeLine}
                </div>
                <div className="mt-2 flex flex-nowrap items-center gap-1 overflow-x-auto">
                  {ANNA_LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => switchLang(l.code)}
                      className={`shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide transition ${
                        talkLang === l.code
                          ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                          : "text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {l.short}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearChat}
                    className="ml-auto shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white/45 transition hover:text-white"
                  >
                    {copy.clear}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div ref={bodyRef} className="flex min-h-[220px] flex-1 flex-col gap-2.5 overflow-y-auto bg-[var(--color-ink-soft)] p-3.5">
            {hydrated &&
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  {m.from === "system" ? (
                    <div className="w-full text-center text-[11px] text-white/40">{m.text}</div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                        m.from === "user"
                          ? "rounded-br-sm bg-[var(--color-primary)] text-white"
                          : "rounded-bl-sm bg-white/8 text-white/95 ring-1 ring-white/10"
                      }`}
                    >
                      {m.text}
                      {m.flight && (
                        <div className="mt-2 rounded-xl bg-black/20 px-3 py-2 font-mono text-[11px] text-[var(--color-gold)]">
                          {m.flight.airlineName} {m.flight.flightNumber}
                          <div className="text-white/60">
                            {m.flight.fromIata} {m.flight.departTime} · {fmtAnnaDate(m.flight.dateISO, talkLang)}
                          </div>
                        </div>
                      )}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {m.actions.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => runAction(a.id)}
                              className="rounded-full border border-[var(--color-gold)]/35 bg-black/20 px-3 py-1.5 text-left text-[12px] font-medium text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/15"
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className={`mt-1 text-[10px] ${m.from === "user" ? "text-white/55" : "text-white/35"}`}>{m.time}</div>
                    </div>
                  )}
                </div>
              ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 ring-1 ring-white/10">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                  </div>
                </div>
              </div>
            )}

            {composer === "watch" && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-[12px] font-semibold text-white">{copy.watchTitle}</div>
                <input
                  value={watchEmail}
                  onChange={(e) => setWatchEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <input
                  value={watchPrice}
                  onChange={(e) => setWatchPrice(e.target.value)}
                  placeholder={copy.watchPricePh}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setComposer("text")}
                    className="rounded-lg px-3 py-2 text-xs text-white/60"
                  >
                    {copy.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void submitWatch()}
                    className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[var(--color-accent-foreground)] disabled:opacity-50"
                  >
                    {busy ? copy.watchSaving : copy.watchSubmit}
                  </button>
                </div>
              </div>
            )}

            {composer === "human" && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-[12px] font-semibold text-white">{copy.humanTitle}</div>
                <textarea
                  value={humanNote}
                  onChange={(e) => setHumanNote(e.target.value)}
                  rows={3}
                  placeholder={copy.humanPh}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setComposer("text")} className="rounded-lg px-3 py-2 text-xs text-white/60">
                    {copy.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void submitHuman()}
                    className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[var(--color-accent-foreground)] disabled:opacity-50"
                  >
                    {busy ? copy.humanSending : copy.humanSubmit}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendFreeText();
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-[var(--color-ink)] p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.placeholder}
              className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-gold)]/50"
            />
            <button
              type="submit"
              aria-label={copy.send}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] transition hover:brightness-110 disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Чат с консультантом"
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, var(--color-ink-soft), var(--color-ink))" }}
      >
        {!open && <span className="chat-fab-ring" aria-hidden />}
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <circle className="chat-typing-dot" cx="8.7" cy="11.3" r="1.15" fill="currentColor" stroke="none" />
              <circle className="chat-typing-dot" cx="12" cy="11.3" r="1.15" fill="currentColor" stroke="none" />
              <circle className="chat-typing-dot" cx="15.3" cy="11.3" r="1.15" fill="currentColor" stroke="none" />
            </svg>
            {unread && (
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-[var(--color-accent-foreground)]">
                1
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
