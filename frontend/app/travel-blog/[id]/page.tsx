import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "../../data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = blogPosts.find((p) => String(p.id) === id);

  if (!post) {
    return { title: "Статья не найдена — Aviatour.travel" };
  }

  return {
    title: `${post.title} — Aviatour.travel`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = blogPosts.find((p) => String(p.id) === id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] px-6 py-20 text-[var(--color-text)]">
      <div className="mx-auto max-w-3xl">
        <Link href="/travel-blog" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
          ← Ко всем статьям
        </Link>

        <span className="mt-6 inline-block rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <span>{dateFormatter.format(new Date(post.date))}</span>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <img src={post.image} alt={post.title} className="aspect-[16/9] w-full object-cover" />
        </div>

        <div className="mt-8 space-y-4">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-[var(--color-text-muted)]">{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">Готовы к поездке?</p>
          <Link
            href="/search"
            className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Найти авиабилеты
          </Link>
        </div>
      </div>
    </main>
  );
}
