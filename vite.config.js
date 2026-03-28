import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 微信 / 小红书等内置浏览器 WebView 偏旧，默认 target 过高会白屏
  build: {
    target: "es2015",
    cssTarget: "chrome61",
  },
});
