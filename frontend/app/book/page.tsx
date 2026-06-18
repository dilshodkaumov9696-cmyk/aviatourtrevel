import { Suspense } from "react";
import BookingPage from "./BookingPage";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[var(--color-text-muted)]">Загрузка…</div>}>
      <BookingPage />
    </Suspense>
  );
}
