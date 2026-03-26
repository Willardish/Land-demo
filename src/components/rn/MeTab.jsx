import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, MapPin } from "lucide-react";
import { useState } from "react";
import { tap } from "../../lib/motionPresets.js";
import { MeJourneyMap } from "./MeJourneyMap.jsx";

export function MeTab({
  footprintOn,
  onToggleFootprint,
  onOpenPost,
  checkIns,
  planStopsOrder,
}) {
  const [journeyOpen, setJourneyOpen] = useState(false);

  return (
    <div className="flex h-full flex-col px-2 pt-2">
      <h2 className="text-xl font-black text-zinc-900">我的</h2>
      <p className="mt-1 text-sm font-medium text-zinc-500">
        足迹与笔记草稿（乐园模式）
      </p>
      <div className="mt-6 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-zinc-900">
              记录今日游玩（仅自己可见）
            </p>
            <p className="text-xs font-medium text-zinc-500">
              在地图上显示虚线路径（模拟）
            </p>
          </div>
          <motion.button
            type="button"
            onClick={onToggleFootprint}
            className={`rounded-full px-4 py-2 text-xs font-black ${
              footprintOn
                ? "bg-[#ff2442] text-white"
                : "bg-zinc-100 text-zinc-600"
            }`}
            {...tap}
          >
            {footprintOn ? "停止" : "开始"}
          </motion.button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setJourneyOpen((v) => !v)}
        className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md"
      >
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 text-[#ff2442]" strokeWidth={2.2} />
          <div className="min-w-0 text-left">
            <p className="text-sm font-black text-zinc-900">我的足迹</p>
            <p className="mt-0.5 text-xs font-semibold text-zinc-500">
              仅展示游览计划POI + 照片打卡POI
            </p>
          </div>
        </div>
        <ChevronRight
          className={`h-5 w-5 text-zinc-400 transition ${journeyOpen ? "rotate-90" : ""}`}
          strokeWidth={2.2}
        />
      </button>

      <AnimatePresence>
        {journeyOpen && (
          <div className="mt-3 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-md">
            <MeJourneyMap
              planStopsOrder={planStopsOrder}
              checkIns={checkIns}
            />

            <motion.button
              type="button"
              onClick={onOpenPost}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff2442] to-[#ff5a73] py-4 text-sm font-black text-white shadow-lg"
              {...tap}
            >
              <FileText className="h-5 w-5" />
              生成游玩笔记
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-4 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-zinc-900">打卡照片（{checkIns?.length || 0}）</p>
          <span className="rounded-full bg-[#ff2442]/10 px-2 py-0.5 text-[10px] font-black text-[#ff2442]">
            与足迹串联
          </span>
        </div>

        {(!checkIns || checkIns.length === 0) && (
          <p className="mt-2 text-xs font-semibold text-zinc-500">
            长按地图任意位置，上传一张照片就会出现在这里。
          </p>
        )}

        {checkIns && checkIns.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {checkIns.slice(-9).map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white"
              >
                <img
                  src={c.imgDataUrl}
                  alt="check-in"
                  className="h-20 w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
