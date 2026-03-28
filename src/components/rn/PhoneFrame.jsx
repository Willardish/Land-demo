import { useLayoutEffect, useState, useCallback } from "react";

/** Logical screen (content) */
export const LOGICAL_PHONE_W = 390;
export const LOGICAL_PHONE_H = 844;

/**
 * Bezel + corner radius share the same scale `s` as the 390×844 canvas so the frame and UI stay one unit.
 */
const BORDER_LOGICAL = 10;
const RADIUS_LOGICAL = 44;

const OUTER_W = LOGICAL_PHONE_W + 2 * BORDER_LOGICAL;
const OUTER_H = LOGICAL_PHONE_H + 2 * BORDER_LOGICAL;

const SLOT_MARGIN = 0.95;

/** Viewport margin (CSS px) around the phone when fitting */
const VIEW_MARGIN = 16;

/** Cap scale on very wide/tall monitors (optional safety) */
const S_CAP = 6;

/**
 * Fit the phone using the **layout viewport** (innerWidth / innerHeight), not visualViewport.
 *
 * - Pinch / trackpad zoom mostly changes visualViewport while layout inner often stays the same.
 *   If we read visualViewport and refit on every vv resize, we shrink `s` and cancel the user's zoom.
 * - Browser "page zoom" (Ctrl +/-) changes the layout viewport size; resize fires → we refit so the
 *   demo still fits that new layout box (browser also magnifies, so this stays coherent).
 */
function readAvailFromLayout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    w: Math.max(0, w - VIEW_MARGIN * 2),
    h: Math.max(0, h - VIEW_MARGIN * 2),
  };
}

export function PhoneFrame({ children }) {
  const [m, setM] = useState(() => {
    const s = 0.35;
    return {
      s,
      borderPx: BORDER_LOGICAL * s,
      radiusPx: RADIUS_LOGICAL * s,
      innerW: LOGICAL_PHONE_W * s,
      innerH: LOGICAL_PHONE_H * s,
      shellW: OUTER_W * s,
      shellH: OUTER_H * s,
    };
  });

  /** Bumps when visual viewport moves/resizes so scroll-area math re-runs (does not change `s`). */
  const [visualScrollRev, setVisualScrollRev] = useState(0);
  const bumpVisualScroll = useCallback(() => {
    setVisualScrollRev((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    let lastIw = null;
    let lastIh = null;

    const applyFit = () => {
      const { w: availW, h: availH } = readAvailFromLayout();
      if (availW < 32 || availH < 32) return;

      let s = Math.min(availW / OUTER_W, availH / OUTER_H) * SLOT_MARGIN;
      if (!Number.isFinite(s) || s <= 0) s = 0.1;
      s = Math.min(s, S_CAP);

      const borderPx = BORDER_LOGICAL * s;
      const radiusPx = RADIUS_LOGICAL * s;
      const innerW = LOGICAL_PHONE_W * s;
      const innerH = LOGICAL_PHONE_H * s;
      const shellW = OUTER_W * s;
      const shellH = OUTER_H * s;

      setM((prev) => {
        if (
          Math.abs(prev.s - s) < 0.002 &&
          Math.abs(prev.shellW - shellW) < 0.5
        ) {
          return prev;
        }
        return { s, borderPx, radiusPx, innerW, innerH, shellW, shellH };
      });
    };

    const refitIfLayoutViewportChanged = () => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      if (
        lastIw != null &&
        lastIh != null &&
        Math.abs(iw - lastIw) < 0.5 &&
        Math.abs(ih - lastIh) < 0.5
      ) {
        return;
      }
      lastIw = iw;
      lastIh = ih;
      applyFit();
    };

    const onWinResize = () => {
      bumpVisualScroll();
      refitIfLayoutViewportChanged();
    };

    refitIfLayoutViewportChanged();
    bumpVisualScroll();
    window.addEventListener("resize", onWinResize);

    const vv = window.visualViewport;
    const onVvResize = () => {
      bumpVisualScroll();
      // iOS / some browsers: address bar show/hide changes innerHeight without window "resize".
      // Only refit `s` when layout inner actually changes — ignore pure pinch (vv shrinks, inner same).
      refitIfLayoutViewportChanged();
    };
    const onVvScroll = () => {
      bumpVisualScroll();
    };
    vv?.addEventListener("resize", onVvResize);
    vv?.addEventListener("scroll", onVvScroll);

    const t = window.setTimeout(() => {
      bumpVisualScroll();
      refitIfLayoutViewportChanged();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onWinResize);
      vv?.removeEventListener("resize", onVvResize);
      vv?.removeEventListener("scroll", onVvScroll);
    };
  }, [bumpVisualScroll]);

  const { s, borderPx, radiusPx, innerW, innerH, shellW, shellH } = m;

  const shadowY = Math.max(1, Math.round(28 * s));
  const shadowBlur = Math.max(2, Math.round(90 * s));
  const shadowSpread = Math.round(-16 * s);

  const pad = 32;

  const iw = typeof window !== "undefined" ? window.innerWidth : 0;
  const ih = typeof window !== "undefined" ? window.innerHeight : 0;
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  const vvW = vv?.width ?? iw;
  const vvH = vv?.height ?? ih;

  /**
   * Compare **visual** viewport to shell + padding. When pinch/zoom shrinks the visible pane but
   * layout (and `s`) stay the same, grow the document by the overflow so html/body scrollbars return.
   * Layout-only checks (`shell > innerWidth`) always fail after a layout fit — that was hiding bars.
   */
  const overW =
    iw > 0
      ? Math.max(0, shellW + pad - vvW, shellW + pad - iw)
      : 0;
  const overH =
    ih > 0
      ? Math.max(0, shellH + pad - vvH, shellH + pad - ih)
      : 0;

  const scrollMinW =
    overW > 0.5 ? `${Math.ceil(iw + overW)}px` : "100%";
  const scrollMinH =
    overH > 0.5 ? `${Math.ceil(ih + overH)}px` : "100dvh";

  return (
    <div
      className="flex w-full flex-none flex-col"
      data-visual-scroll-rev={visualScrollRev}
      style={{
        boxSizing: "border-box",
        minHeight: "100dvh",
        minWidth: "100%",
      }}
    >
      <div
        className="rn-demo-root flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-rose-50/40 p-3"
        style={{
          boxSizing: "border-box",
          minWidth: scrollMinW,
          minHeight: scrollMinH,
        }}
      >
        <div
          className="relative flex shrink-0 flex-col overflow-hidden bg-white"
          style={{
            width: shellW,
            height: shellH,
            boxSizing: "border-box",
            borderRadius: radiusPx,
            border: `${borderPx}px solid rgb(24 24 27)`,
            boxShadow: `0 ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,0.28)`,
          }}
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-white">
            <div
              className="shrink-0 overflow-hidden bg-white"
              style={{
                width: innerW,
                height: innerH,
                boxSizing: "border-box",
              }}
            >
              <div
                className="relative flex min-h-0 w-[390px] flex-col overflow-hidden bg-white"
                style={{
                  height: LOGICAL_PHONE_H,
                  transform: `scale(${s})`,
                  transformOrigin: "top left",
                }}
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-2 z-50 -translate-x-1/2 rounded-b-2xl bg-black/90"
                  style={{
                    height: 28,
                    width: 120,
                  }}
                  aria-hidden
                />
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
