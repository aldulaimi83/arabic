import Link from 'next/link';
import FeatureShowcase from './components/FeatureShowcase';

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="px-4 pb-14 pt-10 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="animate-slide-in">
            <div className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              Built for kids abroad learning Arabic at home
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
              Arabic reading and writing lessons that actually feel usable on a phone
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Start with the alphabet, train recognition, build vocabulary, read short
              phrases, and trace letters step by step with touch-friendly writing boards.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/modules/1"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-4 text-center text-lg font-bold text-white shadow-[0_18px_50px_rgba(124,58,237,0.32)] hover:from-violet-700 hover:to-fuchsia-600"
              >
                Start lesson 1
              </Link>
              <a
                href="#levels"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
              >
                Explore the levels
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">Touch-friendly tracing</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">Letter recognition game</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">Audio pronunciation</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">Structured 5-level path</span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.34)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">
              What improved
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">Level 2</p>
                <p className="mt-2 text-lg font-bold">Interactive letter recognition</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Kids now choose the right Arabic letter instead of seeing a placeholder.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">Level 5</p>
                <p className="mt-2 text-lg font-bold">Guided tracing practice</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Letter-by-letter writing practice now works on mobile and desktop.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">Lesson audio</p>
                <p className="mt-2 text-lg font-bold">Pronunciation buttons now speak</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  The hear buttons now trigger Arabic speech instead of dead placeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-sky-100 bg-white/90 p-6 shadow-lg">
            <div className="text-3xl">📱</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Mobile-first lesson flow</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Large buttons, card-based lessons, and touch-safe writing boards make it usable on
              phones without pinching and zooming.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white/90 p-6 shadow-lg">
            <div className="text-3xl">🧠</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Real learning sequence</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The site now moves from letters to recognition, words, reading, and writing instead
              of leaving key levels unfinished.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-amber-100 bg-white/90 p-6 shadow-lg">
            <div className="text-3xl">👨‍👩‍👧</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Parent-friendly structure</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Each lesson has a clear goal so a parent or weekend school teacher can guide a child
              without guessing what to do next.
            </p>
          </div>
        </div>
      </section>

      <FeatureShowcase />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2.25rem] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-6 py-10 text-white shadow-[0_30px_80px_rgba(124,58,237,0.24)] sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div>
              <h2 className="text-3xl font-black sm:text-5xl">
                Better than a toy site. Still simple enough for kids.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/90 sm:text-lg">
                Use the site as a home supplement, an after-school Arabic practice tool, or a
                weekend Islamic school companion.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-semibold">
              <div className="rounded-2xl bg-white/15 px-4 py-3">Alphabet deck with forms</div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">Recognition game with score</div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">Touch tracing for handwriting</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
