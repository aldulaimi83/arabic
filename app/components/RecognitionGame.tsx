'use client';

import { useEffect, useMemo, useState } from 'react';
import { Letter } from '@/lib/vocabulary';
import { speakArabic } from '@/lib/speech';
import { useUi } from './UiProvider';

interface RecognitionGameProps {
  letters: Letter[];
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function RecognitionGame({ letters }: RecognitionGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { locale, saveRecognitionScore } = useUi();
  const copy =
    locale === 'ar'
      ? {
          badge: 'لعبة التمييز',
          title: 'اختر الحرف العربي المطابق',
          question: 'السؤال',
          score: 'النتيجة',
          find: 'ابحث عن هذا الحرف',
          hear: 'استمع إلى الحرف',
          choose: 'اختر إجابة ثم انتقل للسؤال التالي.',
          correct: 'إجابة صحيحة. أحسنت.',
          tryRemember: 'تذكر هذا الحرف:',
          next: 'السؤال التالي',
          again: 'العب مرة أخرى',
        }
      : {
          badge: 'Recognition Game',
          title: 'Pick the matching Arabic letter',
          question: 'Question',
          score: 'Score',
          find: 'Find this letter',
          hear: 'Hear letter',
          choose: 'Choose one answer, then move to the next question.',
          correct: 'Correct. Great job.',
          tryRemember: 'Try to remember:',
          next: 'Next Question',
          again: 'Play Again',
        };
  const nameCopy =
    locale === 'ar'
      ? { name: 'الاسم', englishSound: 'الصوت الإنجليزي', is: 'هو' }
      : { name: 'Name', englishSound: 'English sound', is: 'is' };

  const questionSet = useMemo(() => shuffle(letters).slice(0, 10), [letters]);
  const currentLetter = questionSet[questionIndex];

  const options = useMemo(() => {
    if (!currentLetter) return [];
    const distractors = shuffle(letters.filter((letter) => letter.id !== currentLetter.id)).slice(0, 3);
    return shuffle([currentLetter, ...distractors]);
  }, [currentLetter, letters]);

  useEffect(() => {
    setSelectedId(null);
  }, [questionIndex]);

  if (!currentLetter) {
    return null;
  }

  const isFinished = questionIndex >= questionSet.length - 1 && showResult;

  function handleChoice(letter: Letter) {
    if (showResult) return;
    setSelectedId(letter.id);
    setShowResult(true);
    if (letter.id === currentLetter.id) {
      setScore((value) => value + 1);
      speakArabic(currentLetter.ar);
    }
  }

  function handleNext() {
    if (questionIndex >= questionSet.length - 1) {
      saveRecognitionScore(score);
      setQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedId(null);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setShowResult(false);
    setSelectedId(null);
  }

  return (
    <section className="rounded-[2rem] bg-white/95 p-5 shadow-xl ring-1 ring-purple-100 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-500">{copy.badge}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {copy.title}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-purple-50 p-3 text-center text-sm font-semibold text-slate-700">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-purple-500">{copy.question}</div>
            <div className="mt-1 text-lg">{questionIndex + 1} / {questionSet.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-purple-500">{copy.score}</div>
            <div className="mt-1 text-lg">{score}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-fuchsia-100 via-amber-50 to-sky-100 p-6 text-center sm:p-8">
        <p className="text-sm font-semibold text-slate-600">{copy.find}</p>
        <div className="mt-3 text-7xl font-bold text-purple-700 sm:text-8xl">{currentLetter.ar}</div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => speakArabic(currentLetter.ar)}
            className="rounded-full bg-white px-5 py-3 font-bold text-purple-700 shadow-md transition hover:-translate-y-0.5"
          >
            🔊 {copy.hear}
          </button>
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700">
            {nameCopy.name}: {currentLetter.name} • {nameCopy.englishSound}: {currentLetter.english}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {options.map((letter) => {
          const isCorrect = showResult && letter.id === currentLetter.id;
          const isWrong = showResult && selectedId === letter.id && letter.id !== currentLetter.id;

          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => handleChoice(letter)}
              className={[
                'rounded-[1.5rem] border-2 bg-white p-5 text-center shadow-md transition sm:p-6',
                'hover:-translate-y-1 hover:shadow-lg',
                isCorrect ? 'border-emerald-400 bg-emerald-50' : '',
                isWrong ? 'border-rose-400 bg-rose-50' : '',
                !isCorrect && !isWrong ? 'border-purple-100' : '',
              ].join(' ')}
            >
              <div className="text-5xl font-bold text-slate-900">{letter.ar}</div>
              <div className="mt-2 text-sm font-semibold text-slate-500">{letter.name}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-slate-700">
          {!showResult && copy.choose}
          {showResult && selectedId === currentLetter.id && copy.correct}
          {showResult && selectedId !== currentLetter.id && `${copy.tryRemember} ${currentLetter.ar} ${nameCopy.is} ${currentLetter.name}.`}
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={!showResult}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFinished ? copy.again : copy.next}
        </button>
      </div>
    </section>
  );
}
