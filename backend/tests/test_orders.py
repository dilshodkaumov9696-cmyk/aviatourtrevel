"""Заявка создаётся как ожидание оплаты; неизвестный промокод отклоняется."""
from httpx import AsyncClient


def _payload(**over):
    base = {
        "contact_email": "pytest-order@example.com",
        "contact_phone": "+79990001122",
        "origin": "MOW",
        "destination": "IST",
        "depart_date": "2099-06-01",
        "cabin": "economy",
        "tariff": "standard",
        "payment_method": "card",
        "total_amount": 15000,
        "passengers": [
            {
                "first_name": "Ivan",
                "last_name": "Petrov",
                "dob": "1990-01-01",
                "gender": "male",
                "citizenship": "RU",
                "doc_number": "1234567890",
            }
        ],
    }
    base.update(over)
    return base


async def test_create_order_awaiting_payment(client: AsyncClient) -> None:
    res = await client.post("/api/v1/orders", json=_payload())
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["status"] == "awaiting_payment"
    assert body["passengers"][0]["doc_number"] == "1234567890"


async def test_unknown_promo_rejected(client: AsyncClient) -> None:
    res = await client.post("/api/v1/orders", json=_payload(promo="FAKE50"))
    assert res.status_code == 422


async def test_known_promo_accepted(client: AsyncClient) -> None:
    res = await client.post("/api/v1/orders", json=_payload(promo="avia10"))
    assert res.status_code == 201, res.text
    assert res.json()["promo"] == "AVIA10"
