import { motion } from "framer-motion";
import { Waypoints } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function RoutePlanFab({ onOpen, className = "" }) {
  return (
    <motion.button
      type="button"
      aria-label="游览计划"
      onClick={onOpen}
      className={`absolute bottom-[100px] right-4 z-[42] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-[#ff2442] shadow-lg backdrop-blur-md ${className}`}
      {...tap}
    >
      <Waypoints className="h-5 w-5" strokeWidth={2.4} />
    </motion.button>
  );
}
