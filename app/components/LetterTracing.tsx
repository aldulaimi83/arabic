'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Letter } from '@/lib/vocabulary';
import { speakArabic } from '@/lib/speech';

interface LetterTracingProps {
  letters: Letter[];
}

type Point = { x: number; y: number };
type Stroke = Point[];

const LETTER_TIPS: Record<string, string[]> = {
  alif: ['Start at the top.', 'Pull a straight line down.'],
  ba: ['Draw the boat shape first.', 'Add one dot under the line.'],
  ta: ['Draw the boat shape first.', 'Add two dots on top.'],
  tha: ['Draw the boat shape first.', 'Add three dots on top.'],
  jim: ['Make the round curve.', 'Finish with the tail and one dot.'],
  ha: ['Make the open rounded shape.', 'Keep the tail smooth.'],
  kha: ['Make the ha shape first.', 'Add one dot on top.'],
};

function getCanvasPoint(
  event: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

export default function LetterTracing({ letters }: LetterTracingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Stroke>([]);

  const currentLetter = letters[currentIndex];
  const practiceTips = useMemo(
    () =>
      LETTER_TIPS[currentLetter.id] ?? [
        'Trace the large guide letter slowly.',
        'Say the sound while your finger or pencil moves.',
      ],
    [currentLetter.id],
  );

  const redrawCanvas = (allStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#f7f0ff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#d9c7ff';
    context.lineWidth = 2;
    context.setLineDash([8, 10]);
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    context.setLineDash([]);

    context.fillStyle = 'rgba(123, 92, 255, 0.14)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '220px Cairo';
    context.fillText(currentLetter.ar, canvas.width / 2, canvas.height / 2 + 14);

    context.strokeStyle = '#ec4899';
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    allStrokes.forEach((stroke) => {
      if (stroke.length === 0) return;
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, currentLetter]);

  useEffect(() => {
    setStrokes([]);
    setStrokeCount(0);
  }, [currentIndex]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(event.pointerId);
    currentStrokeRef.current = [getCanvasPoint(event, canvas)];
    setIsDrawing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    currentStrokeRef.current = [...currentStrokeRef.current, getCanvasPoint(event, canvas)];
    redrawCanvas([...strokes, currentStrokeRef.current]);
  };

  const finishStroke = () => {
    if (!isDrawing) return;

    const nextStrokes = [...strokes, currentStrokeRef.current];
    setStrokes(nextStrokes);
    setStrokeCount(nextStrokes.length);
    currentStrokeRef.current = [];
    setIsDrawing(false);
  };

  const clearTracing = () => {
    currentStrokeRef.current = [];
    setIsDrawing(false);
    setStrokeCount(0);
    setStrokes([]);
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(126,78,255,0.12)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[1.75rem] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
                Writing Lab
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">{currentLetter.ar}</h2>
              <p className="text-base text-white/90">
                {currentLetter.name} · Sound: {currentLetter.english}
              </p>
            </div>
            <button
              onClick={() => speakArabic(currentLetter.ar)}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-lg hover:bg-violet-50"
            >
              Hear the sound
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-violet-100 bg-violet-50/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-violet-700">
                Trace the guide letter with your finger or mouse
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                Strokes: {strokeCount}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={720}
              height={420}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerLeave={finishStroke}
              onPointerCancel={finishStroke}
              className="letter-tracing-canvas h-[320px] w-full touch-none rounded-[1.25rem] border border-violet-200 bg-[#f7f0ff]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={clearTracing}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700"
            >
              Clear board
            </button>
            <button
              onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              disabled={currentIndex === 0}
              className="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous letter
            </button>
            <button
              onClick={() =>
                setCurrentIndex((index) => Math.min(index + 1, letters.length - 1))
              }
              disabled={currentIndex === letters.length - 1}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next letter
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">
              How to teach it
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {practiceTips.map((tip) => (
                <li key={tip} className="rounded-2xl bg-white/10 px-4 py-3">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Practice goal
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Ask the child to trace the same letter three times, say the sound out loud,
              then point to the letter on the alphabet level before moving on.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {letters.slice(0, 12).map((letter, index) => (
              <button
                key={letter.id}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-2xl px-3 py-4 text-2xl font-bold shadow-sm transition ${
                  index === currentIndex
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-violet-50'
                }`}
              >
                {letter.ar}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
