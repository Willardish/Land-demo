import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Star } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";

export function POIDrawer({ poi, onClose, onTogglePlan, isInPlan }) {
  const [waitFeedback, setWaitFeedback] = useState(null);

  useEffect(() => {
    setWaitFeedback(null);
  }, [poi?.id]);

  const waitLabel = useMemo(() => {
    if (!poi) return "";
    return poi.waitUGC > 0 ? `约 ${poi.waitUGC} 分钟` : "暂无需排队";
  }, [poi]);

  const recommendReasons = useMemo(() => (poi?.coreReasons || []).slice(0, 2), [poi]);
  const nonRecommendReasons = useMemo(() => {
    return [
      "更适合慢节奏体验，赶时间可能会觉得不够爽（Mock）",
      "人多时排队体验会波动，建议错峰（Mock）",
    ];
  }, [poi]);

  const recommendedAudience = useMemo(() => {
    const s = poi?.personaSuitability || [];
    if (s.includes("parent-child")) return "亲子友好：大人省心、孩子有参与感";
    if (s.includes("thrill")) return "刺激向：想要更强反馈就冲这个点";
    if (s.includes("chill")) return "松弛向：拍照与慢逛更契合";
    return "喜欢这条动线的人";
  }, [poi]);

  if (!poi) return null;

  return (
    <>
      <motion.button
        key="poi-bg"
        type="button"
        aria-label="关闭"
        className="absolute inset-0 z-[50] bg-black/35 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        key="poi-sheet"
        className="absolute bottom-0 left-0 right-0 z-[51] max-h-[80%] overflow-y-auto rounded-t-3xl border border-black/5 bg-white/95 px-3 pb-8 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-black text-zinc-900 truncate">
              {poi.title}
            </h2>
            <p className="mt-1 text-[11px] font-semibold text-zinc-500">
              {poi.area} · {poi.category}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[#ff2442]">
              <Star className="h-4 w-4 fill-[#ff2442]" strokeWidth={0} />
              <span className="text-[14px] font-black">
                {poi.rating.toFixed(1)}
              </span>
              <span className="text-[11px] font-black text-zinc-500">
                {poi.userRecPercent}%推荐
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full border border-[#ff2442]/30 bg-[#ff2442]/10 px-3 py-1 text-[11px] font-black text-[#ff2442]">
              预计等待：{waitLabel}
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 bg-white p-2"
              {...tap}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-[#ff2442]/20 bg-[#ff2442]/5 px-2.5 py-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-[11px] font-black text-zinc-900">
              等待还准吗？
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1">
              <motion.button
                type="button"
                className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-600 shadow-sm"
                onClick={() => setWaitFeedback("yes")}
                {...tap}
              >
                是
              </motion.button>
              <motion.button
                type="button"
                className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-zinc-600 shadow-sm"
                onClick={() => setWaitFeedback("no")}
                {...tap}
              >
                否
              </motion.button>
              <motion.button
                type="button"
                className="rounded-full bg-[#ff2442] px-2 py-1 text-[10px] font-black text-white shadow-sm"
                onClick={() => setWaitFeedback("report")}
                {...tap}
              >
                更新
              </motion.button>
            </div>
          </div>
          {waitFeedback && (
            <p className="mt-1.5 text-[10px] font-bold text-[#ff2442]">
              {waitFeedback === "yes" && "已记录"}
              {waitFeedback === "no" && "已加权样本"}
              {waitFeedback === "report" && "已打开上报（Mock）"}
            </p>
          )}
        </div>

        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3">
              <p className="text-[11px] font-black text-zinc-700">
                推荐原因
              </p>
              <ul className="mt-2 space-y-1 text-[12px] font-semibold text-zinc-800">
                {(recommendReasons || []).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-[#ff2442]">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3">
              <p className="text-[11px] font-black text-zinc-700">
                不推荐原因
              </p>
              <ul className="mt-2 space-y-1 text-[12px] font-semibold text-zinc-800">
                {nonRecommendReasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-[#ff2442]">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-zinc-600">
            推荐人群：{recommendedAudience}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-black/5 bg-white/70 p-3">
          <p className="text-[12px] font-black text-zinc-800">
            小红书精选笔记（Mock）
          </p>

          <div className="mt-3 space-y-2">
            {[
              {
                cover: "出片点位 · 傍晚更好",
                text: `“${poi.title}”真的很适合做第一张封面。`,
              },
              {
                cover: "动线建议 · 不会太累",
                text: `我按这个顺序走：拍照 + 项目一次到位。`,
              },
            ].map((n, idx) => (
              <div key={idx} className="rounded-2xl border border-black/5 bg-white p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#ff2442]/10 flex items-center justify-center text-[#ff2442] font-black text-[11px]">
                    红
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-zinc-800">
                      小红书玩家
                    </p>
                    <p className="text-[10px] font-semibold text-zinc-500">
                      SHDL 乐园攻略
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-20 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-black/5 flex items-center px-3 text-[11px] font-black text-[#ff2442]">
                  {n.cover}
                </div>
                <p className="mt-2 text-[12px] font-semibold text-zinc-800">
                  {n.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <motion.button
            type="button"
            onClick={() => onTogglePlan?.(poi.id)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black shadow-lg ${
              isInPlan
                ? "bg-white text-zinc-600 border border-black/10"
                : "bg-[#ff2442] text-white border border-[#ff2442]/40"
            }`}
            {...tap}
          >
            {isInPlan ? "已加入" : "加入游览计划"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
