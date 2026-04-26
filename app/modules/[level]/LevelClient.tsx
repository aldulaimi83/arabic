'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Flashcard from '@/app/components/Flashcard';
import LetterTracing from '@/app/components/LetterTracing';
import RecognitionGame from '@/app/components/RecognitionGame';
import { useUi } from '@/app/components/UiProvider';
import { speakArabic } from '@/lib/speech';
import { arabicAlphabet, basicVocabulary, simpleSentences } from '@/lib/vocabulary';

const lessonCopy = {
  en: {
    badge: 'Structured Arabic lesson',
    levelTitles: {
      1: 'Level 1: Arabic Alphabet',
      2: 'Level 2: Letter Recognition',
      3: 'Level 3: Word Building',
      4: 'Level 4: Reading Practice',
      5: 'Level 5: Writing Exercises',
    },
    levelDescriptions: {
      1: 'Learn the 28 Arabic letters with their forms and pronunciation.',
      2: 'Practice identifying letters through a simple game built for children.',
      3: 'Learn basic vocabulary with meaning and listen to each word.',
      4: 'Read simple Arabic phrases and understand what they mean.',
      5: 'Trace Arabic letters one by one with touch-friendly writing practice.',
    },
    progress: 'Progress',
    previous: 'Previous',
    next: 'Next',
    hearWord: 'Hear the word',
    translation: 'Translation',
    hearPronunciation: 'Hear pronunciation',
    previousLevel: 'Previous level',
    nextLevel: 'Next level',
    backHome: 'Back to Home',
    progressCardTitle: 'Saved progress',
    progressCardBody: 'Learning profile',
    lettersLearned: 'Letters reached',
    bestRecognition: 'Best recognition score',
    tracingSessions: 'Tracing sessions',
    visitedLevels: 'Levels opened',
  },
  ar: {
    badge: 'درس عربي منظم',
    levelTitles: {
      1: 'المستوى 1: الحروف العربية',
      2: 'المستوى 2: تمييز الحروف',
      3: 'المستوى 3: الكلمات',
      4: 'المستوى 4: التدريب على القراءة',
      5: 'المستوى 5: تمارين الكتابة',
    },
    levelDescriptions: {
      1: 'تعلّم الحروف العربية الثمانية والعشرين مع أشكالها ونطقها.',
      2: 'تدرّب على معرفة الحروف من خلال لعبة بسيطة مناسبة للأطفال.',
      3: 'تعلّم كلمات أساسية مع المعنى واستمع إلى نطق كل كلمة.',
      4: 'اقرأ عبارات عربية قصيرة وافهم معناها.',
      5: 'تتبّع الحروف العربية حرفًا حرفًا بلوحة كتابة مناسبة للهاتف.',
    },
    progress: 'التقدم',
    previous: 'السابق',
    next: 'التالي',
    hearWord: 'استمع إلى الكلمة',
    translation: 'الترجمة',
    hearPronunciation: 'استمع إلى النطق',
    previousLevel: 'المستوى السابق',
    nextLevel: 'المستوى التالي',
    backHome: 'العودة للرئيسية',
    progressCardTitle: 'التقدم المحفوظ',
    progressCardBody: 'ملف التعلم',
    lettersLearned: 'آخر حرف وصل إليه',
    bestRecognition: 'أفضل نتيجة في التمييز',
    tracingSessions: 'مرات التدريب على الكتابة',
    visitedLevels: 'المستويات المفتوحة',
  },
} as const;

