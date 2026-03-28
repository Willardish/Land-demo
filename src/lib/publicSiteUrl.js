/**
 * 对外分享请始终走「项目生产域名」，不要用 Vercel 单次部署域名（*-xxxx-*.vercel.app），
 * 在国内网络下常会 ERR_CONNECTION_TIMED_OUT。
 *
 * 优先级：VITE_PUBLIC_SITE_URL（手动）> 构建时注入的生产域名（Vercel VERCEL_PROJECT_PRODUCTION_URL）> 当前页 origin。
 */

// 由 vite.config.js `define` 注入；本地构建为空字符串
// eslint-disable-next-line no-undef
const INJECTED_PRODUCTION_ORIGIN = __VERCEL_PRODUCTION_ORIGIN__;

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
