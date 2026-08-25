"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../lib/api";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить новый пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-16 text-[var(--color-text)]">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-[var(--color-primary)]">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</p>
        <h1 className="mt-2 text-2xl font-bold">Новый пароль</h1>

        {!token ? (
          <p className="mt-5 text-sm text-red-600">Ссылка неполная — откройте её из письма ещё раз.</p>
        ) : done ? (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Пароль сохранён. Теперь можно войти с ним.
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Придумайте новый пароль для входа.</p>
            <form onSubmit={submit} className="mt-6 flex gap-2">
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
              />
              <button disabled={loading} className="rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? "…" : "Сохранить"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
