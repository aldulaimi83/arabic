'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import FeatureShowcase from './components/FeatureShowcase';
import { useUi } from './components/UiProvider';

export default function Home() {
  const { locale, childName, setChildName, progress } = useUi();
  const [draftName, setDraftName] = useState(childName);
  const copy =
    locale === 'ar'
      ? {
          badge: 'مبني للأطفال خارج البلاد ليتعلموا العربية في البيت',
          title: 'دروس قراءة وكتابة عربية تعمل بشكل جيد على الهاتف',
          body: 'ابدأ بالحروف، ثم تمييزها، ثم الكلمات، ثم الجمل القصيرة، ثم تتبع الحروف خطوة بخطوة بلوحة كتابة مريحة.',
          start: 'ابدأ الدرس الأول',
          explore: 'استكشف المستويات',
          tags: ['تتبّع مناسب للمس', 'لعبة تمييز الحروف', 'نطق صوتي', 'خمس مستويات واضحة'],
          improved: 'ما الجديد',
          level2: 'المستوى 2',
          level2Body: 'يمكن للطفل الآن اختيار الحرف الصحيح بدل الصفحة الفارغة.',
          level5: 'المستوى 5',
          level5Body: 'يوجد الآن تدريب كتابة حرفًا حرفًا على الهاتف والكمبيوتر.',
          audio: 'الصوت',
          audioBody: 'أزرار الاستماع أصبحت تعمل بدل كونها شكلًا فقط.',
          mobile: 'تدفق مناسب للهاتف',
          mobileBody: 'الأزرار الكبيرة وبطاقات الدروس ولوحة الكتابة اللمسية تجعل التعلم أسهل على الهاتف.',
          sequence: 'تسلسل تعلم حقيقي',
          sequenceBody: 'الموقع ينتقل من الحروف إلى التمييز والكلمات والقراءة والكتابة بدل ترك مستويات ناقصة.',
          parent: 'هيكل واضح للوالدين',
          parentBody: 'كل مستوى له هدف واضح ليسهل على الأهل أو المعلمين متابعة الطفل.',
          better: 'أفضل من موقع ألعاب بسيط، لكنه ما زال سهلًا للأطفال.',
          betterBody: 'استخدم الموقع كأداة منزلية أو بعد المدرسة أو في مدارس نهاية الأسبوع.',
          card1: 'بطاقات حروف مع الأشكال',
          card2: 'لعبة تمييز مع نتيجة',
          card3: 'تتبع الحروف باللمس',
          profile: 'ملف الطفل',
          profileHint: 'اكتب اسم الطفل لحفظ التقدم على هذا الجهاز.',
          profileSave: 'سيتم الحفظ تلقائيًا',
          saveName: 'حفظ الاسم',
          letters: 'آخر حرف',
          score: 'أفضل نتيجة',
          tracing: 'مرات الكتابة',
          levels: 'المستويات المفتوحة',
          guest: 'ضيف',
        }
      : {
          badge: 'Built for kids abroad learning Arabic at home',
          title: 'Arabic reading and writing lessons that actually feel usable on a phone',
          body: 'Start with the alphabet, train recognition, build vocabulary, read short phrases, and trace letters step by step with touch-friendly writing boards.',
          start: 'Start lesson 1',
          explore: 'Explore the levels',
          tags: ['Touch-friendly tracing', 'Letter recognition game', 'Audio pronunciation', 'Structured 5-level path'],
          improved: 'What improved',
          level2: 'Level 2',
          level2Body: 'Kids now choose the right Arabic letter instead of seeing a placeholder.',
          level5: 'Level 5',
          level5Body: 'Letter-by-letter writing practice now works on mobile and desktop.',
          audio: 'Lesson audio',
          audioBody: 'The hear buttons now trigger Arabic speech instead of dead placeholders.',
          mobile: 'Mobile-first lesson flow',
          mobileBody: 'Large buttons, card-based lessons, and touch-safe writing boards make it usable on phones without pinching and zooming.',
          sequence: 'Real learning sequence',
          sequenceBody: 'The site now moves from letters to recognition, words, reading, and writing instead of leaving key levels unfinished.',
          parent: 'Parent-friendly structure',
          parentBody: 'Each lesson has a clear goal so a parent or weekend school teacher can guide a child without guessing what to do next.',
          better: 'Better than a toy site. Still simple enough for kids.',
          betterBody: 'Use the site as a home supplement, an after-school Arabic practice tool, or a weekend Islamic school companion.',
          card1: 'Alphabet deck with forms',
          card2: 'Recognition game with score',
          card3: 'Touch tracing for handwriting',
          profile: 'Child profile',
          profileHint: 'Type the child name to save progress on this device.',
          profileSave: 'Progress saves automatically',
          saveName: 'Save name',
          letters: 'Last letter',
          score: 'Best score',
          tracing: 'Tracing sessions',
          levels: 'Opened levels',
          guest: 'Guest',
        };

  useEffect(() => {
    setDraftName(childName);
  }, [childName]);

  const handleSaveName = () => {
    setChildName(draftName);
  };
  return (
    <div className="min-h-screen">
      <section className="px-4 pb-14 pt-10 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="animate-slide-in">
            <div className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              {copy.badge}
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {copy.body}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/modules/1"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-4 text-center text-lg font-bold text-white shadow-[0_18px_50px_rgba(124,58,237,0.32)] hover:from-violet-700 hover:to-fuchsia-600"
              >
                {copy.start}
              </Link>
              <a
                href="#levels"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
              >
                {copy.explore}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              {copy.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-4 py-2 shadow-sm">{tag}</span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.34)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">
              {copy.improved}
            </p>
            <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4">
              <label className="block text-sm font-semibold text-violet-200">{copy.profile}</label>
              <div className="mt-3 flex gap-2">
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSaveName();
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-base font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400"
                  placeholder={locale === 'ar' ? 'اسم الطفل' : 'Child name'}
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-500"
                >
                  {copy.saveName}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-300">{copy.profileHint}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
                <div className="rounded-2xl bg-white/10 px-3 py-3">{copy.letters}: {progress.alphabetIndex + 1}</div>
                <div className="rounded-2xl bg-white/10 px-3 py-3">{copy.score}: {progress.recognitionBest}</div>
                <div className="rounded-2xl bg-white/10 px-3 py-3">{copy.tracing}: {progress.tracingSessions}</div>
                <div className="rounded-2xl bg-white/10 px-3 py-3">{copy.levels}: {progress.visitedLevels.length}</div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {copy.profileSave} · {childName || copy.guest}
              </p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">{copy.level2}</p>
                <p className="mt-2 text-lg font-bold">{locale === 'ar' ? 'تمييز تفاعلي للحروف' : 'Interactive letter recognition'}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {copy.level2Body}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">{copy.level5}</p>
                <p className="mt-2 text-lg font-bold">{locale === 'ar' ? 'كتابة موجهة' : 'Guided tracing practice'}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {copy.level5Body}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold text-violet-200">{copy.audio}</p>
                <p className="mt-2 text-lg font-bold">{locale === 'ar' ? 'أزرار النطق تعمل الآن' : 'Pronunciation buttons now speak'}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {copy.audioBody}
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
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{copy.mobile}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.mobileBody}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white/90 p-6 shadow-lg">
            <div className="text-3xl">🧠</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{copy.sequence}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.sequenceBody}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-amber-100 bg-white/90 p-6 shadow-lg">
            <div className="text-3xl">👨‍👩‍👧</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{copy.parent}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.parentBody}
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
                {copy.better}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/90 sm:text-lg">
                {copy.betterBody}
              </p>
            </div>
            <div className="grid gap-3 text-sm font-semibold">
              <div className="rounded-2xl bg-white/15 px-4 py-3">{copy.card1}</div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">{copy.card2}</div>
              <div className="rounded-2xl bg-white/15 px-4 py-3">{copy.card3}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
