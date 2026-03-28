import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

function isUserHelpPin(pin) {
  return Boolean(pin?.id && String(pin.id).startsWith("uhelp-"));
}

export function HelpRequestSheet({
  open,
  onClose,
  pin,
  onGoChat,
  onEditOwn,
  onDeleteOwn,
  onResolveOwn,
}) {
  if (!pin) return null;

  const own = isUserHelpPin(pin);

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
                  {own
                    ? "我发布的求助（可编辑、删除或标记已解决）"
                    : "用户求助（实况 · 倒计时）"}
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

            {pin.body ? (
              <div className="mt-4 rounded-2xl border border-black/5 bg-zinc-50/80 p-3">
                <p className="text-[11px] font-black text-zinc-500">详情</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-zinc-800">
                  {pin.body}
                </p>
              </div>
            ) : null}

            {own ? (
              <div className="mt-5 grid grid-cols-3 gap-1.5">
                <motion.button
                  type="button"
                  onClick={() => onResolveOwn?.(pin)}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-2.5 text-[11px] font-black text-emerald-700 shadow-sm"
                  {...tap}
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />
                  已解决
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => onEditOwn?.(pin)}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-black/10 bg-white py-2.5 text-[11px] font-black text-zinc-800 shadow-sm"
                  {...tap}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2.4} />
                  编辑
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => onDeleteOwn?.(pin)}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-red-200 bg-red-50 py-2.5 text-[11px] font-black text-red-600 shadow-sm"
                  {...tap}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.4} />
                  删除
                </motion.button>
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-black/5 bg-white/70 p-3">
                  <p className="text-xs font-black text-zinc-700">你可以：</p>
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
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
