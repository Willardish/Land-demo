import { useCallback, useMemo, useState } from "react";
import { Camera, MapPin } from "lucide-react";

import { POIS } from "../../data/poisData.js";

function remapCoverToContain({ xPct, yPct }, CW, CH, IW, IH) {
  if (!CW || !CH || !IW || !IH) return { xPct, yPct };

  // object-cover visible region
  const scaleCover = Math.max(CW / IW, CH / IH);
  const coverW = CW / scaleCover;
  const coverH = CH / scaleCover;
  const offsetCoverX = (IW - coverW) / 2;
  const offsetCoverY = (IH - coverH) / 2;

  // old authored pct -> absolute image coords
  const absX = offsetCoverX + (xPct / 100) * coverW;
  const absY = offsetCoverY + (yPct / 100) * coverH;

  // object-contain screen region
  const scaleContain = Math.min(CW / IW, CH / IH);
  const containW = IW * scaleContain;
  const containH = IH * scaleContain;
  const padLeft = (CW - containW) / 2;
  const padTop = (CH - containH) / 2;

  // absolute image coords -> contain-visible pct
  const screenX = padLeft + absX * scaleContain;
  const screenY = padTop + absY * scaleContain;

  return {
    xPct: (screenX / CW) * 100,
    yPct: (screenY / CH) * 100,
  };
}

export function MeJourneyMap({ planStopsOrder, checkIns, mapImageSrc = "/disney-map.jpg" }) {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const planSet = useMemo(() => new Set(planStopsOrder || []), [planStopsOrder]);
  const checkInPoiIdSet = useMemo(
    () => new Set((checkIns || []).map((c) => c.poiId).filter(Boolean)),
    [checkIns]
  );

  const journeyPoiIds = useMemo(() => {
    const s = new Set();
    for (const id of planSet) s.add(id);
    for (const id of checkInPoiIdSet) s.add(id);
    return s;
  }, [planSet, checkInPoiIdSet]);

  const journeyPois = useMemo(
    () => POIS.filter((p) => journeyPoiIds.has(p.id)),
    [journeyPoiIds]
  );

  const remapPct = useCallback(
    (pos) => {
      if (!pos) return pos;
      return remapCoverToContain(pos, containerSize.w, containerSize.h, naturalSize.w, naturalSize.h);
    },
    [containerSize, naturalSize]
  );

  const stopPts = useMemo(() => {
    const pts = [];
    for (const sid of planStopsOrder || []) {
      const p = POIS.find((x) => x.id === sid);
      if (p?.pos) pts.push(p.pos);
    }
    return pts;
  }, [planStopsOrder]);

  const remappedStopPts = useMemo(
    () => stopPts.map(remapPct),
    [stopPts, remapPct]
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-zinc-50 border border-black/5"
      style={{ aspectRatio: "16 / 9" }}
      ref={(el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (containerSize.w !== r.width || containerSize.h !== r.height) {
          setContainerSize({ w: r.width, h: r.height });
        }
      }}
    >
      <img
        src={mapImageSrc}
        alt="journey-map"
        draggable={false}
        className="h-full w-full select-none object-contain object-center pointer-events-none"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
        }}
      />

      {/* Plan route line (visual-only) */}
      {remappedStopPts.length > 1 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#ff2442"
            strokeWidth="0.45"
            strokeDasharray="2.2 2.6"
            strokeLinecap="round"
            opacity="0.8"
            points={remappedStopPts.map((p) => `${p.xPct},${p.yPct}`).join(" ")}
          />
        </svg>
      )}

      {/* Pins: plan stops + photo check-ins */}
      {journeyPois.map((poi) => {
        const isCheckIn = checkInPoiIdSet.has(poi.id);
        const mapped = remapPct(poi.pos);
        return (
          <div
            key={poi.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${isCheckIn ? "z-[55]" : "z-[54]"}`}
            style={{ left: `${mapped.xPct}%`, top: `${mapped.yPct}%` }}
          >
            <div
              className={`relative flex items-center justify-center rounded-full shadow-md ${
                isCheckIn
                  ? "h-[30px] w-[30px] bg-[#ff2442] text-white"
                  : "h-[24px] w-[24px] bg-white border border-[#ff2442]/50 text-[#ff2442]"
              }`}
            >
              {isCheckIn ? (
                <Camera className="h-[14px] w-[14px]" strokeWidth={2.2} />
              ) : (
                <MapPin className="h-[12px] w-[12px]" strokeWidth={2.2} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

