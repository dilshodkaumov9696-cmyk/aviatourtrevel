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

/** Renders the SVG file from /public/icons — that folder is the source of truth. */
export function FolderIcon({
  name,
  size = 18,
  className = "",
  invert = false,
}: {
  name: string;
  size?: number;
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      className={`inline-block shrink-0 ${invert ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
