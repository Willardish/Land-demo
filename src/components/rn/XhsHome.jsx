import { Globe } from "lucide-react";

export function XhsHome({ onEnterMap }) {
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-white">
      <img
        src="/xhs-home.png"
        alt="小红书首页入口"
        className="h-full w-full select-none object-contain bg-white"
        draggable={false}
      />

      <div className="absolute left-4 top-4 z-[120] pointer-events-none">
        <button
          type="button"
          aria-label="进入地图"
          onClick={onEnterMap}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-md border border-black/5"
        >
          <Globe className="h-5 w-5 text-zinc-800" strokeWidth={2.3} />
        </button>
      </div>
    </div>
  );
}

