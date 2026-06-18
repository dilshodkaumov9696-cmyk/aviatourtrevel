import { NextRequest, NextResponse } from "next/server";

// Aviasales/Travelpayouts v3 API — цены по датам для ценового календаря
// Документация: https://support.travelpayouts.com/hc/en-us/articles/203956173

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const month = searchParams.get("month"); // YYYY-MM

  if (!origin || !destination || !month) {
    return NextResponse.json({ error: "origin, destination, month required" }, { status: 400 });
  }

  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "API token not configured" }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      origin,
      destination,
      departure_at: month,
      currency: "rub",
      market: "ru",
      limit: "31",
      token,
    });

    const res = await fetch(
      `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`,
      {
        next: { revalidate: 3600 }, // кэш 1 час
        headers: { "Accept-Encoding": "gzip" },
      }
    );

    if (!res.ok) {
      throw new Error(`Aviasales API error: ${res.status}`);
    }

    const json = await res.json();

    // Нормализуем ответ: { "YYYY-MM-DD": price, ... }
    const prices: Record<string, number> = {};
    if (json.data && Array.isArray(json.data)) {
      for (const item of json.data) {
        if (item.departure_at && item.price) {
          const dateKey = item.departure_at.slice(0, 10);
          prices[dateKey] = item.price;
        }
      }
    }

    return NextResponse.json({ prices });
  } catch (err) {
    console.error("calendar-prices error:", err);
    return NextResponse.json({ prices: {} }, { status: 200 }); // фоллбэк — пустые цены, UI покажет мок
  }
}
