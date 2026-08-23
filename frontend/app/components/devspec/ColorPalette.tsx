import React from "react";

const COLORS = [
  { name: "brand", var: "--color-primary" },
  { name: "accent", var: "--color-accent" },
  { name: "bg", var: "--color-bg" },
  { name: "surface", var: "--color-surface" },
  { name: "text", var: "--color-text" },
  { name: "muted", var: "--color-text-muted" },
];

export default function ColorPalette() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {COLORS.map((c) => (
        <div key={c.name} className="p-4 border border-gray-100 rounded-xl flex items-center gap-4">
          <div style={{ background: `var(${c.var})` }} className="w-14 h-14 rounded-lg shadow-sm border" />
          <div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-xs text-gray-500">{c.var}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
