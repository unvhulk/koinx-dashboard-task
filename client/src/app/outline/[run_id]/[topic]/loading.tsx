export default function OutlineLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex gap-8 xl:gap-12">
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5">
            <div className="h-3 w-28 rounded-full bg-white/8" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/6" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-white/8" />
            <div className="h-10 w-2/3 rounded-2xl bg-white/8" />
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.28)]">
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
              <div className="spinner-ring relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-100/30 border-t-cyan-100" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">
                  Loading editor
                </p>
                <p className="text-sm text-slate-300/68">
                  Opening outline workspace and preparing generation.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="h-3 w-32 rounded-full bg-white/8" />
            <div className="mt-4 h-24 rounded-[20px] bg-white/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
