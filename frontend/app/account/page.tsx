import Link from "next/link";
import LogoMark from "../components/Logo";
import AccountHeader from "./AccountHeader";
import CabinetDashboard from "./CabinetDashboard";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)]">
      <header
        className="sticky top-0 z-30 border-b border-[var(--color-ink-border)] text-white"
        style={{ background: "linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-soft) 100%)" }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={34} />
            <span className="font-heading text-lg font-bold">Aviator</span>
          </Link>
          <Link href="/" className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-gold)] hover:bg-white/20">
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
