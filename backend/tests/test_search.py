"""Поиск: параметры пассажиров принимаются, без токена — пустая честная выдача."""
from httpx import AsyncClient


async def test_search_rejects_more_infants_than_adults(client: AsyncClient) -> None:
    res = await client.get(
        "/api/v1/search",
        params={
            "origin": "MOW",
            "destination": "IST",
            "depart_date": "2099-01-15",
            "adults": 1,
            "infants": 2,
        },
    )
    assert res.status_code == 422


async def test_search_accepts_pax_and_cabin(client: AsyncClient) -> None:
    res = await client.get(
        "/api/v1/search",
        params={
            "origin": "MOW",
            "destination": "IST",
            "depart_date": "2099-01-15",
            "adults": 2,
            "children": 1,
            "infants": 1,
            "cabin": "business",
        },
    )
    # 200 — пустая или живая выдача; 502 — провайдер недоступен в этой среде.
    assert res.status_code in {200, 502}
    if res.status_code != 200:
        return
    body = res.json()
    assert body["adults"] == 2
    assert body["children"] == 1
    assert body["infants"] == 1
    assert body["cabin"] == "business"
