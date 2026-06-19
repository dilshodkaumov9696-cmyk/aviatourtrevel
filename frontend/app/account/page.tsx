import Link from "next/link";

const ORDERS = [
  { id: "AV-2026-104821", route: "Москва → Стамбул", date: "28 июня", status: "Ожидает оплаты", price: "8 728 ₽" },
  { id: "AV-2026-098244", route: "Душанбе → Москва", date: "12 июля", status: "Билет выписан", price: "13 420 ₽" },
  { id: "AV-2026-087311", route: "Москва → Дубай", date: "4 августа", status: "Заявка создана", price: "21 900 ₽" },
];

const PASSENGERS = [
  { name: "IVANOV IVAN", doc: "AA 1234567", expiry: "до 12.10.2030" },
  { name: "PETROVA ANNA", doc: "AB 2345678", expiry: "до 08.05.2029" },
];

const FAVORITES = ["Москва → Стамбул", "Душанбе → Москва", "Ташкент → Дубай"];

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)]">
      <header
        className="sticky top-0 z-30 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[var(--color-primary)]">A</span>
            <span className="text-lg font-bold">Aviator</span>
          </Link>
          <Link href="/" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
            На главную
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Личный кабинет</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Заказы, пассажиры, документы, история поиска и избранные маршруты.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
            <span className="text-[var(--color-text-muted)]">Бонусный баланс: </span>
            <span className="font-bold text-green-600">1 240 ₽</span>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <Panel title="Мои заказы">
              <div className="space-y-3">
                {ORDERS.map((order) => (
                  <div key={order.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <div className="text-sm font-bold text-[var(--color-text)]">{order.route}</div>
                        <div className="mt-1 text-xs text-[var(--color-text-muted)]">{order.id} · {order.date}</div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-bold text-[var(--color-text)]">{order.price}</div>
                        <div className="mt-1 rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Пассажиры и документы">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PASSENGERS.map((passenger) => (
                  <div key={passenger.doc} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                    <div className="text-sm font-bold text-[var(--color-text)]">{passenger.name}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-muted)]">Паспорт: {passenger.doc}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">Действует {passenger.expiry}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="История поиска">
              <div className="space-y-2">
                {["Москва → Стамбул · июнь", "Душанбе → Москва · июль", "Москва → Анталья · август"].map((item) => (
                  <div key={item} className="rounded-lg bg-[var(--color-bg-soft)] px-3 py-2 text-sm text-[var(--color-text)]">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Избранные маршруты">
              <div className="space-y-2">
                {FAVORITES.map((item) => (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-bg-soft)] px-3 py-2">
                    <span className="text-sm text-[var(--color-text)]">{item}</span>
                    <span className="text-xs font-semibold text-green-600">следим за ценой</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Поддержка">
              <div className="grid grid-cols-1 gap-2">
                <a href="https://t.me/" target="_blank" rel="noreferrer" className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                  Telegram
                </a>
                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
                  WhatsApp
                </a>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 text-base font-bold text-[var(--color-text)]">{title}</h2>
      {children}
    </section>
  );
}
