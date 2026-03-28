import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const vercelProductionOrigin =
  process.env.VERCEL_PROJECT_PRODUCTION_URL &&
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __VERCEL_PRODUCTION_ORIGIN__: JSON.stringify(vercelProductionOrigin || ""),
  },
  // 微信 / 小红书等内置浏览器 WebView 偏旧，默认 target 过高会白屏
  build: {
    target: "es2015",
    cssTarget: "chrome61",
  },
});
