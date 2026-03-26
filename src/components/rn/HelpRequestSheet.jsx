import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function HelpRequestSheet({ open, onClose, pin, onGoChat }) {
  if (!pin) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[90] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[91] max-h-[78%] overflow-y-auto rounded-t-3xl border border-black/5 bg-white/95 px-4 pb-8 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-zinc-900">
                  {pin.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  用户求助（实况 · 5 分钟倒计时）
                </p>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-black/10 bg-white/70 p-2"
                {...tap}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mt-4 rounded-2xl border border-black/5 bg-white/70 p-3">
              <p className="text-xs font-black text-zinc-700">
                你可以：
              </p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-zinc-800">
                <li>1）直接在地图附近会合（Mock）</li>
                <li>2）点「去聊天」继续对话（Mock）</li>
              </ul>
            </div>

            <div className="mt-5">
              <motion.button
                type="button"
                onClick={() => onGoChat?.(pin.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2442] py-3 text-sm font-black text-white shadow-lg"
                {...tap}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
                去聊天
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

