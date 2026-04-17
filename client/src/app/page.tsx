import { SearchForm } from "@/components/SearchForm";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-7xl items-center px-6 py-12 lg:px-10 lg:py-16">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/14 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-cyan-100/70">
            Content ideas, powered by your audience
          </div>

          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-300/50">
              KoinX Content Dashboard
            </p>
            <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-6xl">
              Find out exactly what your audience wants to read and watch.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300/78">
              Pick a topic, pick a date range, and we'll scan YouTube comments to
              surface the questions people are actually asking — grouped into ready-to-use
              blog, video, and social media ideas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Real questions", "See the actual questions and confusions your audience posts in comments."],
              ["Ready-made ideas", "Get blog titles, video topics, and social posts — no brainstorming needed."],
              ["Save time", "What used to take hours of manual research takes under a minute."],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_16px_50px_rgba(2,8,23,0.2)]"
              >
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300/72">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SearchForm />
        </section>
      </div>
    </div>
  );
}
