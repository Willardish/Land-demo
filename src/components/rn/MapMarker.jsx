import { memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Package,
  Landmark,
  Mountain,
  Heart,
  Anchor,
  Droplets,
  UtensilsCrossed,
  Camera,
  Sparkles,
  MapPin,
  Star,
} from "lucide-react";
import { springIn } from "../../lib/motionPresets.js";

const ICONS = {
  Zap,
  Package,
  Landmark,
  Mountain,
  Heart,
  Anchor,
  Droplets,
  UtensilsCrossed,
  Camera,
  Sparkles,
  MapPin,
  Star,
};

function MapMarkerComponent({
  poi,
  liveOn,
  liveShowQueue = false,
  compact,
  mapZoom = 1,
  selectedRoute,
  onShortPress,
  onLongPress,
}) {
  const queueWaitVisual =
    Boolean(liveOn && liveShowQueue && (poi.waitUGC || 0) > 0);
  const timer = useRef(null);
  const longArmed = useRef(false);
  const shortHandled = useRef(false);
  const didLongPressRef = useRef(false);
  /** 手机 Web：用 touch 序列打开 POI，并在 touchend preventDefault，避免合成 click 点到遮罩关抽屉 */
  const touchStartRef = useRef(null);
  const Icon = ICONS[poi.iconKey] || MapPin;
  // Map layer is scaled by parent (`userZoom` / `SILENT_SCALE`).
  // We apply inverse scaling so the label size stays roughly constant on screen.
  const counterScale = 1 / Math.max(0.001, mapZoom);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const armLongPress = () => {
    clearTimer();
    longArmed.current = false;
    didLongPressRef.current = false;
    timer.current = setTimeout(() => {
      timer.current = null;
      longArmed.current = true;
      didLongPressRef.current = true;
      onLongPress(poi.id);
    }, 520);
  };

  return (
    <motion.div
      className="pointer-events-none absolute z-[65] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${poi.pos.xPct}%`, top: `${poi.pos.yPct}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={springIn}
    >
      <motion.button
        type="button"
        onTouchStart={(e) => {
          e.stopPropagation();
          if (e.touches.length !== 1) return;
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
          shortHandled.current = false;
          armLongPress();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          clearTimer();
          const start = touchStartRef.current;
          const t = e.changedTouches[0];
          touchStartRef.current = null;
          if (!t || !start) {
            longArmed.current = false;
            didLongPressRef.current = false;
            return;
          }
          const moved = Math.hypot(t.clientX - start.x, t.clientY - start.y);
          if (moved > 14) {
            longArmed.current = false;
            didLongPressRef.current = false;
            return;
          }
          const longDone = didLongPressRef.current;
          didLongPressRef.current = false;
          longArmed.current = false;
          if (!longDone) {
            try {
              e.preventDefault();
            } catch {
              /* passive 环境下可能无效，POIDrawer 仍有遮罩防抖 */
            }
            shortHandled.current = true;
            onShortPress(poi.id);
          }
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          touchStartRef.current = null;
          clearTimer();
          longArmed.current = false;
          didLongPressRef.current = false;
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (e.pointerType === "touch") return;
          if (e.button !== 0) return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
          shortHandled.current = false;
          armLongPress();
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "touch") return;
          e.stopPropagation();
          clearTimer();
          if (!longArmed.current && !shortHandled.current) {
            shortHandled.current = true;
            onShortPress(poi.id);
          }
          longArmed.current = false;
          try {
            if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {
            /* ignore */
          }
        }}
        onPointerCancel={(e) => {
          if (e.pointerType === "touch") return;
          e.stopPropagation();
          clearTimer();
          longArmed.current = false;
          try {
            if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {
            /* ignore */
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") clearTimer();
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (shortHandled.current) {
            shortHandled.current = false;
            return;
          }
          clearTimer();
          if (didLongPressRef.current) {
            didLongPressRef.current = false;
            longArmed.current = false;
            return;
          }
          shortHandled.current = true;
          onShortPress(poi.id);
        }}
        className={`pointer-events-auto touch-manipulation flex min-h-11 min-w-11 items-center gap-0.5 rounded-full border border-white/80 bg-white/95 text-left shadow-lg backdrop-blur-md ${
          compact
            ? "max-w-[104px] py-0.5 pl-0.5 pr-1.5"
            : "max-w-[140px] py-1 pl-1 pr-2.5"
        } ${selectedRoute ? "ring-2 ring-[#ff2442] ring-offset-1" : ""}`}
        style={{
          transform: `scale(${counterScale})`,
          transformOrigin: "center",
        }}
      >
        <span className="flex items-center gap-0.5">
          <span
            className={`flex shrink-0 items-center justify-center rounded-full ${
              queueWaitVisual
                ? "bg-sky-100 text-sky-600"
                : "bg-[#ff2442]/10 text-[#ff2442]"
            } ${compact ? "h-5 w-5" : "h-6 w-6"}`}
          >
            <Icon
              className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
              strokeWidth={2.4}
            />
          </span>
          <span
            className={`truncate font-bold tracking-tight text-zinc-900 ${
              compact ? "text-[9px]" : "text-[11px]"
            }`}
          >
            {poi.title}
          </span>
          <AnimatePresence>
            {liveOn && poi.waitUGC > 0 && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={`ml-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black text-white ${
                  queueWaitVisual ? "bg-sky-500" : "bg-[#ff2442]"
                }`}
              >
                {poi.waitUGC}′
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </motion.div>
  );
}

export const MapMarker = memo(MapMarkerComponent, (prev, next) => {
  return (
    prev.poi === next.poi &&
    prev.liveOn === next.liveOn &&
    prev.liveShowQueue === next.liveShowQueue &&
    prev.compact === next.compact &&
    prev.mapZoom === next.mapZoom &&
    prev.selectedRoute === next.selectedRoute &&
    prev.onShortPress === next.onShortPress &&
    prev.onLongPress === next.onLongPress
  );
});
