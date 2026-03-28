import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function injectedPublicSiteOrigin() {
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (v) {
    return v.startsWith("http")
      ? v.replace(/\/$/, "")
      : `https://${v.replace(/\/$/, "")}`;
  }
  const n = process.env.DEPLOY_PRIME_URL?.trim();
  if (n) {
    return n.startsWith("http")
      ? n.replace(/\/$/, "")
      : `https://${n.replace(/\/$/, "")}`;
  }
  return "";
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __PUBLIC_SITE_ORIGIN__: JSON.stringify(injectedPublicSiteOrigin()),
  },
  // 微信 / 小红书等内置浏览器 WebView 偏旧，默认 target 过高会白屏
  build: {
    target: "es2015",
    cssTarget: "chrome61",
  },
});
