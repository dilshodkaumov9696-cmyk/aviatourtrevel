"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "../lib/api";
import { useAuth } from "../context/auth";

function VerifyEmailInner() {
  const token = useSearchParams().get("token") ?? "";
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "done" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => {
        setStatus("done");
        if (user) updateUser({ ...user, emailVerified: true });
      })
      .catch(() => setStatus("error"));
  }, [token, user, updateUser]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-16 text-[var(--color-text)]">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-[var(--color-primary)]">ПОДТВЕРЖДЕНИЕ EMAIL</p>

        {status === "loading" && <p className="mt-4 text-sm text-[var(--color-text-muted)]">Проверяем ссылку…</p>}

        {status === "done" && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Почта подтверждена. Теперь прошлые заявки на этот адрес автоматически появятся в кабинете.
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Ссылка недействительна или устарела. Запросите новое письмо в личном кабинете.
          </div>
        )}

        <Link href="/account" className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline">
          В личный кабинет →
        </Link>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
