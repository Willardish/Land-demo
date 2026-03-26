export function PhoneFrame({ children }) {
  return (
    <div
      className="flex min-h-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-rose-50/40 px-0 py-3"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[2.75rem] bg-white shadow-[0_28px_90px_-16px_rgba(0,0,0,0.28)] ring-[10px] ring-zinc-900/95"
        style={{ width: 390, height: 844, maxWidth: "100%" }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-50 h-7 w-[120px] -translate-x-1/2 rounded-b-2xl bg-black/90"
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}
