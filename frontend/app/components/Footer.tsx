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
  { icon: "vk", label: "VKontakte", href: "https://vk.com" },
  { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
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

function VKIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.779.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z" />
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
    case "vk":
      return <VKIcon />;
    default:
      return null;
  }
}

function PaymentIcon({ name }: { name: string }) {
  if (name === "visa") return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="44" height="28" rx="4" fill="var(--color-bg-soft)" />
      <text x="8" y="19" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="12" fill="#1A1F71">VISA</text>
    </svg>
  );
  if (name === "mc") return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="44" height="28" rx="4" fill="var(--color-bg-soft)" />
      <circle cx="17" cy="14" r="8" fill="#EB001B" />
      <circle cx="27" cy="14" r="8" fill="#F79E1B" />
      <path d="M22 8.3a8 8 0 010 11.4A8 8 0 0122 8.3z" fill="#FF5F00" />
    </svg>
  );
  if (name === "mir") return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="МИР">
      <rect width="44" height="28" rx="4" fill="var(--color-bg-soft)" />
      <text x="7" y="19" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#00884B">МИР</text>
    </svg>
  );
  if (name === "sbp") return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="СБП">
      <rect width="44" height="28" rx="4" fill="var(--color-bg-soft)" />
      <text x="8" y="19" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#1E5C80">СБП</text>
    </svg>
  );
  return null;
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-sm">
                A
              </div>
              <span className="text-lg font-bold text-[var(--color-primary)]">Aviator</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5 leading-relaxed">
              Поиск и сравнение авиабилетов на более чем 500 направлениях. Лучшие цены за секунды.
            </p>

            {/* Контакты */}
            <div className="mb-5 space-y-2 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-primary)]">✉</span>
                <a href="mailto:support@aviator.ru" className="transition hover:text-[var(--color-primary)]">support@aviator.ru</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-primary)]">☎</span>
                <a href="tel:+78001234567" className="transition hover:text-[var(--color-primary)]">+7 (800) 123-45-67</a>
                <span className="text-[10px] opacity-60">бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-primary)]">⏰</span>
                <span>Пн–Вс, 08:00–23:00</span>
              </div>
            </div>

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

        {/* Платёжные методы */}
        <div className="mb-6 flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] pt-6">
          <span className="text-xs text-[var(--color-text-muted)]">Принимаем к оплате:</span>
          <div className="flex flex-wrap items-center gap-2">
            {["visa", "mc", "mir", "sbp"].map((p) => (
              <PaymentIcon key={p} name={p} />
            ))}
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="text-green-600">🔒</span>
            Защищённое соединение SSL/TLS
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
            <div>© {year} Aviator. Все права защищены. Сайт является агрегатором авиабилетов.</div>
            <div className="flex items-center gap-1 opacity-70">
              <span>🔒</span>
              Поиск билетов — быстро и безопасно
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
