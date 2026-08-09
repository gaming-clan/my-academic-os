import { useState, useEffect } from 'react';
import { Calendar, Timer, Sparkles, GraduationCap, School, Maximize2 } from 'lucide-react';

interface CountdownWidgetProps {
  isUniversityMode?: boolean;
  onOpenFullscreen?: () => void;
}

export default function CountdownWidget({
  isUniversityMode = true,
  onOpenFullscreen,
}: CountdownWidgetProps) {
  // Target dates:
  // Fillimi i vitit shkollor: 14 Shtator 2026
  // Fillimi i vitit akademik: 5 Tetor 2026
  const targetTitle = isUniversityMode ? 'Fillimi i Vitit Akademik' : 'Fillimi i Vitit Shkollor';
  const targetFormatted = isUniversityMode ? '5 Tetor 2026' : '14 Shtator 2026';

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // 2026-10-05 for university (month 9), 2026-09-14 for high school (month 8)
      const target = isUniversityMode ? new Date(2026, 9, 5, 0, 0, 0).getTime() : new Date(2026, 8, 14, 0, 0, 0).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (isNaN(difference) || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isUniversityMode]);

  const modeText = isUniversityMode
    ? `Janë edhe ${timeLeft.days} ditë nga fillimi i vitit akademik`
    : `Janë edhe ${timeLeft.days} ditë nga fillimi i vitit shkollor`;

  return (
    <div
      id="countdown-widget"
      className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between h-44 transition-all relative group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
          {isUniversityMode ? <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> : <School className="w-3.5 h-3.5 text-amber-500" />}
          {targetTitle}
        </span>
        <div className="flex items-center gap-1.5">
          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              className="p-1 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer"
              title="Zgjero në Ekran të Plotë (Fullscreen Timer)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Timer className="w-4 h-4 text-emerald-500" />
        </div>
      </div>

      <div className="my-auto">
        {timeLeft.isPassed ? (
          <div>
            <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Viti ka Filluar!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Suksese në vitin e ri {isUniversityMode ? 'akademik' : 'shkollor'}!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 font-mono">
                {timeLeft.days} <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-sans">ditë</span>
              </h2>
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                ({timeLeft.hours.toString().padStart(2, '0')}h {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s)
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mt-1.5 leading-snug">
              {modeText}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Data: {targetFormatted}
        </span>
        <button
          onClick={onOpenFullscreen}
          className="capitalize hover:text-emerald-500 font-semibold cursor-pointer underline flex items-center gap-1"
        >
          {isUniversityMode ? 'Universitet' : 'Gjimnaz'} (Ekran i Plotë)
        </button>
      </div>
    </div>
  );
}
