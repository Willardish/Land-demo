import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function ListViewPanel({ pois, selectedId, onSelect }) {
  return (
    <div className="h-full overflow-y-auto rn-scroll px-1 pb-4 pt-[calc(58px+1cm+3.25rem)]">
      <AnimatePresence mode="popLayout">
        {pois.map((poi) => (
          <motion.button
            key={poi.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => onSelect(poi.id)}
            className={`mb-2 flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left shadow-sm backdrop-blur-md ${
              selectedId === poi.id
                ? "border-[#ff2442]/35 bg-[#ff2442]/8"
                : "border-black/5 bg-white/80"
            }`}
            {...tap}
          >
            <div>
              <p className="text-sm font-black text-zinc-900">{poi.title}</p>
              <p className="text-[11px] font-semibold text-zinc-500">
                {poi.area} · {poi.category}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[#ff2442]">
              <Star className="h-4 w-4 fill-[#ff2442]" strokeWidth={0} />
              <span className="text-sm font-black">{poi.rating.toFixed(1)}</span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
