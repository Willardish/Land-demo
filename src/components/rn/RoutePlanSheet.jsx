import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles, Trash2, VolumeX, X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";
import { POIS } from "../../data/poisData.js";

function poiById(id) {
  return POIS.find((p) => p.id === id) || null;
}

export function RoutePlanSheet({
  open,
  onClose,
  planStopsOrder,
  generatedRoutes,
  onGenerateRoutes,
  routeGenerating,
  onSilentNav,
  onEditRoute,
  onRemoveStop,
}) {
  const [tab, setTab] = useState("selected");
  const [routeExpanded, setRouteExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setTab("selected");
      setRouteExpanded(false);
    }
  }, [open]);

  const selectedRows = useMemo(() => {
    return planStopsOrder.map((id) => ({
      id,
      title: poiById(id)?.title || id,
    }));
  }, [planStopsOrder]);

  const singleRoute = generatedRoutes[0] || null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[55] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[56] max-h-[78%] overflow-y-auto rounded-t-3xl border border-black/5 bg-white/95 p-4 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-zinc-900">游览计划</h3>
              <motion.button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-black/10 p-2"
                {...tap}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                onClick={() => setTab("selected")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${
                  tab === "selected"
                    ? "bg-[#ff2442]/12 text-[#ff2442] ring-1 ring-[#ff2442]/30"
                    : "bg-white/70 text-zinc-700"
                }`}
                {...tap}
              >
                已加入（{planStopsOrder.length}）
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setTab("routes")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${
                  tab === "routes"
                    ? "bg-[#ff2442]/12 text-[#ff2442] ring-1 ring-[#ff2442]/30"
                    : "bg-white/70 text-zinc-700"
                }`}
                {...tap}
              >
                路线列表（{generatedRoutes.length}）
              </motion.button>
            </div>

            {tab === "selected" && (
              <>
                <p className="mb-3 text-xs font-semibold text-zinc-500">
                  长按地图 POI 多选，或详情页加入；可删除已选。
                </p>

                {planStopsOrder.length === 0 ? (
                  <div className="rounded-2xl border border-black/5 bg-zinc-50/90 p-3 text-xs font-semibold text-zinc-500">
                    还没有加入 POI。
                  </div>
                ) : (
                  <ul className="mb-4 space-y-2">
                    {selectedRows.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-black/5 bg-white/80 px-3 py-2"
                      >
                        <span className="text-sm font-bold text-zinc-900">
                          {row.title}
                        </span>
                        <motion.button
                          type="button"
                          aria-label="删除"
                          onClick={() => onRemoveStop?.(row.id)}
                          className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#ff2442]"
                          {...tap}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                )}

                <motion.button
                  type="button"
                  disabled={planStopsOrder.length === 0 || routeGenerating}
                  onClick={() => {
                    onGenerateRoutes?.();
                    setTab("routes");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff2442]/30 bg-[#ff2442]/10 py-3 text-xs font-black text-[#ff2442] disabled:cursor-not-allowed disabled:opacity-50"
                  {...tap}
                >
                  {routeGenerating ? (
                    <>生成中…</>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      一键生成路线建议
                    </>
                  )}
                </motion.button>
              </>
            )}

            {tab === "routes" && (
              <>
                {routeGenerating && (
                  <div className="mb-3 rounded-2xl border border-[#ff2442]/20 bg-[#ff2442]/5 px-3 py-2 text-center text-xs font-bold text-[#ff2442]">
                    AI 正在根据已选 POI 计算动线…
                  </div>
                )}
                {!singleRoute && !routeGenerating ? (
                  <div className="rounded-2xl border border-black/5 bg-zinc-50/90 p-3 text-xs font-semibold text-zinc-500">
                    暂无路线：在「已加入」里点击「一键生成路线建议」。
                  </div>
                ) : singleRoute ? (
                  <div className="rounded-2xl border border-black/5 bg-zinc-50/90 p-3">
                    <button
                      type="button"
                      onClick={() => setRouteExpanded((v) => !v)}
                      className="flex w-full items-start justify-between gap-2 text-left"
                    >
                      <div>
                        <p className="font-black text-zinc-900">
                          {singleRoute.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-zinc-500">
                          {singleRoute.desc}
                        </p>
                        <p className="mt-2 text-[11px] font-bold text-[#ff2442]">
                          {singleRoute.eta}
                        </p>
                      </div>
                      {routeExpanded ? (
                        <ChevronUp className="h-5 w-5 shrink-0 text-zinc-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                      )}
                    </button>

                    {routeExpanded && (
                      <ol className="mt-3 space-y-1 border-t border-black/5 pt-3 text-sm font-semibold text-zinc-800">
                        {(singleRoute.stops || []).map((sid, i) => (
                          <li key={sid} className="flex gap-2">
                            <span className="text-[#ff2442]">{i + 1}.</span>
                            <span>{poiById(sid)?.title || sid}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <motion.button
                        type="button"
                        onClick={() => onEditRoute(singleRoute)}
                        className="rounded-2xl border border-black/10 bg-white py-2 text-xs font-black text-zinc-800"
                        {...tap}
                      >
                        再编辑
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => onSilentNav(singleRoute)}
                        className="flex items-center justify-center gap-1 rounded-2xl border border-black/10 bg-[#ff2442]/10 py-2 text-xs font-black text-[#ff2442]"
                        {...tap}
                      >
                        <VolumeX className="h-3.5 w-3.5" />
                        静默导航
                      </motion.button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
