'use client';

import { useState } from 'react';
import { arabicAlphabet, basicVocabulary, simpleSentences } from '@/lib/vocabulary';
import Flashcard from '@/app/components/Flashcard';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ level: string }>;
}

export default function LevelPage({ params }: PageProps) {
  const level = parseInt((params as any).level || '1');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (level === 1) {
      if (currentIndex < arabicAlphabet.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
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
          description: 'Learn the 28 Arabic letters with their different forms and pronunciation',
          content: arabicAlphabet,
          type: 'alphabet',
        };
      case 2:
        return {
          title: 'Level 2: Letter Recognition',
          description: 'Practice identifying letters through fun games',
          content: arabicAlphabet,
          type: 'recognition',
        };
      case 3:
        return {
          title: 'Level 3: Word Building',
          description: 'Learn basic vocabulary with images and audio',
          content: basicVocabulary,
          type: 'vocabulary',
        };
      case 4:
        return {
          title: 'Level 4: Reading Practice',
          description: 'Read simple sentences and understand their meanings',
          content: simpleSentences,
          type: 'reading',
        };
      case 5:
        return {
          title: 'Level 5: Writing Exercises',
          description: 'Practice writing Arabic letters and words',
          content: arabicAlphabet,
          type: 'writing',
        };
      default:
        return {
          title: 'Level 1: Arabic Alphabet',
          description: 'Learn the 28 Arabic letters',
          content: arabicAlphabet,
          type: 'alphabet',
        };
    }
  };

  const levelData = getLevelContent();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            {levelData.title}
          </h1>
          <p className="text-xl text-gray-700 mb-6">{levelData.description}</p>

          {/* Progress Bar */}
          {level === 1 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {currentIndex + 1} / {arabicAlphabet.length}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / arabicAlphabet.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Level-specific Content */}
        {level === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <Flashcard
              letter={arabicAlphabet[currentIndex]}
              onNext={handleNext}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-2 flex-wrap justify-center">
                {arabicAlphabet.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-full font-bold transition-all ${
                      idx === currentIndex
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-125'
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
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {level === 3 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {basicVocabulary.map((word, idx) => (
                <div
                  key={word.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-6xl mb-4">{['🏠', '👨', '👩', '👦', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '❤️', '💙', '🖤', '🤍'][idx % 13]}</div>
                  <h3 className="text-4xl font-bold text-purple-600 mb-2">{word.ar}</h3>
                  <p className="text-2xl text-gray-600 mb-4 font-semibold">{word.en}</p>
                  <button className="w-full px-4 py-2 bg-yellow-400 text-gray-800 font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                    🔊 Hear
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {level === 4 && (
          <div className="space-y-6">
            {simpleSentences.map((sentence, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all"
              >
                <p className="text-5xl font-bold text-purple-600 mb-4 text-right">
                  {sentence.ar}
                </p>
                <p className="text-2xl text-gray-600 mb-6 font-semibold">
                  Translation: {sentence.en}
                </p>
                <button className="px-6 py-3 bg-yellow-400 text-gray-800 font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                  🔊 Hear Pronunciation
                </button>
              </div>
            ))}
          </div>
        )}

        {(level === 2 || level === 5) && (
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-12 text-center">
            <p className="text-2xl text-gray-700 mb-6">
              This level is coming soon! Interactive games and exercises will be available shortly.
            </p>
            <p className="text-xl text-gray-600 mb-8">
              {level === 2 && 'You\'ll practice identifying letters through drag-and-drop games and matching exercises.'}
              {level === 5 && 'You\'ll practice writing Arabic letters with guided exercises and feedback.'}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-12 flex justify-center gap-4">
          {level > 1 && (
            <Link
              href={`/modules/${level - 1}`}
              className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Previous Level
            </Link>
          )}
          <Link
            href="/"
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors"
          >
            Back to Home
          </Link>
          {level < 5 && (
            <Link
              href={`/modules/${level + 1}`}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Next Level →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
