import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapMarker } from "./MapMarker.jsx";
import { LiveHelpPin } from "./LiveHelpPin.jsx";

const MIN_Z = 0.75;
const MAX_Z = 5.2;
// Silent mode default zoom: 60% of the interactive maximum zoom.
const SILENT_SCALE = MAX_Z * 0.6;
// After entering the map from the XHS home, start at half of max zoom for immersion.
const DEFAULT_MAP_ZOOM = MAX_Z * 0.5;
const SILENT_UI_COUNTER = 1 / SILENT_SCALE;
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
  onHelpPinExpired,
}) {
  const isSilent = Boolean(silentNav?.center);
  const containerRef = useRef(null);
  const panLayerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const userPanRef = useRef({ x: 0, y: 0 });
  const userZoomRef = useRef(DEFAULT_MAP_ZOOM);
  const lockedToSilentRef = useRef(false);
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    panStartX: 0,
    panStartY: 0,
    dragging: false,
    /** 触屏上避免 pointerdown 立刻 capture，否则 POI 的 tap 序列常被地图抢走 */
    captured: false,
    capturePointerId: null,
  });

  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [userZoom, setUserZoom] = useState(DEFAULT_MAP_ZOOM);

  useEffect(() => {
    userPanRef.current = userPan;
  }, [userPan]);

  useEffect(() => {
    userZoomRef.current = userZoom;
  }, [userZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize((prev) => {
        const w = r.width;
        const h = r.height;
        if (prev.w === w && prev.h === h) return prev;
        return { w, h };
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = silentNav?.center?.xPct ?? 50;
  const cy = silentNav?.center?.yPct ?? 50;

  const lockedToSilent = isSilent;

  useEffect(() => {
    lockedToSilentRef.current = lockedToSilent;
  }, [lockedToSilent]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (lockedToSilentRef.current) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setUserZoom((z) => Math.min(MAX_Z, Math.max(MIN_Z, z + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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
      if (e.button !== 0 && e.pointerType !== "touch") return;
      const t = e.target;
      if (t.closest && t.closest("button")) return;

      pointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (pointersRef.current.size >= 2) {
        clearLongPressTimer();
        dragRef.current.active = false;
        dragRef.current.dragging = false;
        dragRef.current.captured = false;
        dragRef.current.capturePointerId = null;
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchRef.current = {
          startDist: Math.max(dist, 8),
          startZoom: userZoomRef.current,
        };
        return;
      }

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
        captured: false,
        capturePointerId: null,
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
          if (d.active && !d.dragging && pointersRef.current.size <= 1) {
            onMapLongPress(longPressPos);
          }
        }, LONG_PRESS_MS);
      }
      if (e.pointerType !== "touch") {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current.captured = true;
          dragRef.current.capturePointerId = e.pointerId;
        } catch {
          /* ignore */
        }
      }
    },
    [lockedToSilent, onMapLongPress, clearLongPressTimer]
  );

  const onPointerMoveMap = useCallback(
    (e) => {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      if (
        pinchRef.current &&
        pointersRef.current.size >= 2 &&
        !lockedToSilent
      ) {
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = dist / pinchRef.current.startDist;
        const next = pinchRef.current.startZoom * ratio;
        setUserZoom(Math.min(MAX_Z, Math.max(MIN_Z, next)));
        e.preventDefault();
        return;
      }

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
        if (
          !d.captured &&
          e.pointerType === "touch" &&
          pointersRef.current.size <= 1
        ) {
          d.captured = true;
          d.capturePointerId = e.pointerId;
          try {
            panLayerRef.current?.setPointerCapture?.(e.pointerId);
          } catch {
            /* ignore */
          }
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

  const onPointerUpOrCancelMap = useCallback(
    (e) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) {
        pinchRef.current = null;
      }
      clearLongPressTimer();
      if (pointersRef.current.size === 0) {
        dragRef.current.active = false;
        dragRef.current.dragging = false;
        dragRef.current.captured = false;
        dragRef.current.capturePointerId = null;
      }
      try {
        const panEl = panLayerRef.current;
        if (panEl?.hasPointerCapture?.(e.pointerId)) {
          panEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
    },
    [clearLongPressTimer]
  );

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

  const mappedVoiceRoute = useMemo(
    () => (voiceRouteLinePct || []).map(remapPct),
    [voiceRouteLinePct, remapPct]
  );
  const mappedFootprintPath = useMemo(
    () => (footprintPathPct || []).map(remapPct),
    [footprintPathPct, remapPct]
  );
  const mappedPins = useMemo(
    () =>
      (livePins || []).map((pin) => ({
        ...pin,
        pos: remapPct(pin.pos),
      })),
    [livePins, remapPct]
  );
  const mappedPois = useMemo(
    () =>
      (pois || []).map((poi) => ({
        ...poi,
        pos: remapPct(poi.pos),
      })),
    [pois, remapPct]
  );
  const mappedSilentCenter = useMemo(
    () => (silentNav?.center ? remapPct(silentNav.center) : null),
    [silentNav, remapPct]
  );

  const silentCx = mappedSilentCenter?.xPct ?? cx;
  const silentCy = mappedSilentCenter?.yPct ?? cy;

  const voiceRoutePoints = useMemo(
    () =>
      mappedVoiceRoute.length > 1
        ? mappedVoiceRoute.map((p) => `${p.xPct},${p.yPct}`).join(" ")
        : "",
    [mappedVoiceRoute]
  );

  const footprintPolylinePoints = useMemo(
    () =>
      mappedFootprintPath.length > 1
        ? mappedFootprintPath.map((p) => `${p.xPct},${p.yPct}`).join(" ")
        : "",
    [mappedFootprintPath]
  );

  const mapTransform = useMemo(() => {
    if (lockedToSilent) {
      return {
        transform: `translate(calc((50 - ${silentCx}) * 1%), calc((50 - ${silentCy}) * 1%)) scale(${SILENT_SCALE})`,
        transformOrigin: "50% 50%",
      };
    }
    return {
      transform: `translate(${userPan.x}%, ${userPan.y}%) scale(${userZoom})`,
      transformOrigin: "50% 50%",
    };
  }, [lockedToSilent, silentCx, silentCy, userPan.x, userPan.y, userZoom]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-200 shadow-inner"
      style={{ touchAction: "none" }}
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

      <div
        ref={panLayerRef}
        className="map-pan-layer absolute inset-0 z-0 touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDownMap}
        onPointerMove={onPointerMoveMap}
        onPointerUp={onPointerUpOrCancelMap}
        onPointerCancel={onPointerUpOrCancelMap}
      />

      <div className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ ...mapTransform, touchAction: "none" }}
      >
        <div className="relative h-full w-full pointer-events-none">
          <img
            src={mapImageSrc}
            alt="上海迪士尼乐园地图"
            className="h-full w-full select-none object-contain object-center pointer-events-none"
            draggable={false}
            decoding="async"
            fetchPriority="high"
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
            }}
          />

          {voiceRoutePoints && (
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
                points={voiceRoutePoints}
              />
            </svg>
          )}

          {footprintOn && footprintPolylinePoints && (
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
                points={footprintPolylinePoints}
              />
            </svg>
          )}

          {footprintOn && mappedFootprintPath.length > 0 && (
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff2442] shadow-md"
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
              <div
                className="pointer-events-none absolute z-50 flex h-0 w-0 items-center justify-center"
                style={{
                  left: `${mappedSilentCenter?.xPct ?? 50}%`,
                  top: `${mappedSilentCenter?.yPct ?? 50}%`,
                  transform: `translate(-50%, -50%) scale(${SILENT_UI_COUNTER})`,
                }}
              >
                <motion.div className="h-2 w-2 shrink-0 rounded-full border-2 border-white bg-[#ff2442] shadow-md" />
              </div>
              <div
                className="pointer-events-none absolute z-40 flex h-0 w-0 items-center justify-center"
                style={{
                  left: `${mappedSilentCenter?.xPct ?? 50}%`,
                  top: `${mappedSilentCenter?.yPct ?? 50}%`,
                  transform: `translate(-50%, -50%) scale(${SILENT_UI_COUNTER})`,
                }}
              >
                <motion.div
                  className="shrink-0 rounded-full border-2 border-[#ff2442]/50"
                  style={{ width: 18, height: 18 }}
                  animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </div>
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
                  onExpired={onHelpPinExpired}
                />
              ))}
            </>
          )}

          {checkInPinPosPct && !isSilent && (
            <motion.div
              className="pointer-events-none absolute z-[49]"
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
      </div>

      {!isSilent && (
        <div className="pointer-events-none absolute bottom-2 right-2 z-40 max-w-[168px] rounded-lg bg-black/45 px-2 py-1 text-[9px] font-bold leading-tight text-white backdrop-blur-sm">
          滚轮/双指缩放 · 长按空白发布 · 拖动平移
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
