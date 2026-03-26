import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapMarker } from "./MapMarker.jsx";
import { LiveHelpPin } from "./LiveHelpPin.jsx";

const MIN_Z = 0.75;
const MAX_Z = 5.2;
// Silent mode default zoom: 60% of the interactive maximum zoom.
// This keeps the view immersive without showing the full park.
const SILENT_SCALE = MAX_Z * 0.6;
const MOVE_THRESHOLD_PX = 10;
const LONG_PRESS_MS = 520;

export function IllustratedMap({
  pois,
  liveOn,
  liveShowQueue = false,
  livePins,
  routeSelectedIds,
  footprintPathPct,
  footprintOn,
  silentNav,
  onExitSilentNav,
  onMarkerShort,
  onMarkerLong,
  onMapLongPress,
  checkInPinPosPct,
  onOpenHelpPin,
  voiceAnswerText,
  voiceRouteLinePct,
  hideSilentNavExit,
  mapImageSrc = "/disney-map.jpg",
}) {
  const isSilent = Boolean(silentNav?.center);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const userPanRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    panStartX: 0,
    panStartY: 0,
    dragging: false,
  });

  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [userZoom, setUserZoom] = useState(1);

  useEffect(() => {
    userPanRef.current = userPan;
  }, [userPan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    };

    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cx = silentNav?.center?.xPct ?? 50;
  const cy = silentNav?.center?.yPct ?? 50;

  const lockedToSilent = isSilent;

  const onWheel = useCallback(
    (e) => {
      if (lockedToSilent) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setUserZoom((z) => Math.min(MAX_Z, Math.max(MIN_Z, z + delta)));
    },
    [lockedToSilent]
  );

  const timerRef = useRef(null);
  const clearLongPressTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDownMap = useCallback(
    (e) => {
      if (lockedToSilent) return;
      if (e.button !== 0) return;
      const t = e.target;
      if (t.closest && t.closest("button")) return;
      clearLongPressTimer();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pan = userPanRef.current;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        panStartX: pan.x,
        panStartY: pan.y,
        dragging: false,
      };
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      const longPressPos = {
        xPct: Math.max(0, Math.min(100, xPct)),
        yPct: Math.max(0, Math.min(100, yPct)),
      };
      if (onMapLongPress) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          const d = dragRef.current;
          if (d.active && !d.dragging) {
            onMapLongPress(longPressPos);
          }
        }, LONG_PRESS_MS);
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [lockedToSilent, onMapLongPress, clearLongPressTimer]
  );

  const onPointerMoveMap = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d.active || lockedToSilent) return;
      const el = containerRef.current;
      if (!el) return;
      const dxPx = e.clientX - d.startX;
      const dyPx = e.clientY - d.startY;
      const dist = Math.hypot(dxPx, dyPx);
      if (dist > MOVE_THRESHOLD_PX) {
        if (!d.dragging) {
          clearLongPressTimer();
          d.dragging = true;
        }
        const rect = el.getBoundingClientRect();
        const dx = ((e.clientX - d.startX) / rect.width) * 100;
        const dy = ((e.clientY - d.startY) / rect.height) * 100;
        setUserPan({
          x: d.panStartX + dx,
          y: d.panStartY + dy,
        });
      }
    },
    [lockedToSilent, clearLongPressTimer]
  );

  const endDrag = useCallback(() => {
    clearLongPressTimer();
    dragRef.current.active = false;
    dragRef.current.dragging = false;
  }, [clearLongPressTimer]);

  // POI coordinates were authored against the old `object-cover` rendering.
  // We now render the full image via `object-contain`, so we must remap:
  //   coverVisible(oldPct) -> absolute image coords -> containVisible(screenPct)
  const remapPct = useCallback(
    (p) => {
      if (!p) return p;
      const { w: CW, h: CH } = containerSize;
      const { w: IW, h: IH } = naturalSize;
      if (!CW || !CH || !IW || !IH) return p;

      // object-cover
      const scaleCover = Math.max(CW / IW, CH / IH);
      const coverW = CW / scaleCover;
      const coverH = CH / scaleCover;
      const offsetCoverX = (IW - coverW) / 2;
      const offsetCoverY = (IH - coverH) / 2;

      // map old pct -> absolute image coords
      const absX = offsetCoverX + (p.xPct / 100) * coverW;
      const absY = offsetCoverY + (p.yPct / 100) * coverH;

      // object-contain
      const scaleContain = Math.min(CW / IW, CH / IH);
      const containW = IW * scaleContain;
      const containH = IH * scaleContain;
      const padLeft = (CW - containW) / 2;
      const padTop = (CH - containH) / 2;

      // absolute image coords -> screen coords -> pct
      const screenX = padLeft + absX * scaleContain;
      const screenY = padTop + absY * scaleContain;
      return {
        xPct: (screenX / CW) * 100,
        yPct: (screenY / CH) * 100,
      };
    },
    [containerSize, naturalSize]
  );

  const parentScale = lockedToSilent ? SILENT_SCALE : userZoom;
  const mappedVoiceRoute = (voiceRouteLinePct || []).map(remapPct);
  const mappedFootprintPath = (footprintPathPct || []).map(remapPct);
  const mappedPins = (livePins || []).map((pin) => ({
    ...pin,
    pos: remapPct(pin.pos),
  }));
  const mappedPois = (pois || []).map((poi) => ({
    ...poi,
    pos: remapPct(poi.pos),
  }));
  const mappedSilentCenter = silentNav?.center ? remapPct(silentNav.center) : null;

  const silentCx = mappedSilentCenter?.xPct ?? cx;
  const silentCy = mappedSilentCenter?.yPct ?? cy;

  const mapTransform = lockedToSilent
    ? {
        // For silent navigation we must translate using the remapped center
        // so the camera aligns to the same coordinate system as markers/overlays.
        transform: `translate(calc((50 - ${silentCx}) * 1%), calc((50 - ${silentCy}) * 1%)) scale(${SILENT_SCALE})`,
        transformOrigin: "50% 50%",
      }
    : {
        transform: `translate(${userPan.x}%, ${userPan.y}%) scale(${userZoom})`,
        transformOrigin: "50% 50%",
      };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-200 shadow-inner"
      onWheel={onWheel}
      onPointerDown={onPointerDownMap}
      onPointerMove={onPointerMoveMap}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {voiceAnswerText && (
        <div className="pointer-events-none absolute left-1/2 top-[96px] z-[60] w-[280px] -translate-x-1/2 rounded-2xl border border-black/5 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-md">
          <p className="text-[11px] font-semibold text-zinc-500">
            最近的洗手间在哪里？
          </p>
          <p className="mt-1 text-sm font-black text-[#ff2442]">
            {voiceAnswerText}
          </p>
        </div>
      )}

      <div className="absolute inset-0 touch-none" style={mapTransform}>
        <div className="relative h-full w-full">
          <img
            src={mapImageSrc}
            alt="上海迪士尼乐园地图"
            className="h-full w-full select-none object-contain object-center pointer-events-none"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
            }}
          />

          {mappedVoiceRoute && mappedVoiceRoute.length > 1 && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <motion.polyline
                fill="none"
                stroke="#ff2442"
                strokeWidth={isSilent ? 0.6 : 0.45}
                strokeDasharray={isSilent ? "2.2 2.2" : "1.2 1.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isSilent ? 0.95 : 0.8}
                animate={
                  isSilent
                    ? { strokeDashoffset: [0, -12] }
                    : undefined
                }
                transition={
                  isSilent
                    ? { duration: 1.1, repeat: Infinity, ease: "linear" }
                    : undefined
                }
                points={mappedVoiceRoute
                  .map((p) => `${p.xPct},${p.yPct}`)
                  .join(" ")}
              />
            </svg>
          )}

          {footprintOn && mappedFootprintPath.length > 1 && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="#ff2442"
                strokeWidth="0.35"
                strokeDasharray="1.2 1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.65"
                points={mappedFootprintPath
                  .map((p) => `${p.xPct},${p.yPct}`)
                  .join(" ")}
              />
            </svg>
          )}

          {footprintOn && mappedFootprintPath.length > 0 && (
            <div
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff2442] shadow-md"
              style={{
                left: `${mappedFootprintPath[mappedFootprintPath.length - 1].xPct}%`,
                top: `${mappedFootprintPath[mappedFootprintPath.length - 1].yPct}%`,
              }}
            />
          )}

          <AnimatePresence mode="popLayout">
            {mappedPois.map((poi) => (
              <MapMarker
                key={poi.id}
                poi={poi}
                liveOn={liveOn}
                liveShowQueue={liveShowQueue}
                compact={isSilent}
                mapZoom={lockedToSilent ? SILENT_SCALE : userZoom}
                selectedRoute={routeSelectedIds.has(poi.id)}
                onShortPress={onMarkerShort}
                onLongPress={onMarkerLong}
              />
            ))}
          </AnimatePresence>

          {isSilent && (
            <>
              <motion.div
                className="absolute z-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff2442] shadow-md"
                style={{
                  left: `${mappedSilentCenter?.xPct ?? 50}%`,
                  top: `${mappedSilentCenter?.yPct ?? 50}%`,
                }}
              />
              <motion.div
                className="absolute z-40 rounded-full border-2 border-[#ff2442]/50"
                style={{
                  left: `${mappedSilentCenter?.xPct ?? 50}%`,
                  top: `${mappedSilentCenter?.yPct ?? 50}%`,
                  width: 18,
                  height: 18,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                沿主路前进 · 下一转弯（Mock）
              </div>
            </>
          )}

          {liveOn && !isSilent && (
            <>
              {mappedPins.map((pin) => (
                <LiveHelpPin
                  key={pin.id}
                  pin={pin}
                  onOpen={onOpenHelpPin}
                  mapZoom={userZoom}
                />
              ))}
            </>
          )}

          {checkInPinPosPct && !isSilent && (
            <motion.div
              className="absolute z-[49]"
              style={{
                left: `${checkInPinPosPct.xPct}%`,
                top: `${checkInPinPosPct.yPct}%`,
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <div className="h-2 w-2 rounded-full bg-[#ff2442] shadow-lg" />
                <div className="absolute left-1/2 top-[6px] h-7 w-[2px] -translate-x-1/2 bg-[#ff2442]/70" />
                <div className="absolute left-1/2 top-[11px] h-6 w-6 -translate-x-1/2 rounded-full border border-black/5 bg-white/90 shadow-md" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {!isSilent && (
        <div className="pointer-events-none absolute bottom-2 right-2 z-40 max-w-[140px] rounded-lg bg-black/45 px-2 py-1 text-[9px] font-bold leading-tight text-white backdrop-blur-sm">
          滚轮缩放 · 长按空白打卡 · 拖动平移
        </div>
      )}

      {isSilent && !hideSilentNavExit && (
        <motion.button
          type="button"
          className="absolute left-3 top-3 z-[55] rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-zinc-800 shadow-md backdrop-blur-md"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          onClick={onExitSilentNav}
        >
          退出静默导航
        </motion.button>
      )}
    </div>
  );
}
