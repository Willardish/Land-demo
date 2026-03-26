import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function CheckInSheet({
  open,
  onClose,
  pinPosPct,
  poiTitle,
  onSave,
}) {
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!open) return;
    setFileDataUrl(null);
    setCaption("");
  }, [open]);

  const coordLabel = useMemo(() => {
    if (!pinPosPct) return "";
    return `X ${pinPosPct.xPct.toFixed(1)}% · Y ${pinPosPct.yPct.toFixed(1)}%`;
  }, [pinPosPct]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[80] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[81] max-h-[78%] overflow-y-auto rounded-t-3xl border border-black/5 bg-white/95 px-4 pb-8 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-zinc-900">
                  记录今日游玩（仅自己可见）
                </h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {poiTitle ? `地点：${poiTitle}` : "地点：未关联 POI"} · {coordLabel}
                </p>
              </div>
              <motion.button
                type="button"
                className="rounded-xl border border-black/10 p-2 bg-white/70"
                onClick={onClose}
                {...tap}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mt-4 rounded-2xl border border-black/5 bg-zinc-50/60 p-3">
              <p className="mb-2 text-xs font-black text-zinc-700">
                1) 选择照片（支持拍照/上传）
              </p>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/85 py-3 text-sm font-black text-zinc-800 shadow-sm backdrop-blur-md">
                <ImagePlus className="h-5 w-5 text-[#ff2442]" />
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setFileDataUrl(String(reader.result || ""));
                    };
                    reader.readAsDataURL(f);
                  }}
                />
              </label>

              {fileDataUrl && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white/90">
                  <img
                    src={fileDataUrl}
                    alt="preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-black text-zinc-700">
                2) 写一句打卡心情（可选）
              </p>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="例如：灯光太会了！"
                className="w-full rounded-2xl border border-black/10 bg-white/80 p-3 text-sm font-semibold text-zinc-800 outline-none"
                rows={3}
              />
            </div>

            <motion.button
              type="button"
              disabled={!fileDataUrl || !pinPosPct}
              onClick={() => {
                if (!fileDataUrl || !pinPosPct) return;
                onSave?.({
                  pinPosPct,
                  fileDataUrl,
                  caption,
                });
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2442] py-3 text-sm font-black text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              {...tap}
            >
              保存打卡
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

