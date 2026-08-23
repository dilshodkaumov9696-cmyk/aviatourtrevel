import React from "react";

function DemoButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-[#0F172A] text-white rounded-md shadow-sm hover:opacity-90 transition-all">{children}</button>
  );
}

function DemoCard() {
  return (
    <div className="p-4 border rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Москва — Санкт-Петербург</div>
          <div className="text-sm text-gray-500">1 пересадка • 09:00 — 13:20</div>
        </div>
        <div className="text-right">
          <div className="font-bold">$120</div>
          <div className="text-xs text-gray-500">Включая сборы</div>
        </div>
      </div>
    </div>
  );
}

export default function SpecComponents() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Кнопки</h3>
        <div className="flex gap-3">
          <DemoButton>Primary</DemoButton>
          <button className="px-4 py-2 border rounded-md">Secondary</button>
          <button className="px-4 py-2 text-sm text-gray-500">Text</button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Карточки</h3>
        <DemoCard />
      </div>
    </div>
  );
}
