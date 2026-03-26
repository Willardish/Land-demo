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
}) {
  return (
    <div className="absolute left-3 right-3 top-[52px] z-50 shrink-0">
      <div className="flex items-start gap-2">
        <div className="flex w-[126px] flex-none rounded-2xl border border-black/5 bg-white/75 p-1 shadow-sm backdrop-blur-md">
          {["map", "list"].map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => onViewMode(m)}
              className={`flex-1 rounded-xl py-1.5 text-center text-[11px] font-black ${
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
              className="relative flex min-w-0 flex-[1.35] items-center justify-center rounded-2xl border border-black/5 bg-white/75 px-2 py-2 text-[10.5px] font-black text-zinc-800 shadow-sm backdrop-blur-md"
              {...tap}
            >
              <span className="truncate">游玩类型</span>
              <ChevronDown
                className={`absolute right-2 h-4 w-4 shrink-0 transition ${
                  menuOpen === "cat" ? "rotate-180" : ""
                }`}
              />
            </motion.button>
            <motion.button
              type="button"
              onClick={() =>
                onMenuOpen(menuOpen === "persona" ? null : "persona")
              }
              className="relative flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-black/5 bg-white/75 px-2 py-2 text-[10.5px] font-black text-zinc-800 shadow-sm backdrop-blur-md"
              {...tap}
            >
              <span className="truncate">玩家</span>
              <ChevronDown
                className={`absolute right-2 h-4 w-4 shrink-0 transition ${
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
              className={`flex min-w-0 flex-1 items-center justify-center rounded-2xl border px-2 py-2 text-[11px] font-black shadow-sm backdrop-blur-md ${
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
              className={`flex min-w-0 flex-1 items-center justify-center rounded-2xl border px-2 py-2 text-[11px] font-black shadow-sm backdrop-blur-md ${
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

        {viewMode === "map" && (
          <motion.button
            type="button"
            onClick={onToggleLive}
            className={`flex items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[11px] font-black shadow-sm backdrop-blur-md ${
              liveOn
                ? "border-[#ff2442]/35 bg-[#ff2442]/15 text-[#ff2442]"
                : "border-black/5 bg-white/75 text-zinc-800"
            }`}
            {...tap}
          >
            <Radio className="h-4 w-4" strokeWidth={2.5} />
            实况
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {!liveOn && menuOpen === "cat" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-md backdrop-blur-md"
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
            className="mt-2 flex gap-2 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-md backdrop-blur-md"
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
  );
}
