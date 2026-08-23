import React from "react";

export default function SpecPages({ screenshots }: { screenshots?: string[] }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">Список важных страниц и их назначение. Нажмите для предпросмотра (placeholder).</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <li className="p-3 border rounded">Главная — Поиск и подбор рейсов</li>
        <li className="p-3 border rounded">Результаты поиска — Список предложений</li>
        <li className="p-3 border rounded">Страница бронирования — Checkout flow</li>
        <li className="p-3 border rounded">Профиль — Мои бронирования</li>
      </ul>

      {screenshots && screenshots.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mt-4 mb-2">Скриншоты</h4>
          <div className="grid grid-cols-2 gap-3">
            {screenshots.slice(0, 4).map((s, i) => (
              <img key={i} src={s} alt={`screenshot-${i}`} className="w-full rounded border" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
