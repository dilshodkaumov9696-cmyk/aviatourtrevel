"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить письмо");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-16 text-[var(--color-text)]">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-[var(--color-primary)]">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</p>
        <h1 className="mt-2 text-2xl font-bold">Забыли пароль?</h1>

        {sent ? (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Если такой email зарегистрирован — на него отправлена ссылка для восстановления. Проверьте почту.
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Пришлём ссылку для нового пароля на вашу почту.</p>
            <form onSubmit={submit} className="mt-6 flex gap-2">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
              />
              <button disabled={loading} className="rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? "…" : "Отправить"}
              </button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </>
        )}

        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline">
          ← На главную
        </Link>
      </section>
    </main>
  );
}
