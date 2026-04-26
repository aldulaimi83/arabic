'use client';

import Link from 'next/link';
import { useUi } from './UiProvider';

const levels = [
  {
    id: '01',
    title: 'Alphabet',
    description: 'Learn each Arabic letter, its name, and how the shape changes across a word.',
    href: '/modules/1',
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    id: '02',
    title: 'Recognition',
    description: 'Practice fast visual recognition with a kid-friendly multiple-choice game.',
    href: '/modules/2',
    accent: 'from-emerald-500 to-lime-400',
  },
  {
    id: '03',
    title: 'Words',
    description: 'Build early vocabulary around family, home, numbers, and colors.',
    href: '/modules/3',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    id: '04',
    title: 'Reading',
    description: 'Read short phrases with clear meaning and listen to pronunciation.',
    href: '/modules/4',
    accent: 'from-pink-500 to-rose-400',
  },
  {
    id: '05',
    title: 'Writing',
    description: 'Trace letters one by one on mobile or desktop and repeat the sound.',
    href: '/modules/5',
    accent: 'from-violet-600 to-fuchsia-500',
  },
];

export default function FeatureShowcase() {
  const { locale } = useUi();
  const intro =
    locale === 'ar'
      ? {
          badge: 'مسار التعلم',
          title: 'خمسة مستويات مترابطة بدل ألعاب عشوائية',
          body: 'الموقع الآن يملك مسارًا واضحًا: الحروف، التمييز، المفردات، القراءة القصيرة، والكتابة الموجهة.',
          open: 'افتح الدرس',
          levels: [
            { id: '01', title: 'الحروف', description: 'تعلم كل حرف عربي واسمه وكيف يتغير شكله داخل الكلمة.' },
            { id: '02', title: 'التمييز', description: 'تدرّب على التعرف السريع على الحروف بلعبة مناسبة للأطفال.' },
            { id: '03', title: 'الكلمات', description: 'ابنِ مفردات مبكرة حول الأسرة والبيت والأرقام والألوان.' },
            { id: '04', title: 'القراءة', description: 'اقرأ عبارات قصيرة واضحة المعنى واستمع إلى النطق.' },
            { id: '05', title: 'الكتابة', description: 'تتبّع الحروف حرفًا حرفًا على الهاتف أو الكمبيوتر.' },
          ],
        }
      : {
          badge: 'Learning path',
          title: 'Five connected levels instead of random mini-games',
          body: 'The site now has a clear lesson ladder: letter learning, recognition, vocabulary, short reading, and guided writing practice.',
          open: 'Open lesson',
          levels: [
            { id: '01', title: 'Alphabet', description: 'Learn each Arabic letter, its name, and how the shape changes across a word.' },
            { id: '02', title: 'Recognition', description: 'Practice fast visual recognition with a kid-friendly multiple-choice game.' },
            { id: '03', title: 'Words', description: 'Build early vocabulary around family, home, numbers, and colors.' },
            { id: '04', title: 'Reading', description: 'Read short phrases with clear meaning and listen to pronunciation.' },
            { id: '05', title: 'Writing', description: 'Trace letters one by one on mobile or desktop and repeat the sound.' },
          ],
        };
  return (
    <section id="levels" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">{intro.badge}</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
            {intro.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
            {intro.body}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {levels.map((level, index) => (
            <Link
              key={level.id}
              href={level.href}
              className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(95,48,255,0.18)]"
            >
              <div
                className={`inline-flex rounded-full bg-gradient-to-r ${level.accent} px-4 py-2 text-sm font-bold text-white`}
              >
                Level {level.id}
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">{intro.levels[index].title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{intro.levels[index].description}</p>
              <div className="mt-6 text-sm font-bold text-violet-700 transition group-hover:translate-x-1">
                {intro.open}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
