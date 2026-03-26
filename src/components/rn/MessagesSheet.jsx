import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, SendHorizontal, X } from "lucide-react";
import { tap } from "../../lib/motionPresets.js";
import { CHAT_CONVERSATIONS } from "../../data/chatConversations.js";

function formatTime(ts) {
  const d = new Date(ts || Date.now());
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function MessagesSheet({ open, onClose, messages, onSend, initialNav }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const [view, setView] = useState("list"); // 'list' | 'chat'
  const [activeId, setActiveId] = useState(null);

  const activeConv = useMemo(
    () => CHAT_CONVERSATIONS.find((c) => c.id === activeId) || null,
    [activeId]
  );

  const activeMessages = useMemo(() => {
    if (!activeId) return [];
    return messages.filter((m) => m.threadId === activeId);
  }, [messages, activeId]);

  useEffect(() => {
    if (!open) return;
    setText("");
    if (initialNav?.threadId) {
      setActiveId(initialNav.threadId);
      setView(initialNav.openChat ? "chat" : "list");
    } else {
      setView("list");
      setActiveId(null);
    }
  }, [open, initialNav]);

  useEffect(() => {
    if (!open || view !== "chat") return;
    const t = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 50);
    return () => clearTimeout(t);
  }, [open, view, messages.length, activeId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-[90] bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[91] flex max-h-[92%] min-h-[58vh] flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-[#ededed] shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            {view === "list" ? (
              <>
                <div className="flex items-center justify-between border-b border-black/5 bg-white/95 px-3 py-3 pt-3">
                  <h3 className="text-[17px] font-bold text-zinc-900">消息</h3>
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-black/10 bg-white p-2"
                    {...tap}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#ededed]">
                  {CHAT_CONVERSATIONS.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveId(c.id);
                        setView("chat");
                      }}
                      className="flex w-full items-center gap-3 border-b border-black/5 bg-white px-4 py-3 text-left active:bg-zinc-100"
                      {...tap}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ff2442]/12 text-sm font-black text-[#ff2442]">
                        {c.title.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[16px] font-semibold text-zinc-900">
                            {c.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-zinc-400">
                            {c.time}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-zinc-500">
                          {c.preview}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-black/5 bg-white/95 px-2 py-2">
                  <motion.button
                    type="button"
                    aria-label="返回"
                    onClick={() => setView("list")}
                    className="rounded-lg p-2 text-zinc-800"
                    {...tap}
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
                  </motion.button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-center text-[16px] font-semibold text-zinc-900">
                      {activeConv?.title || "聊天"}
                    </p>
                  </div>
                  <div className="w-10" />
                </div>

                <div
                  ref={listRef}
                  className="min-h-[52vh] flex-1 overflow-y-auto rn-scroll px-3 py-3"
                >
                  {activeMessages.length === 0 ? (
                    <div className="rounded-lg bg-white/90 px-3 py-2 text-center text-[13px] text-zinc-500">
                      暂无消息，发一条开始吧
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${
                            m.from === "me" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-lg px-3 py-2 shadow-sm ${
                              m.from === "me"
                                ? "bg-[#95ec69] text-zinc-900"
                                : "bg-white text-zinc-900"
                            }`}
                          >
                            <p className="text-[15px] font-medium leading-relaxed">
                              {m.text}
                            </p>
                            <p
                              className={`mt-1 text-[10px] ${
                                m.from === "me"
                                  ? "text-zinc-600"
                                  : "text-zinc-400"
                              }`}
                            >
                              {formatTime(m.ts)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-black/5 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-center gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="输入消息..."
                      className="flex-1 rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 text-[15px] font-medium text-zinc-900 outline-none"
                    />
                    <motion.button
                      type="button"
                      disabled={!text.trim()}
                      onClick={() => {
                        const v = text.trim();
                        if (!v || !activeId) return;
                        onSend?.(activeId, v);
                        setText("");
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff2442] text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
                      {...tap}
                    >
                      <SendHorizontal className="h-5 w-5" strokeWidth={2.4} />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
