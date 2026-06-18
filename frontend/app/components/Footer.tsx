"use client";

const SECTIONS = [
  {
    title: "Компания",
    links: [
      { label: "О нас", href: "#" },
      { label: "Карьера", href: "#" },
      { label: "Блог", href: "#" },
      { label: "Пресс-центр", href: "#" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { label: "Служба помощи", href: "#help" },
      { label: "Контакты", href: "#" },
      { label: "FAQ", href: "#help" },
      { label: "Статус системы", href: "#" },
    ],
  },
  {
    title: "Юридическое",
    links: [
      { label: "Условия использования", href: "#" },
      { label: "Политика конфиденциальности", href: "#" },
      { label: "Политика cookies", href: "#" },
      { label: "Возврат билетов", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: "telegram", label: "Telegram", href: "https://t.me" },
  { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
  { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
  { icon: "twitter", label: "Twitter", href: "https://twitter.com" },
];

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.32-2.96-.924c-.644-.203-.659-.644.135-.953l11.566-4.458c.54-.203 1.01.122.84 1.14z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.953 4.57a10 10 0 102-14.974 10 10 0 0012.974 14.974zM8.618 17.898h2.357V9.017H8.618v8.88zm-1.178-10.1a1.368 1.368 0 11.002-2.736 1.368 1.368 0 01-.002 2.736zm11.559 4.175c0-2.652-1.39-4.643-3.681-4.643-1.679 0-2.707.984-3.156 1.888h-.046v-1.618H11.41V17.9h2.357v-4.35c0-1.147.436-1.914 1.388-1.914 1.002 0 1.57.755 1.57 1.914v4.35h2.357v-4.67z" />
    </svg>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "telegram":
      return <TelegramIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "twitter":
      return <TwitterIcon />;
    default:
      return null;
  }
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-20">
      {/* Основной контент */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Бренд слева */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">
                A
              </div>
              <span className="text-lg font-bold text-[var(--color-primary)]">Aviator</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Находи и сравнивай дешёвые авиабилеты за секунды.
            </p>
            {/* Соцсети */}
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  title={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* 3 колонки ссылок */}
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Разделитель */}
        <div className="border-t border-[var(--color-border)] pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
            <div>© {year} Aviator. Все права защищены.</div>
            <div className="text-xs">v0.1.0 · dev</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
