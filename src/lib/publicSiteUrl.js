/**
 * 对外分享走「生产主域名」，避免分享 Vercel 单次部署域名等不稳定链接。
 *
 * 优先级：VITE_PUBLIC_SITE_URL > 构建注入（Vercel VERCEL_PROJECT_PRODUCTION_URL /
 * Netlify DEPLOY_PRIME_URL）> 当前页 origin。
 */

// eslint-disable-next-line no-undef
const INJECTED_PRODUCTION_ORIGIN = __PUBLIC_SITE_ORIGIN__;

export function getPublicSiteOrigin() {
  const manual = import.meta.env.VITE_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (manual) return manual;
  if (INJECTED_PRODUCTION_ORIGIN) return INJECTED_PRODUCTION_ORIGIN;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** 带 ?poi= 的落地页，打开后 App 会进地图并拉起抽屉 */
export function buildPoiShareUrl(poiId) {
  if (!poiId) return "";
  const base = getPublicSiteOrigin();
  if (!base) return "";
  const u = new URL("/", base);
  u.searchParams.set("poi", poiId);
  return u.toString();
}
