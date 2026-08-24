import Link from "next/link";
import AccountHeader from "./AccountHeader";
import CabinetDashboard from "./CabinetDashboard";

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

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Личный кабинет</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Поездки, пассажиры, документы, подписки и поддержка.
          </p>
        </div>

        <AccountHeader />

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><CabinetDashboard /></section>
      </div>
    </main>
  );
}
