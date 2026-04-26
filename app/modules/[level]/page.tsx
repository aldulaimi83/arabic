'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Flashcard from '@/app/components/Flashcard';
import LetterTracing from '@/app/components/LetterTracing';
import RecognitionGame from '@/app/components/RecognitionGame';
import { speakArabic } from '@/lib/speech';
import { arabicAlphabet, basicVocabulary, simpleSentences } from '@/lib/vocabulary';

interface PageProps {
  params: Promise<{ level: string }>;
}

export default function LevelPage({ params }: PageProps) {
  const { level: levelParam } = use(params);
  const level = parseInt(levelParam || '1');
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const getLevelContent = () => {
    switch (level) {
      case 1:
        return {
          title: 'Level 1: Arabic Alphabet',
          description: 'Learn the 28 Arabic letters with their forms and pronunciation.',
        };
      case 2:
        return {
          title: 'Level 2: Letter Recognition',
          description: 'Practice identifying letters through a simple game built for children.',
        };
      case 3:
        return {
          title: 'Level 3: Word Building',
          description: 'Learn basic vocabulary with meaning and listen to each word.',
        };
      case 4:
        return {
          title: 'Level 4: Reading Practice',
          description: 'Read simple Arabic phrases and understand what they mean.',
        };
      case 5:
        return {
          title: 'Level 5: Writing Exercises',
          description: 'Trace Arabic letters one by one with touch-friendly writing practice.',
        };
      default:
        return {
          title: 'Level 1: Arabic Alphabet',
          description: 'Learn the 28 Arabic letters.',
        };
    }
  };

  const levelData = getLevelContent();

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center animate-slide-in">
          <div className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            Structured Arabic lesson
          </div>
          <h1 className="mb-4 mt-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
            {levelData.title}
          </h1>
          <p className="mx-auto mb-6 max-w-3xl text-lg leading-8 text-gray-700 sm:text-xl">
            {levelData.description}
          </p>

          {level === 1 && (
            <div className="mx-auto mb-6 max-w-3xl">
              <div className="mb-2 flex justify-between text-sm font-semibold text-gray-600">
                <span>Progress</span>
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

        {level === 1 && (
          <div className="mb-8 rounded-[2rem] bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <Flashcard letter={arabicAlphabet[currentIndex]} onNext={handleNext} />

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-2xl bg-gray-200 px-6 py-3 font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
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
                Next
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
                  Hear the word
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
                <p className="mb-4 text-right text-5xl font-bold text-purple-600">{sentence.ar}</p>
                <p className="mb-6 text-2xl font-semibold text-gray-600">Translation: {sentence.en}</p>
                <button
                  onClick={() => speakArabic(sentence.ar)}
                  className="rounded-2xl bg-amber-400 px-6 py-3 font-bold text-gray-800 hover:bg-yellow-500"
                >
                  Hear pronunciation
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
              Previous level
            </Link>
          )}
          <Link
            href="/"
            className="rounded-2xl bg-purple-500 px-6 py-3 text-center font-bold text-white hover:bg-purple-600"
          >
            Back to Home
          </Link>
          {level < 5 && (
            <Link
              href={`/modules/${level + 1}`}
              className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-center font-bold text-white hover:from-purple-600 hover:to-pink-600"
            >
              Next level
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
