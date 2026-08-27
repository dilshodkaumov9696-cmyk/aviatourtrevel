import React from "react";
import ColorPalette from "../components/devspec/ColorPalette";
import PrintButton from "../components/devspec/PrintButton";
import SpecComponents from "../components/devspec/SpecComponents";
import SpecPages from "../components/devspec/SpecPages";
import ScreenshotGallery, { screenshots as pageScreenshots } from "../components/devspec/ScreenshotGallery";

const typography = [
  { role: "Heading", family: "Golos Text", weight: "700 (Bold)", usage: "Все заголовки, заголовок героя, названия карточек", token: "--font-heading" },
  { role: "Body", family: "Inter", weight: "400 / 500", usage: "Основной текст, описания, формы", token: "--font-body" },
  { role: "Display", family: "Golos Text", weight: "900", usage: "Декоративные заголовки", token: "--font-display" },
  { role: "Mono", family: "JetBrains Mono", weight: "400 / 700", usage: "Лейблы, числа, коды аэропортов, технические данные", token: "--font-mono" },
];

const fontSizes = [
  { cls: "text-7xl", px: "72px", usage: "Заголовок героя (Aviatour.travel)" },
  { cls: "text-5xl", px: "48px", usage: "Заголовок героя на мобильных" },
  { cls: "text-4xl", px: "36px", usage: "Заголовок страницы (PageHero)" },
  { cls: "text-3xl", px: "30px", usage: "Заголовок секции" },
  { cls: "text-2xl", px: "24px", usage: "Подзаголовок секции, заголовок блока" },
  { cls: "text-xl", px: "20px", usage: "Заголовок карточки" },
  { cls: "text-lg", px: "18px", usage: "Название тарифа, элемент списка" },
  { cls: "text-base", px: "16px", usage: "Основной текст" },
  { cls: "text-sm", px: "14px", usage: "Тело текста, описания, кнопки" },
  { cls: "text-xs", px: "12px", usage: "Метки, хинты, подписи" },
  { cls: "text-[10px]", px: "10px", usage: "Лейблы (mono, uppercase, tracking-widest)" },
];

const routes = [
  "/", "/search-results", "/checkout", "/about", "/faq", "/contact",
  "/my-bookings", "/flight-status", "/destinations", "/baggage-policy",
  "/loyalty-program", "/visa-info", "/fare-rules", "/travel-blog",
  "/corporate", "/manage-booking", "/online-check-in", "/careers",
];

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="print-break border-t border-gray-200 pt-10 mt-10 first:border-0 first:mt-0 first:pt-0">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-mono font-bold text-gray-300">{String(n).padStart(2, "0")}</span>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function DevSpec() {
  return (
    <div className="devspec bg-white min-h-screen text-gray-900">
      <div className="no-print sticky top-4 z-50 flex justify-end pr-6">
        <PrintButton />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#E6FF00] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#05070A] -rotate-45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M2 12L22 3L18 14L22 21L13 15L2 12Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-2xl font-bold">Aviatour.travel</span>
        </div>
        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Техническая спецификация</p>
        <h1 className="text-5xl font-bold mb-4 leading-tight">Документация для разработчиков</h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
          Полное описание дизайн-системы, компонентов, страниц и структуры данных платформы Aviatour.travel.
        </p>
        <div className="flex gap-6 mt-8 text-sm text-gray-400">
          <span>Версия: 1.0</span>
          <span>·</span>
          <span>Дата: {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>·</span>
          <span>Страниц: {routes.length}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <Section n={2} title="Цветовая палитра">
          <ColorPalette />
        </Section>

        <Section n={3} title="Типографика">
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                  <th className="py-2 pr-4">Роль</th>
                  <th className="py-2 pr-4">Шрифт</th>
                  <th className="py-2 pr-4">Начертание</th>
                  <th className="py-2 pr-4">CSS-токен</th>
                  <th className="py-2">Использование</th>
                </tr>
              </thead>
              <tbody>
                {typography.map((t) => (
                  <tr key={t.role} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold">{t.role}</td>
                    <td className="py-3 pr-4" style={{ fontFamily: t.family === "JetBrains Mono" ? "monospace" : t.family }}>{t.family}</td>
                    <td className="py-3 pr-4 text-gray-600">{t.weight}</td>
                    <td className="py-3 pr-4"><code className="text-xs text-gray-500">{t.token}</code></td>
                    <td className="py-3 text-gray-500 text-xs">{t.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Шкала размеров — была заведена, но не выводилась. */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Класс</th>
                  <th className="py-2 pr-4">Размер</th>
                  <th className="py-2">Использование</th>
                </tr>
              </thead>
              <tbody>
                {fontSizes.map((f) => (
                  <tr key={f.cls} className="border-b border-gray-100">
                    <td className="py-3 pr-4"><code className="text-xs text-gray-500">{f.cls}</code></td>
                    <td className="py-3 pr-4 font-semibold">{f.px}</td>
                    <td className="py-3 text-xs text-gray-500">{f.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section n={5} title="Компоненты">
          <SpecComponents />
        </Section>

        <Section n={6} title="Страницы">
          <SpecPages screenshots={pageScreenshots} />
        </Section>

        <Section n={10} title="Скриншоты страниц (placeholder)">
          <ScreenshotGallery />
        </Section>
      </div>
    </div>
  );
}
