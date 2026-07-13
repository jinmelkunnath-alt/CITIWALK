import { fileURLToPath, URL } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function productionSeoFiles(siteUrl: string): Plugin {
  const origin = siteUrl.replace(/\/$/, "");
  return {
    name: "citiwalk-production-seo",
    closeBundle() {
      const output = resolve(process.cwd(), "dist");
      mkdirSync(output, { recursive: true });
      const routes = ["/", "/terms", "/privacy", "/official-rules"];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (path) => `  <url>
    <loc>${origin}${path}</loc>
    <changefreq>${path === "/" ? "daily" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.6"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>\n`;
      const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard
Sitemap: ${origin}/sitemap.xml
`;
      writeFileSync(resolve(output, "sitemap.xml"), sitemap);
      writeFileSync(resolve(output, "robots.txt"), robots);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_PUBLIC_SITE_URL || "https://YOURDOMAIN.COM";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        includeAssets: [
          "favicon.svg",
          "apple-touch-icon.png",
          "offline.html",
        ],
        manifest: {
          name: "CITIWALK Global Rewards",
          short_name: "CITIWALK Rewards",
          description: "A premium global rewards experience by CITIWALK.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "any",
          background_color: "#090610",
          theme_color: "#090610",
          categories: ["lifestyle", "entertainment"],
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          shortcuts: [
            {
              name: "Enter Giveaway",
              short_name: "Enter",
              url: "/#participation",
              icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
            },
            {
              name: "Official Rules",
              short_name: "Rules",
              url: "/official-rules",
              icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/__/],
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          globIgnores: [
            "**/exceljs*.js",
            "**/write-excel-file*.js",
            "**/xlsx-export*.js",
            "**/AdminAnalyticsPage*.js",
            "**/splash-*.png",
            "**/og-image.png",
          ],
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "citiwalk-images-v1",
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
      productionSeoFiles(siteUrl),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      sourcemap: mode !== "production",
      cssCodeSplit: true,
      target: "es2020",
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            motion: ["framer-motion"],
            router: ["react-router-dom"],
            firebase: ["firebase/app", "firebase/auth", "firebase/functions"],
            "xlsx-export": ["write-excel-file/browser"],
          },
        },
      },
    },
  };
});
