"use client";
import React from "react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
    >
      <span className="w-4 h-4">📄</span>
      Скачать PDF
    </button>
  );
}
