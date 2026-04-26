'use client';

import { useState } from 'react';
import { Letter } from '@/lib/vocabulary';

interface FlashcardProps {
  letter: Letter;
  onNext?: () => void;
}

export default function Flashcard({ letter, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAllForms, setShowAllForms] = useState(false);

  const playAudio = () => {
    // Placeholder for audio - will work when audio files are added
    console.log('Playing audio for:', letter.name);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Main Flashcard */}
      <div
        className="relative w-full max-w-sm h-64 cursor-pointer perspective transition-transform duration-300"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center transform transition-transform duration-300 ${
            isFlipped ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className="text-center">
            <p className="text-6xl font-bold text-white mb-4">{letter.ar}</p>
            <p className="text-white text-sm">Click to reveal</p>
          </div>
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl shadow-xl flex items-center justify-center transform transition-transform duration-300 ${
            isFlipped ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-2">{letter.name}</p>
            <p className="text-white text-lg">English: {letter.english}</p>
            <p className="text-white text-xs mt-2">Click to flip back</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={playAudio}
          className="px-6 py-3 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-md text-lg"
        >
          🔊 Hear
        </button>
        <button
          onClick={() => setShowAllForms(!showAllForms)}
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition-colors shadow-md"
        >
          📝 Forms
        </button>
      </div>

      {/* Letter Forms */}
      {showAllForms && (
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 border-2 border-purple-300">
          <h3 className="text-xl font-bold text-purple-600 mb-4">Letter Forms:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Isolated</p>
              <p className="text-4xl font-bold">{letter.isolated}</p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Initial</p>
              <p className="text-4xl font-bold">{letter.initial}</p>
            </div>
            <div className="text-center p-3 bg-yellow-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Medial</p>
              <p className="text-4xl font-bold">{letter.medial}</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Final</p>
              <p className="text-4xl font-bold">{letter.final}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Button */}
      {onNext && (
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white font-bold rounded-lg hover:from-pink-500 hover:to-red-500 transition-all shadow-lg text-lg"
        >
          Next Letter →
        </button>
      )}
    </div>
  );
}
