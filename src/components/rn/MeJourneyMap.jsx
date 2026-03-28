import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const wrapRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize((prev) => {
        const w = r.width;
        const h = r.height;
        if (!w || !h) return prev;
        if (prev.w === w && prev.h === h) return prev;
        return { w, h };
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const routePolylinePoints = useMemo(
    () =>
      remappedStopPts.length > 1
        ? remappedStopPts.map((p) => `${p.xPct},${p.yPct}`).join(" ")
        : "",
    [remappedStopPts]
  );

  const journeyMarkers = useMemo(
    () =>
      journeyPois.map((poi) => ({
        poi,
        mapped: remapPct(poi.pos),
        isCheckIn: checkInPoiIdSet.has(poi.id),
      })),
    [journeyPois, remapPct, checkInPoiIdSet]
  );

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-2xl bg-zinc-50 border border-black/5"
      style={{ aspectRatio: "16 / 9" }}
    >
      <img
        src={mapImageSrc}
        alt="journey-map"
        draggable={false}
        decoding="async"
        className="h-full w-full select-none object-contain object-center pointer-events-none"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
        }}
      />

      {/* Plan route line (visual-only) */}
      {routePolylinePoints && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#ff2442"
            strokeWidth="0.45"
            strokeDasharray="2.2 2.6"
            strokeLinecap="round"
            opacity="0.8"
            points={routePolylinePoints}
          />
        </svg>
      )}

      {/* Pins: plan stops + photo check-ins */}
      {journeyMarkers.map(({ poi, mapped, isCheckIn }) => {
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

