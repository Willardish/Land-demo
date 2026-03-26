import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const INITIAL_SEC = 5 * 60;

export function LiveHelpPin({ pin, onOpen, mapZoom = 1 }) {
  const [left, setLeft] = useState(INITIAL_SEC);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((s) => (s <= 0 ? INITIAL_SEC : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const counterScale = 1 / Math.max(0.001, mapZoom);

  return (
    <div
      className="absolute z-[55] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pin.pos.xPct}%`, top: `${pin.pos.yPct}%` }}
    >
      <motion.button
        type="button"
        onClick={() => onOpen?.(pin)}
        onPointerDown={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-0.5"
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
