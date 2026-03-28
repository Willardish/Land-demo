import { useMemo, useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneFrame } from "./components/rn/PhoneFrame.jsx";
import { TopControls } from "./components/rn/TopControls.jsx";
import { IllustratedMap } from "./components/rn/IllustratedMap.jsx";
import { ListViewPanel } from "./components/rn/ListViewPanel.jsx";
import { AskMapMic } from "./components/rn/AskMapMic.jsx";
import { RoutePlanFab } from "./components/rn/RoutePlanFab.jsx";
import { BottomDock } from "./components/rn/BottomDock.jsx";
import { VoicePulseOverlay } from "./components/rn/VoicePulseOverlay.jsx";
import { POIDrawer } from "./components/rn/POIDrawer.jsx";
import { RoutePlanSheet } from "./components/rn/RoutePlanSheet.jsx";
import { MeTab } from "./components/rn/MeTab.jsx";
import { PostGenerateModal } from "./components/rn/PostGenerateModal.jsx";
import { CheckInSheet } from "./components/rn/CheckInSheet.jsx";
import { MessagesSheet } from "./components/rn/MessagesSheet.jsx";
import { HelpRequestSheet } from "./components/rn/HelpRequestSheet.jsx";
import { PublishChoiceSheet } from "./components/rn/PublishChoiceSheet.jsx";
import { SeekHelpSheet } from "./components/rn/SeekHelpSheet.jsx";
import { XhsHome } from "./components/rn/XhsHome.jsx";
import { MapSearchBar } from "./components/rn/MapSearchBar.jsx";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { POIS, POI_CATEGORIES } from "./data/poisData.js";
import { LIVE_HELP_PINS } from "./data/liveHelpPins.js";
import { CHAT_CONVERSATIONS } from "./data/chatConversations.js";

// Silent navigation default start point: Mickey Avenue.
const START_PT = { xPct: 50, yPct: 68 };

function readInitialPoiIdFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("poi");
  } catch {
    return null;
  }
}

