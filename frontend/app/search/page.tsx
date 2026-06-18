import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[var(--color-text-muted)]">Загрузка результатов…</div>}>
      <SearchResults />
    </Suspense>
  );
}
