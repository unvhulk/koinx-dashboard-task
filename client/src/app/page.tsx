import { SearchForm } from "@/components/SearchForm";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-6 py-8 shadow-[0_36px_120px_rgba(2,8,23,0.28)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,244,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(91,228,198,0.12),transparent_26%)]" />
          <div className="relative grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/14 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-cyan-100/70">
                Content ideas, powered by your audience
              </div>

              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-300/50">
                  KoinX Content Dashboard
                </p>
                <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-6xl">
                  Find out exactly what your audience wants to read and watch.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300/78">
                  Scan YouTube conversations around crypto taxes, investing, and compliance
                  to surface the real questions people ask, then turn them into ready-to-use
                  blog, video, and social content ideas.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                ["Audience-led", "Built from real comment patterns instead of guesswork."],
                ["Fast research", "Collapse hours of manual review into one focused run."],
                ["Editorial ready", "Get structured topics and titles you can act on immediately."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/55">
                    {title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200/82">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/14 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-cyan-100/70">
              Built for content teams
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_64px_rgba(2,8,23,0.22)]">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">
                What you get
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Real questions", "See the exact confusion and curiosity patterns people post in comments."],
                  ["Suggested titles", "Turn audience language into blog and video angles instantly."],
                  ["Clean signals", "Use filters to cut weak sources and keep the research focused."],
                ].map(([title, copy]) => (
                  <div
                    key={title}
                    className="rounded-[22px] border border-white/8 bg-white/4 px-4 py-4"
                  >
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300/72">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_64px_rgba(2,8,23,0.18)]">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">
                Suggested default
              </p>
              <p className="mt-3 text-base leading-7 text-slate-200/82">
                Start with the first four months of FY 2025–26 to capture early-cycle
                crypto tax questions and seasonal compliance spikes.
              </p>
            </div>
          </div>

          <div className="xl:min-w-0">
            <SearchForm />
          </div>
        </section>
      </div>
    </div>
  );
}
