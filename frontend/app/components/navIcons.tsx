export const NAV_ITEMS = [
  { key: "flights", icon: "flights", href: "/#search" },
  { key: "hotels", icon: "hotels", href: null },
  { key: "tours", icon: "tours", href: null },
  { key: "esim", icon: "esim", href: null },
  { key: "insurance", icon: "insurance", href: null },
  { key: "trains", icon: "trains", href: null },
  { key: "transfers", icon: "transfers", href: null },
  { key: "deals", icon: "deals", href: "/#deals" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** Hover motion for free SVG icons (no Flaticon / paid packs). */
const ICON_MOTION: Record<string, string> = {
  flights: "nav-icon--fly",
  hotels: "nav-icon--bob",
  tours: "nav-icon--unfold",
  esim: "nav-icon--pulse",
  insurance: "nav-icon--shield",
  trains: "nav-icon--roll",
  transfers: "nav-icon--drive",
  deals: "nav-icon--spin",
  support: "nav-icon--ring",
  login: "nav-icon--pop",
  menu: "nav-icon--pop",
  sun: "nav-icon--spin",
  moon: "nav-icon--bob",
};

/** Renders the SVG file from /public/icons — that folder is the source of truth. */
export function FolderIcon({
  name,
  size = 18,
  className = "",
  invert = false,
  animated = true,
}: {
  name: string;
  size?: number;
  className?: string;
  invert?: boolean;
  animated?: boolean;
}) {
  const motion = animated ? ICON_MOTION[name] ?? "nav-icon--pop" : "";
  return (
    <span className={`nav-icon inline-flex shrink-0 items-center justify-center ${motion} ${className}`} style={{ width: size, height: size }}>
      <img
        src={`/icons/${name}.svg`}
        alt=""
        width={size}
        height={size}
        className={`nav-icon__img block h-full w-full ${invert ? "brightness-0 invert" : ""}`}
        draggable={false}
      />
    </span>
  );
}
