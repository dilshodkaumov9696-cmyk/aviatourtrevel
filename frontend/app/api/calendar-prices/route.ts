import { NextRequest, NextResponse } from "next/server";

/** Прокси к FastAPI, чтобы календарь брал тот же TRAVELPAYOUTS_TOKEN, что и поиск. */
export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const incoming = new URL(req.url);
  const url = new URL("/api/v1/search/calendar", origin);
  incoming.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("calendar-prices proxy error:", err);
    return NextResponse.json({ prices: {} });
  }
}
