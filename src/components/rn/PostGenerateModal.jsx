import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function PostGenerateModal({ open, onClose, onGenerate, preview }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute left-3 right-3 top-[8%] z-[71] max-h-[84%] overflow-y-auto rounded-3xl border border-black/5 bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-black/5 p-4">
              <h3 className="text-base font-black">生成小红书笔记</h3>
              <motion.button type="button" onClick={onClose} className="p-2" {...tap}>
                <X className="h-5 w-5" />
              </motion.button>
            </div>
            {!preview ? (
              <div className="space-y-3 p-4">
                <p className="text-sm font-semibold text-zinc-600">
                  选择一种笔记气质（Mock 双样式）
                </p>
                <motion.button
                  type="button"
                  onClick={() => onGenerate("guide")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-zinc-50 p-4 text-left"
                  {...tap}
                >
                  <BookOpen className="h-8 w-8 text-[#ff2442]" />
                  <div>
                    <p className="font-black text-zinc-900">攻略类笔记</p>
                    <p className="text-xs text-zinc-500">动线 · 排队 · 评分 · Tips</p>
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => onGenerate("story")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-zinc-50 p-4 text-left"
                  {...tap}
                >
                  <Heart className="h-8 w-8 text-[#ff2442]" />
                  <div>
                    <p className="font-black text-zinc-900">心情记录类笔记</p>
                    <p className="text-xs text-zinc-500">情绪 · 光影 · 照片位 · 碎碎念</p>
                  </div>
                </motion.button>
              </div>
            ) : (
              <div className="p-4">
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-white">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-r from-pink-100 to-rose-100 text-sm font-black text-[#ff2442]">
                    {preview.title}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-zinc-500">{preview.sub}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {preview.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#ff2442]/10 px-2 py-0.5 text-[11px] font-bold text-[#ff2442]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-4 space-y-2 text-sm font-medium text-zinc-800">
                      {preview.bullets.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full rounded-2xl bg-zinc-900 py-3 text-sm font-black text-white"
                  {...tap}
                >
                  关闭
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
