#!/usr/bin/env node
// BlinkID хранит ~70МБ WASM-движка в node_modules — в git не кладём,
// копируем в public/resources при каждом npm install.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "..", "node_modules", "@microblink", "blinkid", "dist", "resources");
const dest = path.join(root, "..", "public", "resources");

if (!existsSync(src)) {
  console.warn("BlinkID: node_modules/@microblink/blinkid/dist/resources не найден, пропускаю копирование");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("BlinkID: ресурсы сканирования скопированы в public/resources");
