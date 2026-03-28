import { AnimatePresence, motion } from "framer-motion";
import { Camera, Users, X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function PublishChoiceSheet({
  open,
  /** Optional: when publishing from map long-press, use this line instead of poiTitle */
  subLabel,
  poiTitle,
  onClose,
  onPickCheckIn,
  onPickSeekHelp,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[82] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[83] rounded-t-3xl border border-black/5 bg-white/95 px-4 pb-8 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-zinc-900">发布</h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {subLabel ??
                    (poiTitle ? `地点：${poiTitle}` : "选择发布类型")}
                </p>
              </div>
              <motion.button
                type="button"
                className="rounded-xl border border-black/10 bg-white/70 p-2"
                onClick={onClose}
                {...tap}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mt-5 space-y-3">
              <motion.button
                type="button"
                onClick={onPickCheckIn}
                className="flex w-full items-center gap-3 rounded-2xl border border-black/8 bg-zinc-50/80 px-4 py-3 text-left shadow-sm"
                {...tap}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff2442]/10 text-[#ff2442]">
                  <Camera className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-zinc-900">
                    游玩打卡
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-zinc-500">
                    仅自己可见 · 照片与心情记录
                  </span>
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={onPickSeekHelp}
                className="flex w-full items-center gap-3 rounded-2xl border border-black/8 bg-zinc-50/80 px-4 py-3 text-left shadow-sm"
                {...tap}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff2442]/10 text-[#ff2442]">
                  <Users className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-zinc-900">
                    找搭子 / 求助
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-zinc-500">
                    发布到实况 · 带有效时间倒计时
                  </span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