export default function LevelClient({ level }: { level: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { locale, progress, childName, markLevelVisited, saveAlphabetIndex } = useUi();
  const copy = lessonCopy[locale];

  useEffect(() => {
    markLevelVisited(level);
  }, [level, markLevelVisited]);

  useEffect(() => {
    if (level === 1) {
      setCurrentIndex(progress.alphabetIndex);
    }
  }, [level, progress.alphabetIndex]);

  useEffect(() => {
    if (level === 1) {
      saveAlphabetIndex(currentIndex);
    }
  }, [currentIndex, level, saveAlphabetIndex]);

  const levelTitle =
    copy.levelTitles[level as 1 | 2 | 3 | 4 | 5] ?? copy.levelTitles[1];
  const levelDescription =
    copy.levelDescriptions[level as 1 | 2 | 3 | 4 | 5] ?? copy.levelDescriptions[1];

  const levelProgressSummary = useMemo(
    () => ({
      letters: progress.alphabetIndex + 1,
      levels: progress.visitedLevels.length,
    }),
    [progress.alphabetIndex, progress.visitedLevels.length],
  );

  const handleNext = () => {
    if (level === 1 && currentIndex < arabicAlphabet.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className={`text-center animate-slide-in ${locale === 'ar' ? 'xl:text-right' : 'xl:text-left'}`}>
            <div className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              {copy.badge}
            </div>
            <h1 className="mb-4 mt-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
              {levelTitle}
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-lg leading-8 text-gray-700 sm:text-xl xl:mx-0">
              {levelDescription}
            </p>

            {level === 1 && (
              <div className="mx-auto mb-6 max-w-3xl xl:mx-0">
                <div className="mb-2 flex justify-between text-sm font-semibold text-gray-600">
                  <span>{copy.progress}</span>
                  <span>
                    {currentIndex + 1} / {arabicAlphabet.length}
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-300">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / arabicAlphabet.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">
              {copy.progressCardTitle}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{childName}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.progressCardBody}</p>
            <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3">
                <span>{copy.lettersLearned}</span>
                <span>{levelProgressSummary.letters}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                <span>{copy.bestRecognition}</span>
                <span>{progress.recognitionBest}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                <span>{copy.tracingSessions}</span>
                <span>{progress.tracingSessions}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                <span>{copy.visitedLevels}</span>
                <span>{levelProgressSummary.levels}</span>
              </div>
            </div>
          </aside>
        </div>

        {level === 1 && (
          <div className="mb-8 rounded-[2rem] bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <Flashcard letter={arabicAlphabet[currentIndex]} onNext={handleNext} />

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-2xl bg-gray-200 px-6 py-3 font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-300"
              >
                {copy.previous}
              </button>

              <div className="flex flex-wrap justify-center gap-2">
                {arabicAlphabet.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 w-10 rounded-full font-bold transition-all ${
                      idx === currentIndex
                        ? 'scale-125 bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === arabicAlphabet.length - 1}
                className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:from-purple-600 hover:to-pink-600"
              >
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {level === 2 && <RecognitionGame letters={arabicAlphabet.slice(0, 14)} />}

        {level === 3 && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {basicVocabulary.map((word, idx) => (
              <div
                key={word.id}
                className="rounded-[1.75rem] bg-white p-6 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-4 text-6xl">
                  {['🏠', '👨', '👩', '👦', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '❤️', '💙', '🖤', '🤍'][idx % 13]}
                </div>
                <h3 className="mb-2 text-4xl font-bold text-purple-600">{word.ar}</h3>
                <p className="mb-4 text-2xl font-semibold text-gray-600">{word.en}</p>
                <button
                  onClick={() => speakArabic(word.ar)}
                  className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-bold text-gray-800 hover:bg-yellow-500"
                >
                  {copy.hearWord}
                </button>
              </div>
            ))}
          </div>
        )}

        {level === 4 && (
          <div className="space-y-6">
            {simpleSentences.map((sentence, idx) => (
              <div
                key={idx}
                className="rounded-[1.75rem] bg-white p-8 shadow-lg transition-all hover:shadow-xl"
              >
                <p className={`mb-4 text-5xl font-bold text-purple-600 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  {sentence.ar}
                </p>
                <p className="mb-6 text-2xl font-semibold text-gray-600">
                  {copy.translation}: {sentence.en}
                </p>
                <button
                  onClick={() => speakArabic(sentence.ar)}
                  className="rounded-2xl bg-amber-400 px-6 py-3 font-bold text-gray-800 hover:bg-yellow-500"
                >
                  {copy.hearPronunciation}
                </button>
              </div>
            ))}
          </div>
        )}

        {level === 5 && <LetterTracing letters={arabicAlphabet} />}

        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          {level > 1 && (
            <Link
              href={`/modules/${level - 1}`}
              className="rounded-2xl bg-gray-500 px-6 py-3 text-center font-bold text-white hover:bg-gray-600"
            >
              {copy.previousLevel}
            </Link>
          )}
          <Link
            href="/"
            className="rounded-2xl bg-purple-500 px-6 py-3 text-center font-bold text-white hover:bg-purple-600"
          >
            {copy.backHome}
          </Link>
          {level < 5 && (
            <Link
              href={`/modules/${level + 1}`}
              className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-center font-bold text-white hover:from-purple-600 hover:to-pink-600"
            >
              {copy.nextLevel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
