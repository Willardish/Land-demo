import { useMemo, useState } from "react";
import { Star, Heart } from "lucide-react";

function StarRow({ filled }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= filled
              ? "fill-[#ff2442] text-[#ff2442]"
              : "fill-zinc-200 text-zinc-200"
          }`}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function mockPlayReviews(poi) {
  const place = poi?.title || "本项目";
  return [
    {
      id: "r1",
      user: "一只阿土",
      avatar: "from-amber-200 to-orange-300",
      quality: "great",
      stars: 5,
      text: `${place}整体体验很棒，排队动线清晰，工作人员会主动引导，值得二刷。`,
      date: "2024-09-10",
      loc: "上海",
      likes: 0,
    },
    {
      id: "r2",
      user: "Molly",
      avatar: "from-sky-200 to-indigo-200",
      quality: "avg",
      stars: 2,
      text: `人多的话体感会打折扣，建议错峰来 ${place}，否则排队心态容易崩。`,
      date: "2024-08-22",
      loc: "上海",
      likes: 0,
    },
    {
      id: "r3",
      user: "绿毛水怪",
      avatar: "from-emerald-200 to-teal-300",
      quality: "great",
      stars: 5,
      text: "和朋友一起来的，拍照点位多，出片率很高，会推荐给其他人。",
      date: "2024-07-06",
      loc: "上海",
      likes: 1,
    },
    {
      id: "r4",
      user: "松弛游玩家",
      avatar: "from-rose-200 to-pink-300",
      quality: "avg",
      stars: 3,
      text: "期望值不要拉太高就还行，属于「顺路可去」型，专程排队略不值。",
      date: "2024-06-18",
      loc: "上海",
      likes: 0,
    },
  ];
}

const TABS = [
  { id: "all", label: "全部" },
  { id: "latest", label: "最新" },
  { id: "bad", label: "不够好", count: 3 },
  { id: "good", label: "推荐", count: 14 },
];

export function PoiPlayReviews({ poi }) {
  const [tab, setTab] = useState("all");
  const all = useMemo(() => mockPlayReviews(poi), [poi?.id, poi?.title]);

  const filtered = useMemo(() => {
    if (tab === "latest") return [...all].reverse();
    if (tab === "bad") return all.filter((r) => r.quality === "avg");
    if (tab === "good") return all.filter((r) => r.quality === "great");
    return all;
  }, [all, tab]);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-white">
      <p className="border-b border-black/5 px-3 py-2.5 text-[13px] font-black text-zinc-900">
        游玩评价
      </p>
      <div className="flex gap-4 overflow-x-auto px-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 pb-2 text-[13px] ${
              tab === t.id
                ? "font-black text-zinc-900"
                : "font-semibold text-zinc-400"
            }`}
          >
            {t.label}
            {t.count != null ? ` ${t.count}` : ""}
            {tab === t.id ? (
              <span className="absolute bottom-0 left-0 right-0 mx-auto h-[3px] w-[70%] rounded-full bg-zinc-900" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="divide-y divide-zinc-100">
        {filtered.map((r) => (
          <div key={r.id} className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${r.avatar}`}
                />
                <span className="truncate text-[13px] font-semibold text-zinc-500">
                  {r.user}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <button
                  type="button"
                  className="rounded-lg p-1 text-zinc-400"
                  aria-label="点赞"
                >
                  <Heart className="h-4 w-4" strokeWidth={2} />
                </button>
                {r.likes > 0 ? (
                  <span className="text-[10px] font-bold text-zinc-400">
                    {r.likes}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 pl-10">
              {r.quality === "great" ? (
                <span className="rounded-full bg-[#ffe4e8] px-2 py-0.5 text-[11px] font-black text-[#ff2442]">
                  很棒
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-black text-zinc-500">
                  一般
                </span>
              )}
              <StarRow filled={r.stars} />
            </div>

            <p className="mt-2 pl-10 text-[13px] font-medium leading-relaxed text-zinc-900">
              {r.text}
            </p>
            <p className="mt-2 pl-10 text-[11px] font-semibold text-zinc-400">
              {r.date} {r.loc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
