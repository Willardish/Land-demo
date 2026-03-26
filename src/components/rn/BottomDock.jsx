import { motion } from "framer-motion";
import { Compass, User } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function BottomDock({ tab, onTab }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-white/50 bg-white/55 px-6 backdrop-blur-md">
      {[
        { id: "explore", label: "探索", Icon: Compass },
        { id: "me", label: "我的", Icon: User },
      ].map(({ id, label, Icon }) => (
        <motion.button
          key={id}
          type="button"
          onClick={() => onTab(id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            tab === id ? "text-[#ff2442]" : "text-zinc-500"
          }`}
          {...tap}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
          {label}
        </motion.button>
      ))}
    </div>
  );
}
