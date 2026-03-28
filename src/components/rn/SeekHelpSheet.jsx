import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

const DURATION_OPTIONS = [
  { sec: 5 * 60, label: "5 分钟" },
  { sec: 15 * 60, label: "15 分钟" },
  { sec: 30 * 60, label: "30 分钟" },
];

function pickDurationFromExpiry(expiresAtMs) {
  if (expiresAtMs == null || !Number.isFinite(expiresAtMs)) {
    return DURATION_OPTIONS[0].sec;
  }
  const remSec = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
  let best = DURATION_OPTIONS[0];
  let bestD = Infinity;
  for (const o of DURATION_OPTIONS) {
    const d = Math.abs(o.sec - remSec);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return best.sec;
}

export function SeekHelpSheet({
  open,
  onClose,
  poiTitle,
  pinPosPct,
  onSubmit,
  editingPin,
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [durationSec, setDurationSec] = useState(DURATION_OPTIONS[0].sec);

  const isEdit = Boolean(editingPin?.id);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setTitle(editingPin.title || "");
      setBody(editingPin.body || "");
      setDurationSec(pickDurationFromExpiry(editingPin.expiresAtMs));
      return;
    }
    setTitle("");
    setBody("");
    setDurationSec(DURATION_OPTIONS[0].sec);
  }, [
    open,
    isEdit,
    editingPin?.id,
    editingPin?.title,
    editingPin?.body,
    editingPin?.expiresAtMs,
  ]);

  const canSubmit = isEdit
    ? title.trim().length > 0 && body.trim().length > 0
    : Boolean(pinPosPct) &&
      title.trim().length > 0 &&
      body.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[84] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[85] max-h-[82%] overflow-y-auto rounded-t-3xl border border-black/5 bg-white/95 px-4 pb-8 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
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
                  {isEdit ? "编辑求助" : "找搭子 / 求助"}
                </h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {isEdit
                    ? "可改标题、描述与有效时间；保存后倒计时从当前时刻重新计算（Mock）"
                    : `将展示在实况「用户求助」中 · ${poiTitle || "地图选点"}`}
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

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-black text-zinc-700">标题</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：求拍照搭子、多买了一份小食"
                  className="w-full rounded-2xl border border-black/10 bg-white/85 px-3 py-2.5 text-sm font-semibold text-zinc-800 outline-none"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-black text-zinc-700">
                  具体描述
                </p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="说明地点特征、时间、怎么联系（Mock）"
                  rows={4}
                  className="w-full rounded-2xl border border-black/10 bg-white/85 p-3 text-sm font-semibold text-zinc-800 outline-none"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-black text-zinc-700">
                  内容有效时间
                </p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.sec}
                      type="button"
                      onClick={() => setDurationSec(opt.sec)}
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${
                        durationSec === opt.sec
                          ? "border border-[#ff2442]/35 bg-[#ff2442]/15 text-[#ff2442] shadow-sm"
                          : "border border-black/10 bg-white text-zinc-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] font-semibold text-zinc-500">
                  {isEdit
                    ? "修改有效时间后，从点击保存起重新倒计时"
                    : "倒计时结束后 pin 会从地图隐藏（与实况求助一致）"}
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                if (isEdit) {
                  onSubmit?.({
                    editId: editingPin.id,
                    title: title.trim(),
                    body: body.trim(),
                    durationSec,
                  });
                  return;
                }
                if (!pinPosPct) return;
                onSubmit?.({
                  title: title.trim(),
                  body: body.trim(),
                  durationSec,
                  pinPosPct,
                });
              }}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#ff2442] py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
              {...tap}
            >
              {isEdit ? "保存" : "发布到实况"}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
