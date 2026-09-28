import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Корень — эта папка frontend, а не домашний каталог. Иначе Turbopack
// поднимается к чужому package-lock.json (его легко получить, запустив npm
// из ~) и не резолвит maplibre-gl/dist/maplibre-gl.css.
const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  distDir: "dist",
  turbopack: { root },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
