import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  ChevronLeft,
  Bookmark,
  MapPin,
  Share2,
  Heart,
} from "lucide-react";
import { tap } from "../../lib/motionPresets.js";
import { getPoiGalleryItems, getPoiNoteFeedItems } from "../../data/poiNoteMedia.js";
import { PoiPlayReviews } from "./PoiPlayReviews.jsx";
import { buildPoiShareUrl } from "../../lib/publicSiteUrl.js";

const TOTAL_NOTE_COUNT = 435;

export function POIDrawer({
  poi,
  onClose,
  onTogglePlan,
  isInPlan,
}) {
  const [waitFeedback, setWaitFeedback] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [shareHint, setShareHint] = useState(null);
  /** 避免移动端「触摸打开抽屉」后，合成 click 落在遮罩上立刻关抽屉 */
  const backdropIgnoreUntilRef = useRef(0);

  useEffect(() => {
    setWaitFeedback(null);
    setNotesOpen(false);
    setShareHint(null);
    backdropIgnoreUntilRef.current = Date.now() + 550;
  }, [poi?.id]);

  const onBackdropAttemptClose = useCallback(
    (e) => {
      if (Date.now() < backdropIgnoreUntilRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClose();
    },
    [onClose]
  );

  const onShareLink = useCallback(async () => {
    const id = poi?.id;
    if (!id) return;
    const url = buildPoiShareUrl(id);
    if (!url) {
      setShareHint("无法生成链接");
      window.setTimeout(() => setShareHint(null), 2200);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareHint("已复制链接");
    } catch {
      setShareHint("复制失败，请用浏览器地址栏分享");
    }
    window.setTimeout(() => setShareHint(null), 2800);
  }, [poi?.id]);

  const waitLabel = useMemo(() => {
    if (!poi) return "";
    return poi.waitUGC > 0 ? `约 ${poi.waitUGC} 分钟` : "暂无需排队";
  }, [poi]);

  const recommendReasons = useMemo(
    () => (poi?.coreReasons || []).slice(0, 2),
    [poi]
  );
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

  const gallery = useMemo(() => (poi ? getPoiGalleryItems(poi) : []), [poi]);
  const feed = useMemo(() => (poi ? getPoiNoteFeedItems(poi) : []), [poi]);

  if (!poi) return null;

  return (
    <>
      <motion.button
        key="poi-bg"
        type="button"
        aria-label="关闭"
        className="absolute inset-0 z-[50] bg-black/35 backdrop-blur-[2px] touch-manipulation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBackdropAttemptClose}
        onTouchEnd={(e) => {
          if (Date.now() < backdropIgnoreUntilRef.current) {
            try {
              e.preventDefault();
            } catch {
              /* ignore */
            }
            e.stopPropagation();
          }
        }}
        onPointerUp={(e) => {
          if (Date.now() < backdropIgnoreUntilRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />

      <motion.div
        key="poi-sheet"
        className="absolute bottom-0 left-0 right-0 z-[51] flex max-h-[82%] flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-white/95 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        {shareHint ? (
          <div className="pointer-events-none absolute left-0 right-0 top-9 z-[60] flex justify-center px-4">
            <p className="max-w-[95%] rounded-xl bg-zinc-900/92 px-3 py-2 text-center text-[10px] font-bold leading-snug text-white shadow-lg">
              {shareHint}
            </p>
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          {notesOpen ? (
            <motion.div
              key="notes"
              className="flex min-h-0 flex-1 flex-col bg-[#f7f7f7]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="shrink-0 border-b border-black/5 bg-white px-2 pb-2 pt-2">
                <div className="flex items-center gap-1">
                  <motion.button
                    type="button"
                    aria-label="返回"
                    className="rounded-xl p-2 text-zinc-800"
                    onClick={() => setNotesOpen(false)}
                    {...tap}
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                  </motion.button>
                  <h2 className="min-w-0 flex-1 truncate text-center text-[15px] font-black text-zinc-900">
                    {poi.title}
                  </h2>
                  <div className="flex w-[72px] shrink-0 justify-end gap-0.5 pr-1">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-600"
                      aria-label="收藏"
                    >
                      <Bookmark className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-600"
                      aria-label="位置"
                    >
                      <MapPin className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-600"
                      aria-label="分享"
                      onClick={onShareLink}
                    >
                      <Share2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rn-scroll px-2 pb-8 pt-2">
                <div className="columns-2 gap-2 [column-fill:_balance]">
                  {feed.map((n) => (
                    <div
                      key={n.id}
                      className="mb-2 break-inside-avoid rounded-xl bg-white p-0 shadow-sm ring-1 ring-black/[0.04]"
                    >
                      {n.src ? (
                        <img
                          src={n.src}
                          alt=""
                          className={`w-full rounded-t-xl object-cover ${n.imgH || "min-h-[128px]"}`}
                        />
                      ) : (
                        <div
                          className={`rounded-t-xl bg-gradient-to-br ${n.g} ${n.imgH || "min-h-[128px]"} w-full`}
                        />
                      )}
                      <div className="p-2.5">
                        <p className="line-clamp-2 text-[12px] font-bold leading-snug text-zinc-900">
                          {n.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-[#ff2442]/30 to-rose-200" />
                            <span className="truncate text-[10px] font-semibold text-zinc-500">
                              {n.user}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 text-zinc-400">
                            <Heart
                              className="h-3.5 w-3.5"
                              strokeWidth={2}
                            />
                            <span className="text-[10px] font-black text-zinc-500">
                              {n.likes >= 1000
                                ? `${(n.likes / 1000).toFixed(1)}k`
                                : n.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              className="rn-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-8 pt-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-200" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-black text-zinc-900">
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
                  <div className="flex items-center gap-1">
                    <motion.button
                      type="button"
                      aria-label="分享"
                      onClick={onShareLink}
                      className="rounded-xl border border-black/10 bg-white p-2 text-zinc-700"
                      {...tap}
                    >
                      <Share2 className="h-4 w-4" strokeWidth={2} />
                    </motion.button>
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

              <PoiPlayReviews poi={poi} />

              <div className="mt-4 overflow-hidden rounded-2xl bg-[#2a2624] px-2.5 py-3">
                <p className="mb-2.5 text-[12px] font-black text-white/90">
                  小红书笔记
                </p>
                <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {gallery.map((g, idx) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setNotesOpen(true)}
                      className="relative h-[132px] w-[88px] shrink-0 overflow-hidden rounded-xl text-left ring-1 ring-white/10"
                    >
                      {g.src ? (
                        <img
                          src={g.src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${g.g}`}
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-1.5 pb-1.5 pt-6">
                        <span className="line-clamp-2 text-[9px] font-bold leading-tight text-white">
                          {g.sub}
                        </span>
                      </div>
                      {idx === gallery.length - 1 ? (
                        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur-sm">
                          共{TOTAL_NOTE_COUNT}张
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-[10px] font-semibold text-white/45">
                  左滑查看更多 · 点击进双列笔记
                </p>
              </div>

              <div className="mt-4">
                <motion.button
                  type="button"
                  onClick={() => onTogglePlan?.(poi.id)}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-black shadow-lg ${
                    isInPlan
                      ? "border-black/10 bg-white text-zinc-600"
                      : "border-[#ff2442]/40 bg-[#ff2442] text-white"
                  }`}
                  {...tap}
                >
                  {isInPlan ? "已加入" : "加入游览计划"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
