import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "../data/blogPosts";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Блог — Aviatour.travel",
  description: "Полезные материалы о путешествиях, визах, багаже и лайфхаках для поездок.",
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export default function TravelBlogPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] text-[var(--color-text)]">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Aviatour.travel
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Блог</h1>
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          Полезные материалы о путешествиях, багажных правилах и лайфхаках
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/travel-blog/${post.id}`}
              className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:shadow-[var(--shadow-card)]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="inline-block rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  {post.category}
                </span>
                <h2 className="mt-3 text-lg font-bold leading-snug text-[var(--color-text)]">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{post.author}</span>
                  <span aria-hidden>·</span>
                  <span>{dateFormatter.format(new Date(post.date))}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
