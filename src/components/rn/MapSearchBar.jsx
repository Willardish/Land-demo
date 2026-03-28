import { Search } from "lucide-react";

/**
 * 搜索条 — Map / List 共用，叠在 TopControls 上方。
 */
export function MapSearchBar({ placeholder = "搜索迪士尼攻略、餐厅、项目…" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(0.5rem+1cm)] z-[49] flex justify-center px-3">
      <label className="pointer-events-auto flex h-10 w-full max-w-sm items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3.5 shadow-md backdrop-blur-md">
        <Search className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2.2} />
        <input
          type="search"
          enterKeyHint="search"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-zinc-800 outline-none placeholder:text-zinc-400"
          aria-label={placeholder}
        />
      </label>
    </div>
  );
}
