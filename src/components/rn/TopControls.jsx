import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Radio } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";
import { POI_CATEGORIES, PERSONAS } from "../../data/poisData.js";

export function TopControls({
  viewMode,
  onViewMode,
  activeCategories,
  onToggleCategory,
  persona,
  onPersona,
  liveOn,
  onToggleLive,
  liveShowQueue,
  liveShowUser,
  onToggleLiveQueue,
  onToggleLiveUser,
  menuOpen,
  onMenuOpen,
  /** Map 页顶栏上方有搜索条时整体上移 */
  withMapSearch = false,
}) {
  return (
    <div
      className={`pointer-events-none absolute left-2.5 right-2.5 z-50 shrink-0 ${
        withMapSearch
          ? "top-[calc(58px+1cm)]"
          : "top-[calc(52px+1cm)]"
      }`}
    >
      <div>
        <div className="pointer-events-none flex w-full items-center gap-2">
          <div className="pointer-events-auto flex min-w-0 w-max max-w-[calc(100%-5.5rem)] flex-nowrap items-stretch gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-[100px] shrink-0 rounded-2xl border border-black/5 bg-white/75 p-0.5 shadow-sm backdrop-blur-md">
            {["map", "list"].map((m) => (
              <motion.button
                key={m}
                type="button"
                onClick={() => onViewMode(m)}
                className={`flex-1 rounded-lg py-1.5 text-center text-[10px] font-black ${
                  viewMode === m
                    ? "bg-[#ff2442]/12 text-[#ff2442]"
                    : "text-zinc-500"
                }`}
                {...tap}
              >
                {m === "map" ? "Map" : "List"}
              </motion.button>
            ))}
          </div>

          {!liveOn && (
            <>
              <motion.button
                type="button"
                onClick={() => onMenuOpen(menuOpen === "cat" ? null : "cat")}
                className="relative flex h-[32px] min-w-[4.75rem] shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/75 px-2 py-0 pr-6 text-[10px] font-black text-zinc-800 shadow-sm backdrop-blur-md"
                {...tap}
              >
                <span className="truncate">游玩类型</span>
                <ChevronDown
                  className={`pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 shrink-0 -translate-y-1/2 transition ${
                    menuOpen === "cat" ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
              <motion.button
                type="button"
                onClick={() =>
                  onMenuOpen(menuOpen === "persona" ? null : "persona")
                }
                className="relative flex h-[32px] min-w-[3.75rem] shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/75 px-2 py-0 pr-6 text-[10px] font-black text-zinc-800 shadow-sm backdrop-blur-md"
                {...tap}
              >
                <span className="truncate">玩家</span>
                <ChevronDown
                  className={`pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 shrink-0 -translate-y-1/2 transition ${
                    menuOpen === "persona" ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
            </>
          )}

          {viewMode === "map" && liveOn && (
            <>
              <motion.button
                type="button"
                onClick={onToggleLiveQueue}
                className={`flex h-[32px] min-w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border px-2.5 py-0 text-[10px] font-black shadow-sm backdrop-blur-md ${
                  liveShowQueue
                    ? "border-sky-400 bg-sky-100 text-sky-700"
                    : "border-black/5 bg-white/75 text-zinc-800"
                }`}
                {...tap}
              >
                排队
              </motion.button>
              <motion.button
                type="button"
                onClick={onToggleLiveUser}
                className={`flex h-[32px] min-w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border px-2.5 py-0 text-[10px] font-black shadow-sm backdrop-blur-md ${
                  liveShowUser
                    ? "border-[#ff2442]/35 bg-[#ff2442]/15 text-[#ff2442]"
                    : "border-black/5 bg-white/75 text-zinc-800"
                }`}
                {...tap}
              >
                用户
              </motion.button>
            </>
          )}
          </div>

          {viewMode === "map" && (
            <motion.button
              type="button"
              onClick={onToggleLive}
              className={`pointer-events-auto ml-auto flex h-[32px] shrink-0 items-center justify-center gap-1 rounded-2xl border px-2.5 py-0 text-[10px] font-black shadow-sm backdrop-blur-md ${
                liveOn
                  ? "border-[#ff2442]/35 bg-[#ff2442]/15 text-[#ff2442]"
                  : "border-black/5 bg-white/75 text-zinc-800"
              }`}
              {...tap}
            >
              <Radio className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              <span className="shrink-0">实况</span>
            </motion.button>
          )}
        </div>

      <AnimatePresence>
        {!liveOn && menuOpen === "cat" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-auto mt-2 flex flex-wrap gap-2 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-md backdrop-blur-md"
          >
            {POI_CATEGORIES.map((c) => {
              const on = activeCategories.has(c);
              return (
                <motion.button
                  key={c}
                  type="button"
                  onClick={() => onToggleCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                    on
                      ? "bg-[#ff2442] text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                  {...tap}
                >
                  {c}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!liveOn && menuOpen === "persona" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-auto mt-2 flex gap-2 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-md backdrop-blur-md"
          >
            {PERSONAS.map((p) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => onPersona(p.id)}
                className={`flex-1 rounded-xl py-2 text-center text-[11px] font-black ${
                  persona === p.id
                    ? "bg-[#ff2442]/12 text-[#ff2442] ring-1 ring-[#ff2442]/30"
                    : "bg-zinc-100 text-zinc-600"
                }`}
                {...tap}
              >
                {p.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