export default function App() {
  const [viewMode, setViewMode] = useState("map");
  const [activeCategories, setActiveCategories] = useState(
    () => new Set(POI_CATEGORIES)
  );
  const [persona, setPersona] = useState("parent-child");
  const [liveOn, setLiveOn] = useState(false);
  const [liveShowQueue, setLiveShowQueue] = useState(true);
  const [liveShowUser, setLiveShowUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [dockTab, setDockTab] = useState("explore");
  const [xhsHomeEntered, setXhsHomeEntered] = useState(false);

  const [drawerPoiId, setDrawerPoiId] = useState(null);
  const [routeSelected, setRouteSelected] = useState(() => new Set());
  const [routeSelectedOrder, setRouteSelectedOrder] = useState([]);
  const [planStopsOrder, setPlanStopsOrder] = useState([]);
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [routeGenerating, setRouteGenerating] = useState(false);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceDemoPhase, setVoiceDemoPhase] = useState(null); // 'answer' | 'nav' | null
  const [voiceAnswerText, setVoiceAnswerText] = useState("");
  const [voiceRestroomId, setVoiceRestroomId] = useState(null);
  const [voiceRouteLinePct, setVoiceRouteLinePct] = useState([]);

  const [preLiveCategories, setPreLiveCategories] = useState(null);
  const [preLivePersona, setPreLivePersona] = useState(null);
  const [silentNav, setSilentNav] = useState(null); // { center:{xPct,yPct}, radiusPct, routeId }
  const [silentRouteLinePct, setSilentRouteLinePct] = useState([]);

  const [footprintOn, setFootprintOn] = useState(false);
  const [footprintPathPct, setFootprintPathPct] = useState([START_PT]);

  const [checkInSheetOpen, setCheckInSheetOpen] = useState(false);
  const [checkInPinPosPct, setCheckInPinPosPct] = useState(null);
  const [checkInDraftPoiTitle, setCheckInDraftPoiTitle] = useState(null);
  const [checkInDraftPoiId, setCheckInDraftPoiId] = useState(null);
  const [checkIns, setCheckIns] = useState([]); // { id, xPct, yPct, poiId, imgDataUrl, caption, ts }

  /** User-published 找搭子 pins — same shape as LIVE_HELP_PINS + body + expiresAtMs */
  const [userHelpPins, setUserHelpPins] = useState([]);
  /** Map blank long-press → two-step publish (not POI chip) */
  const [mapPublishDraft, setMapPublishDraft] = useState(null);
  const [seekHelpOpen, setSeekHelpOpen] = useState(false);
  /** { pos, poiTitle } for SeekHelpSheet */
  const [seekHelpAnchor, setSeekHelpAnchor] = useState(null);
  /** Editing user-published help pin in SeekHelpSheet */
  const [helpEditingPin, setHelpEditingPin] = useState(null);

  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesNav, setMessagesNav] = useState(null);

  const [helpSheetOpen, setHelpSheetOpen] = useState(false);
  const [helpPin, setHelpPin] = useState(null);

  const [postOpen, setPostOpen] = useState(false);
  const [postPreview, setPostPreview] = useState(null);

  const visiblePOIs = useMemo(() => {
    if (liveOn) {
      if (liveShowQueue) return POIS.filter((p) => (p.waitUGC || 0) > 0);
      return [];
    }
    return POIS.filter(
      (p) =>
        activeCategories.has(p.category) &&
        (p.personaSuitability || []).includes(persona)
    );
  }, [activeCategories, persona, liveOn, liveShowQueue]);

  const poisForMap = useMemo(() => {
    if (!silentNav) return visiblePOIs;
    const { center, radiusPct } = silentNav;
    const r2 = (radiusPct || 18) * (radiusPct || 18);
    return visiblePOIs.filter((p) => {
      const dx = p.pos.xPct - center.xPct;
      const dy = p.pos.yPct - center.yPct;
      return dx * dx + dy * dy <= r2;
    });
  }, [visiblePOIs, silentNav]);

  const voicePoisForMap = useMemo(() => {
    if (voiceDemoPhase !== "nav" || !voiceRestroomId) return [];
    return POIS.filter((p) => p.id === voiceRestroomId);
  }, [voiceDemoPhase, voiceRestroomId]);

  const mapPoisToRender = voiceDemoPhase ? voicePoisForMap : poisForMap;

  const livePinsToRender = useMemo(() => {
    if (voiceDemoPhase) return [];
    if (!liveOn || !liveShowUser) return [];
    return [
      ...LIVE_HELP_PINS,
      ...userHelpPins.filter((p) => !p.resolved),
    ];
  }, [voiceDemoPhase, liveOn, liveShowUser, userHelpPins]);

  const drawerPoi = useMemo(
    () => POIS.find((p) => p.id === drawerPoiId) || null,
    [drawerPoiId]
  );

  const mapOverlaysOpen =
    Boolean(drawerPoiId) ||
    routeSheetOpen ||
    messagesOpen ||
    checkInSheetOpen ||
    postOpen ||
    helpSheetOpen ||
    Boolean(mapPublishDraft) ||
    seekHelpOpen;

  const showMapFloats = viewMode === "map" && !mapOverlaysOpen;

  useEffect(() => {
    if (!voiceOn) return undefined;
    const t = setTimeout(() => setVoiceOn(false), 3200);
    return () => clearTimeout(t);
  }, [voiceOn]);

  // Keep silent route visuals in sync with silentNav lifecycle.
  useEffect(() => {
    if (!silentNav) setSilentRouteLinePct([]);
  }, [silentNav]);

  const startRestroomVoiceDemo = useCallback(() => {
    const currentPos = footprintOn
      ? footprintPathPct[footprintPathPct.length - 1] || START_PT
      : START_PT;

    const restrooms = POIS.filter((p) => p.isRestroom);
    if (restrooms.length === 0) return;

    let best = restrooms[0];
    let bestD2 = Infinity;
    for (const r of restrooms) {
      const dx = r.pos.xPct - currentPos.xPct;
      const dy = r.pos.yPct - currentPos.yPct;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = r;
      }
    }

    const mid = {
      xPct: (currentPos.xPct + best.pos.xPct) / 2,
      yPct: Math.min(92, Math.max(8, (currentPos.yPct + best.pos.yPct) / 2 - 4)),
    };

    setVoiceAnswerText(`最近的洗手间在：${best.title}`);
    setVoiceRestroomId(best.id);
    setVoiceRouteLinePct([currentPos, mid, best.pos]);

    // Step A: show answer box + clear POIs (no zoom yet)
    setSilentNav(null);
    setVoiceDemoPhase("answer");

    setTimeout(() => {
      setVoiceDemoPhase("nav");
      // Step B: zoom-in like silent navigation, show only restroom + route line
      setSilentNav({
        center: currentPos,
        radiusPct: 14,
        routeId: "voice-restroom",
      });
    }, 1200);
  }, [footprintOn, footprintPathPct]);

  useEffect(() => {
    const id = readInitialPoiIdFromUrl();
    if (!id) return;
    const found = POIS.find((p) => p.id === id);
    if (!found) return;
    setDockTab("explore");
    setXhsHomeEntered(true);
    setViewMode("map");
    setDrawerPoiId(id);
  }, []);

  useEffect(() => {
    if (!footprintOn) return undefined;
    const id = setInterval(() => {
      setFootprintPathPct((prev) => {
        const last = prev[prev.length - 1];
        const next = {
          xPct: Math.min(92, Math.max(8, last.xPct + (Math.random() - 0.5) * 4)),
          yPct: Math.min(90, Math.max(10, last.yPct + (Math.random() - 0.5) * 3)),
        };
        return [...prev, next].slice(-80);
      });
    }, 2200);
    return () => clearInterval(id);
  }, [footprintOn]);

  const toggleCategory = useCallback((c) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }, []);

  const toggleLive = useCallback(() => {
    setLiveOn((prev) => {
      const next = !prev;
      if (next) {
        setLiveShowQueue(true);
        setLiveShowUser(true);
        setPreLiveCategories(new Set(activeCategories));
        setPreLivePersona(persona);
        setActiveCategories(new Set());
        setMenuOpen(null);
      } else {
        if (preLiveCategories) setActiveCategories(new Set(preLiveCategories));
        if (preLivePersona) setPersona(preLivePersona);
        setMenuOpen(null);
      }
      return next;
    });
  }, [activeCategories, persona, preLiveCategories, preLivePersona]);

  const toggleLiveQueue = useCallback(() => {
    setLiveShowQueue((v) => !v);
  }, []);

  const toggleLiveUser = useCallback(() => {
    setLiveShowUser((v) => !v);
  }, []);

  // In list mode, hide real-time controls entirely (no "实况" button).
  useEffect(() => {
    if (viewMode !== "list") return;
    if (!liveOn) return;
    toggleLive();
  }, [viewMode, liveOn, toggleLive]);

  const onMarkerShort = useCallback((id) => {
    if (voiceDemoPhase) {
      const p = POIS.find((x) => x.id === id);
      if (p?.isRestroom) return;
    }
    setDrawerPoiId(id);
  }, [voiceDemoPhase]);

  const toggleRouteMultiForPoi = useCallback((id) => {
    if (!id) return;
    if (voiceDemoPhase) {
      const p = POIS.find((x) => x.id === id);
      if (p?.isRestroom) return;
    }
    setRouteSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setRouteSelectedOrder((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, [voiceDemoPhase]);

  const addSelectedToPlan = useCallback(() => {
    if (routeSelectedOrder.length === 0) return;
    const merged = (() => {
      const seen = new Set(planStopsOrder);
      const m = [...planStopsOrder];
      for (const id of routeSelectedOrder) {
        if (!seen.has(id)) {
          seen.add(id);
          m.push(id);
        }
      }
      return m;
    })();

    setPlanStopsOrder(merged);
    setRouteSelected(new Set());
    setRouteSelectedOrder([]);
    setRouteSheetOpen(true);
  }, [routeSelectedOrder, planStopsOrder]);

  const togglePlanPoi = useCallback((poiId) => {
    if (!poiId) return;
    setPlanStopsOrder((prev) => {
      if (prev.includes(poiId)) return prev.filter((x) => x !== poiId);
      return [...prev, poiId];
    });
    setGeneratedRoutes([]);
  }, []);

  const removePlanStop = useCallback((poiId) => {
    setPlanStopsOrder((prev) => prev.filter((x) => x !== poiId));
    setGeneratedRoutes([]);
  }, []);

  const generateRoutesSuggestions = useCallback(() => {
    if (planStopsOrder.length === 0) return;
    const stops = [...planStopsOrder];
    setRouteGenerating(true);
    setGeneratedRoutes([]);
    window.setTimeout(() => {
      const route = {
        id: `gr-${Date.now()}`,
        name: "AI 推荐 · 少排队动线",
        desc: `按已选 POI 串联，优先等待角标更低的点（Mock）`,
        eta: `步行约 ${2 + Math.round(stops.length * 0.35)} km · 预估 ${
          2 + Math.floor(stops.length * 0.55)
        }h`,
        stops,
      };
      setGeneratedRoutes([route]);
      setRouteGenerating(false);
    }, 900);
  }, [planStopsOrder]);

  const enterSilentNav = useCallback(
    (route) => {
      const center =
        footprintPathPct[footprintPathPct.length - 1] || START_PT;

      const stops = route?.stops || [];
      const stopPts = stops
        .map((sid) => POIS.find((p) => p.id === sid)?.pos)
        .filter(Boolean);

      setSilentRouteLinePct([center, ...stopPts]);

      setSilentNav({
        center,
        radiusPct: 24,
        routeId: route?.id,
      });
      setRouteSheetOpen(false);
    },
    [footprintPathPct]
  );

  const onPostGenerate = useCallback(
    (style) => {
      const stops = visiblePOIs.slice(0, 4).map((p) => p.title);
      if (style === "guide") {
        setPostPreview({
          title: "SHDL 一日游｜少排队动线复盘",
          sub: `足迹 ${Math.max(0, footprintPathPct.length - 1)} 段 · 攻略体`,
          tags: ["#上海迪士尼", "#动线", "#UGC排队"],
          bullets: [
            `推荐顺序：${stops.join(" → ") || "按地图顺时针"}`,
            "实况打开时优先刷等待角标低的项目",
            "带娃建议：米奇大街先吃饭再冲项目",
          ],
        });
      } else {
        setPostPreview({
          title: "今天在城堡前被光击中 ✨",
          sub: `情绪记录 · 故事体 · ${footprintOn ? "有足迹" : "未开足迹"}`,
          tags: ["#迪士尼心情", "#出片", "#慢游"],
          bullets: [
            "阳光落在花坛边，像自动加了柔光滤镜。",
            "和朋友说好了：下次还要在宝藏湾发呆。",
            stops.length
              ? `偷偷记下喜欢的角落：${stops[0]}`
              : "没做攻略也没关系，迷路也是浪漫。",
          ],
        });
      }
    },
    [visiblePOIs, footprintPathPct.length, footprintOn]
  );

  const toggleFootprint = useCallback(() => {
    setFootprintOn((v) => {
      const next = !v;
      if (next) setFootprintPathPct([START_PT]);
      return next;
    });
  }, []);

  const findNearestPoi = useCallback((pin) => {
    if (!pin) return null;
    let best = null;
    let bestD2 = Infinity;
    for (const p of POIS) {
      const dx = p.pos.xPct - pin.xPct;
      const dy = p.pos.yPct - pin.yPct;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = p;
      }
    }
    return best;
  }, []);

  const openMapPublishChoice = useCallback(
    (pinPos) => {
      if (!pinPos) return;
      const nearest = findNearestPoi(pinPos);
      setMapPublishDraft({
        pinPosPct: pinPos,
        nearestTitle: nearest?.title ?? null,
        nearestPoiId: nearest?.id ?? null,
      });
    },
    [findNearestPoi]
  );

  const onExitSilentNav = useCallback(() => {
    setSilentNav(null);
    setSilentRouteLinePct([]);
  }, []);

  const onOpenHelpPin = useCallback((p) => {
    setHelpPin(p);
    setHelpSheetOpen(true);
  }, []);

  const onHelpPinExpired = useCallback((id) => {
    setUserHelpPins((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const submitSeekHelp = useCallback(
    (payload) => {
      if (payload?.editId) {
        const nextExpires =
          typeof payload.durationSec === "number"
            ? Date.now() + payload.durationSec * 1000
            : undefined;
        setUserHelpPins((prev) =>
          prev.map((p) =>
            p.id === payload.editId
              ? {
                  ...p,
                  title: payload.title,
                  body: payload.body,
                  ...(nextExpires != null ? { expiresAtMs: nextExpires } : {}),
                }
              : p
          )
        );
        setSeekHelpOpen(false);
        setSeekHelpAnchor(null);
        setHelpEditingPin(null);
        return;
      }
      const { title, body, durationSec, pinPosPct } = payload;
      if (!pinPosPct) return;
      setUserHelpPins((prev) => [
        ...prev,
        {
          id: `uhelp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          body,
          pos: pinPosPct,
          expiresAtMs: Date.now() + durationSec * 1000,
        },
      ]);
      if (!liveOn) toggleLive();
      else setLiveShowUser(true);
      setSeekHelpOpen(false);
      setSeekHelpAnchor(null);
      setHelpEditingPin(null);
    },
    [liveOn, toggleLive]
  );

  const saveCheckIn = useCallback(
    ({ pinPosPct, fileDataUrl, caption }) => {
      if (!pinPosPct || !fileDataUrl) return;
      const nearest = checkInDraftPoiId
        ? POIS.find((p) => p.id === checkInDraftPoiId)
        : findNearestPoi(pinPosPct);

      const item = {
        id: `ci-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        xPct: pinPosPct.xPct,
        yPct: pinPosPct.yPct,
        poiId: nearest?.id || null,
        imgDataUrl: fileDataUrl,
        caption: caption || "",
        ts: Date.now(),
      };
      setCheckIns((prev) => [...prev, item]);

      setFootprintOn((v) => {
        // If user is recording footprint, chain photos into the path.
        if (!v) return v;
        setFootprintPathPct((path) => [...path, { xPct: item.xPct, yPct: item.yPct }].slice(-80));
        return v;
      });

      setCheckInSheetOpen(false);
      setCheckInPinPosPct(null);
      setCheckInDraftPoiTitle(null);
      setCheckInDraftPoiId(null);
    },
    [checkInDraftPoiId, findNearestPoi]
  );

  const onSendMessage = useCallback((threadId, text) => {
    if (!threadId) return;
    const userMsg = {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: "me",
      threadId,
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Mock response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply =
        "我看到了！我们按更省排队的方式会合（Mock）。";
      if (lower.includes("洗手间") || lower.includes("厕所")) {
        reply = "洗手间我帮你标在附近，按最近路径过去（Mock）。";
      } else if (lower.includes("拍照") || lower.includes("出片")) {
        reply = "出片点我推荐：城堡前花坛机位（Mock）。";
      } else if (lower.includes("排队") || lower.includes("等")) {
        reply = "想少排队：优先看等待角标更低的项目（Mock）。";
      } else if (lower.includes("亲子") || lower.includes("孩子")) {
        reply = "亲子松弛路线：城堡 → 米奇大街 → 漂流（Mock）。";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          from: "them",
          threadId,
          text: reply,
          ts: Date.now(),
        },
      ]);
    }, 900);
  }, []);

  const openMessages = useCallback((nav) => {
    setMessagesNav(nav ?? null);
    setMessagesOpen(true);
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      const now = Date.now();
      return CHAT_CONVERSATIONS.map((c, i) => ({
        id: `seed-${c.id}`,
        from: "them",
        threadId: c.id,
        text: c.preview,
        ts: now + i,
      }));
    });
  }, []);

  return (
    <PhoneFrame>
      <div className="relative flex min-h-0 flex-1 flex-col bg-white">
        {dockTab === "explore" && (
          <>
            {!xhsHomeEntered ? (
              <XhsHome
                onEnterMap={() => {
                  setXhsHomeEntered(true);
                  setViewMode("map");
                }}
              />
            ) : (
              <>
                <MapSearchBar />
                <TopControls
                  viewMode={viewMode}
                  onViewMode={setViewMode}
                  activeCategories={activeCategories}
                  onToggleCategory={toggleCategory}
                  persona={persona}
                  onPersona={setPersona}
                  liveOn={liveOn}
                  onToggleLive={toggleLive}
                  liveShowQueue={liveShowQueue}
                  liveShowUser={liveShowUser}
                  onToggleLiveQueue={toggleLiveQueue}
                  onToggleLiveUser={toggleLiveUser}
                  menuOpen={menuOpen}
                  onMenuOpen={setMenuOpen}
                  withMapSearch
                />
                <div className="relative min-h-0 flex-1 px-0">
                  {viewMode === "map" ? (
                    <>
                      <IllustratedMap
                        pois={mapPoisToRender}
                        liveOn={liveOn}
                        liveShowQueue={liveShowQueue}
                        livePins={livePinsToRender}
                        routeSelectedIds={routeSelected}
                        footprintPathPct={footprintPathPct}
                        footprintOn={footprintOn}
                        silentNav={silentNav}
                        onExitSilentNav={onExitSilentNav}
                        onMarkerShort={onMarkerShort}
                        onMarkerLong={toggleRouteMultiForPoi}
                        onMapLongPress={openMapPublishChoice}
                        onHelpPinExpired={onHelpPinExpired}
                        checkInPinPosPct={checkInPinPosPct}
                        voiceAnswerText={
                          voiceDemoPhase ? voiceAnswerText : null
                        }
                        voiceRouteLinePct={
                          voiceDemoPhase === "nav"
                            ? voiceRouteLinePct
                            : silentNav
                              ? silentRouteLinePct
                              : []
                        }
                        hideSilentNavExit={Boolean(voiceDemoPhase)}
                        onOpenHelpPin={onOpenHelpPin}
                      />
                      {showMapFloats && routeSelectedOrder.length > 0 && (
                        <button
                          type="button"
                          onClick={addSelectedToPlan}
                          className="absolute bottom-[152px] left-1/2 z-[46] -translate-x-1/2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-black text-[#ff2442] shadow-xl backdrop-blur-md"
                        >
                          加入游览计划（{routeSelectedOrder.length}）
                        </button>
                      )}
                    </>
                  ) : (
                    <ListViewPanel
                      pois={visiblePOIs}
                      selectedId={drawerPoiId}
                      onSelect={onMarkerShort}
                    />
                  )}
                  <AnimatePresence>
                    {voiceOn && <VoicePulseOverlay key="voice" />}
                  </AnimatePresence>
                </div>
                {showMapFloats && (
                  <>
                    <AskMapMic
                      active={voiceOn}
                      onPress={() => {
                        setMenuOpen(null);
                        if (voiceDemoPhase) {
                          setVoiceDemoPhase(null);
                          setVoiceAnswerText("");
                          setVoiceRestroomId(null);
                          setVoiceRouteLinePct([]);
                          setSilentNav(null);
                          setVoiceOn(false);
                          return;
                        }
                        setVoiceOn(true);
                        startRestroomVoiceDemo();
                      }}
                    />
                    <button
                      type="button"
                      aria-label="实况消息"
                      onClick={openMessages}
                      className="absolute left-4 bottom-[100px] z-[42] flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white/80 text-[#ff2442] shadow-lg backdrop-blur-md"
                    >
                      <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
                    </button>
                    <RoutePlanFab
                      onOpen={() => setRouteSheetOpen(true)}
                      className="right-16"
                    />
                    <button
                      type="button"
                      aria-label="返回小红书首页"
                      onClick={() => setXhsHomeEntered(false)}
                      className="absolute bottom-[100px] right-4 z-[42] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-zinc-800 shadow-lg backdrop-blur-md"
                    >
                      <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}

        {dockTab === "me" && (
          <div className="min-h-0 flex-1 overflow-y-auto rn-scroll px-3 pb-24 pt-12">
            <MeTab
              footprintOn={footprintOn}
              onToggleFootprint={toggleFootprint}
              checkIns={checkIns}
              planStopsOrder={planStopsOrder}
              onOpenPost={() => {
                setPostPreview(null);
                setPostOpen(true);
              }}
            />
          </div>
        )}

        {xhsHomeEntered && (
          <BottomDock tab={dockTab} onTab={setDockTab} />
        )}

        <AnimatePresence>
          {drawerPoi && (
            <POIDrawer
              poi={drawerPoi}
              onClose={() => setDrawerPoiId(null)}
              onTogglePlan={togglePlanPoi}
              isInPlan={planStopsOrder.includes(drawerPoi.id)}
            />
          )}
        </AnimatePresence>

        <RoutePlanSheet
          open={routeSheetOpen}
          onClose={() => setRouteSheetOpen(false)}
          planStopsOrder={planStopsOrder}
          generatedRoutes={generatedRoutes}
          routeGenerating={routeGenerating}
          onGenerateRoutes={generateRoutesSuggestions}
          onSilentNav={enterSilentNav}
          onRemoveStop={removePlanStop}
          onEditRoute={(route) => {
            if (!route?.stops?.length) return;
            setPlanStopsOrder([...route.stops]);
            setGeneratedRoutes([]);
          }}
        />

        <PostGenerateModal
          open={postOpen}
          onClose={() => {
            setPostOpen(false);
            setPostPreview(null);
          }}
          preview={postPreview}
          onGenerate={onPostGenerate}
        />

        <CheckInSheet
          open={checkInSheetOpen}
          onClose={() => {
            setCheckInSheetOpen(false);
            setCheckInPinPosPct(null);
            setCheckInDraftPoiTitle(null);
            setCheckInDraftPoiId(null);
          }}
          pinPosPct={checkInPinPosPct}
          poiTitle={checkInDraftPoiTitle}
          onSave={saveCheckIn}
        />

        <PublishChoiceSheet
          open={Boolean(mapPublishDraft)}
          subLabel={
            mapPublishDraft
              ? `地图空白处长按${
                  mapPublishDraft.nearestTitle
                    ? ` · 附近参考：${mapPublishDraft.nearestTitle}`
                    : ""
                }`
              : undefined
          }
          onClose={() => setMapPublishDraft(null)}
          onPickCheckIn={() => {
            if (!mapPublishDraft) return;
            const d = mapPublishDraft;
            setMapPublishDraft(null);
            setCheckInPinPosPct({ ...d.pinPosPct });
            setCheckInDraftPoiTitle(d.nearestTitle);
            setCheckInDraftPoiId(d.nearestPoiId);
            setCheckInSheetOpen(true);
          }}
          onPickSeekHelp={() => {
            if (!mapPublishDraft) return;
            const d = mapPublishDraft;
            setHelpEditingPin(null);
            setSeekHelpAnchor({
              pos: d.pinPosPct,
              poiTitle: d.nearestTitle,
            });
            setMapPublishDraft(null);
            setSeekHelpOpen(true);
          }}
        />

        <SeekHelpSheet
          open={seekHelpOpen}
          onClose={() => {
            setSeekHelpOpen(false);
            setSeekHelpAnchor(null);
            setHelpEditingPin(null);
          }}
          poiTitle={helpEditingPin ? undefined : seekHelpAnchor?.poiTitle}
          pinPosPct={helpEditingPin?.pos ?? seekHelpAnchor?.pos}
          editingPin={helpEditingPin}
          onSubmit={submitSeekHelp}
        />

        <MessagesSheet
          open={messagesOpen}
          onClose={() => {
            setMessagesOpen(false);
            setMessagesNav(null);
          }}
          initialNav={messagesNav}
          messages={messages}
          onSend={onSendMessage}
        />
        <HelpRequestSheet
          open={helpSheetOpen}
          onClose={() => {
            setHelpSheetOpen(false);
            setHelpPin(null);
          }}
          pin={helpPin}
          onGoChat={() => {
            setHelpSheetOpen(false);
            setHelpPin(null);
            openMessages({
              threadId: "conv-photo-buddy",
              openChat: true,
            });
          }}
          onEditOwn={(pin) => {
            setHelpEditingPin({
              id: pin.id,
              title: pin.title,
              body: pin.body ?? "",
              pos: pin.pos,
              expiresAtMs: pin.expiresAtMs,
            });
            setHelpSheetOpen(false);
            setHelpPin(null);
            setSeekHelpOpen(true);
          }}
          onResolveOwn={(pin) => {
            setUserHelpPins((prev) =>
              prev.map((p) =>
                p.id === pin.id ? { ...p, resolved: true } : p
              )
            );
            setHelpSheetOpen(false);
            setHelpPin(null);
          }}
          onDeleteOwn={(pin) => {
            setUserHelpPins((prev) => prev.filter((p) => p.id !== pin.id));
            setHelpSheetOpen(false);
            setHelpPin(null);
          }}
        />
      </div>
    </PhoneFrame>
  );
}
