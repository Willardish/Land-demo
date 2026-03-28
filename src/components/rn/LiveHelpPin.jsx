import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const LOOP_SEC = 5 * 60;

function secondsLeftForPin(pin) {
  if (pin.expiresAtMs != null) {
    return Math.max(0, Math.ceil((pin.expiresAtMs - Date.now()) / 1000));
  }
  return LOOP_SEC;
}

function LiveHelpPinComponent({ pin, onOpen, mapZoom = 1, onExpired }) {
  const [left, setLeft] = useState(() => secondsLeftForPin(pin));

  useEffect(() => {
    setLeft(secondsLeftForPin(pin));
  }, [pin.id, pin.expiresAtMs]);

  useEffect(() => {
    if (pin.expiresAtMs != null) {
      const tick = () => {
        const next = secondsLeftForPin(pin);
        setLeft(next);
        if (next <= 0) onExpired?.(pin.id);
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }

    const id = setInterval(() => {
      setLeft((s) => (s <= 0 ? LOOP_SEC : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [pin.id, pin.expiresAtMs, onExpired]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const counterScale = 1 / Math.max(0.001, mapZoom);

  if (pin.expiresAtMs != null && left <= 0) return null;

  return (
    <div
      className="pointer-events-none absolute z-[55] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pin.pos.xPct}%`, top: `${pin.pos.yPct}%` }}
    >
      <motion.button
        type="button"
        onClick={() => onOpen?.(pin)}
        onPointerDown={(e) => e.stopPropagation()}
        className="pointer-events-auto touch-manipulation flex flex-col items-center gap-0.5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 480, damping: 28 }}
      >
        <div
          style={{
            transform: `scale(${counterScale})`,
            transformOrigin: "center",
          }}
          className="flex flex-col items-center gap-0.5"
        >
          <span className="flex max-w-[120px] items-center gap-1 rounded-full border border-dashed border-[#ff2442]/50 bg-white/95 px-2 py-1 text-[10px] font-bold text-zinc-800 shadow-md backdrop-blur-md">
            <Users className="h-3 w-3 shrink-0 text-[#ff2442]" strokeWidth={2.5} />
            <span className="truncate">{pin.title}</span>
          </span>
          <span className="rounded-full bg-[#ff2442] px-2 py-0.5 text-[9px] font-black tabular-nums text-white shadow-sm">
            {mm}:{ss}
          </span>
        </div>
      </motion.button>
    </div>
  );
}

export const LiveHelpPin = memo(LiveHelpPinComponent, (prev, next) => {
  return (
    prev.pin === next.pin &&
    prev.onOpen === next.onOpen &&
    prev.mapZoom === next.mapZoom &&
    prev.onExpired === next.onExpired
  );
});
