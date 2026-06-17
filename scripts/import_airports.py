#!/usr/bin/env python3
"""
Импорт полной базы аэропортов из открытого data-API Travelpayouts.

Берёт три датасета (airports, cities, countries) на русском, джойнит названия
города и страны по кодам, оставляет только flightable-аэропорты (реальные
направления) и пишет компактный JSON для автокомплита фронтенда:

    frontend/public/airports.json  →  [{ "iata", "city", "name", "country" }, ...]

Использование:
    python scripts/import_airports.py
    python scripts/import_airports.py --lang ru --cache-dir /tmp
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

IATA_RE = re.compile(r"[A-Z]{3}")


def _download(url: str, timeout: float) -> list[dict[str, Any]]:
    try:
        req = Request(url, headers={"User-Agent": "aviator-importer/1.0"})
        with urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        proc = subprocess.run(
            ["curl", "-fsSL", "--max-time", str(int(timeout)), url],
            capture_output=True, text=True, check=True,
        )
        return json.loads(proc.stdout)


def _load(name: str, lang: str, cache_dir: Path, timeout: float) -> list[dict[str, Any]]:
    cache = cache_dir / f"tp_{name}.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    data = _download(f"https://api.travelpayouts.com/data/{lang}/{name}.json", timeout)
    cache.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


def _ru_name(item: dict[str, Any], lang: str) -> str:
    name = item.get("name")
    if isinstance(name, str) and name.strip():
        return name.strip()
    tr = item.get("name_translations") or {}
    for key in (lang, "en"):
        val = tr.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return ""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", default="ru")
    parser.add_argument("--timeout", type=float, default=40.0)
    parser.add_argument("--cache-dir", default="/tmp")
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "frontend" / "public" / "airports.json"),
    )
    args = parser.parse_args()

    cache_dir = Path(args.cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)

    airports_raw = _load("airports", args.lang, cache_dir, args.timeout)
    cities_raw = _load("cities", args.lang, cache_dir, args.timeout)
    countries_raw = _load("countries", args.lang, cache_dir, args.timeout)

    city_name = {c["code"]: _ru_name(c, args.lang) for c in cities_raw if c.get("code")}
    country_name = {c["code"]: _ru_name(c, args.lang) for c in countries_raw if c.get("code")}

    out: list[dict[str, str]] = []
    seen: set[str] = set()
    skipped = 0

    for a in airports_raw:
        # только настоящие аэропорты: без ж/д вокзалов, автовокзалов, вертодромов, портов
        if not a.get("flightable") or a.get("iata_type") != "airport":
            skipped += 1
            continue
        iata = str(a.get("code", "")).strip().upper()
        if not IATA_RE.fullmatch(iata) or iata in seen:
            continue
        seen.add(iata)

        city = city_name.get(a.get("city_code", ""), "") or _ru_name(a, args.lang)
        country = country_name.get(a.get("country_code", ""), "") or a.get("country_code", "")
        name = _ru_name(a, args.lang) or city or iata

        out.append({"iata": iata, "city": city, "name": name, "country": country})

    # сортировка: страна → город → IATA
    out.sort(key=lambda x: (x["country"], x["city"], x["iata"]))

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(out, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    size_kb = out_path.stat().st_size / 1024
    print(f"Аэропортов записано: {len(out)}")
    print(f"Пропущено (не аэропорт / не flightable): {skipped}")
    print(f"Файл: {out_path} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
