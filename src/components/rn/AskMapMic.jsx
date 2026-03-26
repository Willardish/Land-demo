import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function AskMapMic({ onPress, active }) {
  return (
    <motion.button
      type="button"
      aria-label="问地图"
      onClick={onPress}
      className={`absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[44] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2442] to-[#ff5a73] text-white shadow-[0_12px_40px_rgba(255,36,66,0.45)] ring-4 ring-white/90 ${
        active ? "scale-105" : ""
      }`}
      animate={active ? { scale: [1, 1.06, 1] } : {}}
      transition={
        active
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      {...tap}
    >
      <Mic className="h-6 w-6" strokeWidth={2.4} />
    </motion.button>
  );
}
