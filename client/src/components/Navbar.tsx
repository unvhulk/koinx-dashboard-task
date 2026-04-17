import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,12,27,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/6 shadow-[0_14px_40px_rgba(3,10,30,0.35)]">
            <span className="text-lg font-semibold tracking-[0.24em] text-white">
              KX
            </span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl leading-none text-white">
              KoinX
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-cyan-100/55 transition group-hover:text-cyan-100/80">
              Content Ideas Dashboard
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 text-sm text-slate-200">
          <Link
            href="/"
            className="rounded-full px-4 py-2 transition hover:bg-white/8 hover:text-white"
          >
            Analyze
          </Link>
          <Link
            href="/history"
            className="rounded-full px-4 py-2 transition hover:bg-white/8 hover:text-white"
          >
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
