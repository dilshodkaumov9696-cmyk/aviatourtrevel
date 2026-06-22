import Link from "next/link";

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Личный кабинет</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Заказы, пассажиры, документы и избранные маршруты.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <Panel title="Мои заказы">
              <EmptyState
                icon="🎫"
                title="Заказов пока нет"
                description="Здесь появятся ваши билеты после бронирования. Начните поиск прямо сейчас."
                action={<Link href="/#search" className="inline-block rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">Найти рейс</Link>}
              />
            </Panel>

            <Panel title="Пассажиры и документы">
              <EmptyState
                icon="👤"
                title="Пассажиры не добавлены"
                description="Сохраните данные пассажиров, чтобы быстро заполнять формы при бронировании."
                action={
                  <button disabled className="cursor-not-allowed rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)]">
                    Скоро будет доступно
                  </button>
                }
              />
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="История поиска">
              <EmptyState
                icon="🔍"
                title="История пуста"
                description="Маршруты, которые вы искали, будут отображаться здесь."
              />
            </Panel>

            <Panel title="Избранные маршруты">
              <EmptyState
                icon="❤️"
                title="Нет избранных"
                description="Добавляйте маршруты в избранное, чтобы следить за изменением цен."
              />
            </Panel>

            <Panel title="Поддержка">
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Есть вопросы? Мы на связи.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  Написать в Telegram
                </a>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]"
                >
                  Написать в WhatsApp
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

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="text-4xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-[var(--color-text)]">{title}</div>
        <div className="mt-1 max-w-xs text-xs text-[var(--color-text-muted)]">{description}</div>
      </div>
      {action}
    </div>
  );
}
