'use client';

import { useState } from 'react';
import { Letter } from '@/lib/vocabulary';
import { speakArabic } from '@/lib/speech';

interface FlashcardProps {
  letter: Letter;
  onNext?: () => void;
}

export default function Flashcard({ letter, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAllForms, setShowAllForms] = useState(false);

  const playAudio = () => {
    speakArabic(letter.ar);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-2 sm:p-6">
      <div
        className="relative h-72 w-full max-w-xl cursor-pointer transition-transform duration-300 sm:h-80"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 px-8 shadow-[0_24px_70px_rgba(124,58,237,0.35)] transition-transform duration-300 ${
            isFlipped ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className="text-center">
            <p className="mb-3 text-7xl font-bold text-white sm:text-8xl">{letter.ar}</p>
            <p className="text-lg font-semibold text-white/90">{letter.name}</p>
            <p className="mt-3 text-sm text-white/80">Tap the card to reveal the meaning</p>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 via-cyan-500 to-sky-500 px-8 shadow-[0_24px_70px_rgba(14,165,233,0.3)] transition-transform duration-300 ${
            isFlipped ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="text-center">
            <p className="mb-2 text-4xl font-bold text-white sm:text-5xl">{letter.name}</p>
            <p className="text-lg text-white sm:text-xl">Sound: {letter.english}</p>
            <p className="mt-4 text-sm text-white/85">Tap the card to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
        <button
          onClick={playAudio}
          className="flex-1 rounded-2xl bg-amber-400 px-6 py-4 text-base font-bold text-slate-900 shadow-lg hover:bg-amber-300"
        >
          Hear the sound
        </button>
        <button
          onClick={() => setShowAllForms(!showAllForms)}
          className="flex-1 rounded-2xl bg-violet-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-violet-700"
        >
          {showAllForms ? 'Hide forms' : 'Show all forms'}
        </button>
      </div>

      {showAllForms && (
        <div className="w-full max-w-xl rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-bold text-violet-700">How the letter changes shape</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-sky-50 p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Isolated</p>
              <p className="text-4xl font-bold text-slate-900">{letter.isolated}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Initial</p>
              <p className="text-4xl font-bold text-slate-900">{letter.initial}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Medial</p>
              <p className="text-4xl font-bold text-slate-900">{letter.medial}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Final</p>
              <p className="text-4xl font-bold text-slate-900">{letter.final}</p>
            </div>
          </div>
        </div>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:from-fuchsia-600 hover:to-rose-600"
        >
          Next letter
        </button>
      )}
    </div>
  );
}
