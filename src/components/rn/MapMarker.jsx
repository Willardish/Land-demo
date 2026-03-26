import { useRef } from "react";
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

export function MapMarker({
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

  return (
    <motion.div
      className="absolute z-[65] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${poi.pos.xPct}%`, top: `${poi.pos.yPct}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={springIn}
    >
      <motion.button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
          clearTimer();
          longArmed.current = false;
          timer.current = setTimeout(() => {
            timer.current = null;
            longArmed.current = true;
            onLongPress(poi.id);
          }, 520);
        }}
        onPointerUp={() => {
          clearTimer();
          if (!longArmed.current) onShortPress(poi.id);
          longArmed.current = false;
        }}
        onPointerCancel={() => {
          clearTimer();
          longArmed.current = false;
        }}
        onPointerLeave={clearTimer}
        className={`flex items-center gap-0.5 rounded-full border border-white/80 bg-white/95 text-left shadow-lg backdrop-blur-md ${
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
