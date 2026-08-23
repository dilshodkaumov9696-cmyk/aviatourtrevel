import React from "react";

export const screenshots = [
  "/_next/static/media/hero.1.png",
  "/_next/static/media/search.1.png",
  "/_next/static/media/results.1.png",
  "/_next/static/media/checkout.1.png",
];

export default function ScreenshotGallery() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {screenshots.map((s, i) => (
        <div key={i} className="border rounded overflow-hidden">
          <img src={s} alt={`shot-${i}`} className="w-full h-40 object-cover" />
        </div>
      ))}
    </div>
  );
}
