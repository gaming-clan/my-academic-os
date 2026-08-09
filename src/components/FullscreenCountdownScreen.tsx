import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  GraduationCap,
  School,
  Calendar,
  Sparkles,
  ArrowRight,
  Maximize2,
  Lock,
  Unlock,
  CheckCircle2,
  Settings,
  Bell,
  BookOpen,
} from 'lucide-react';
import { Profile } from '../types';

interface FullscreenCountdownScreenProps {
  isOpen: boolean;
  onClose: () => void;
  isUniversityMode: boolean;
  onAcademicLevelChange?: (level: Profile['academicLevel']) => void;
}

export default function FullscreenCountdownScreen({
  isOpen,
  onClose,
  isUniversityMode,
  onAcademicLevelChange,
}: FullscreenCountdownScreenProps) {
  // Target dates:
  // Viti Shkollor: 14 Shtator 2026 (Month index 8)
  // Viti Akademik: 5 Tetor 2026 (Month index 9)
  const [targetDateStr, setTargetDateStr] = useState<string>(
    isUniversityMode ? '2026-10-05' : '2026-09-14'
  );

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
    progressPercentage: 0,
  });

  useEffect(() => {
    setTargetDateStr(isUniversityMode ? '2026-10-05' : '2026-09-14');
  }, [isUniversityMode]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const [year, month, day] = targetDateStr.split('-').map(Number);
      const targetTime = new Date(year, month - 1, day, 0, 0, 0).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (isNaN(difference) || difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPassed: true,
          progressPercentage: 100,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Total duration reference (from June 1st of current year to target)
      const startTime = new Date(year, 5, 1).getTime();
      const totalSpan = Math.max(1, targetTime - startTime);
      const elapsedSpan = Math.max(0, now - startTime);
      const progress = Math.min(100, Math.max(0, (elapsedSpan / totalSpan) * 100));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPassed: false,
        progressPercentage: Number(progress.toFixed(1)),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (!isOpen) return null;

  const targetTitle = isUniversityMode ? 'Fillimi i Vitit Akademik' : 'Fillimi i Vitit Shkollor';
  const targetDateFormatted = isUniversityMode ? '5 Tetor 2026' : '14 Shtator 2026';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col justify-between p-6 md:p-12 overflow-y-auto font-sans select-none"
      >
        {/* Background ambient lighting effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top bar controls */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-emerald-400">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Sistemi Im Akademik <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-zinc-400 font-mono">Ekran me Madhësi të Plotë i Numërimit Mbrapsht</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => onAcademicLevelChange && onAcademicLevelChange('Universitet')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isUniversityMode
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Viti Akademik
            </button>
            <button
              onClick={() => onAcademicLevelChange && onAcademicLevelChange('Shkollë e Mesme')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                !isUniversityMode
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <School className="w-4 h-4" /> Viti Shkollor
            </button>
          </div>
        </div>

        {/* Center Main Countdown Display */}
        <div className="relative z-10 my-auto py-12 max-w-5xl mx-auto w-full text-center space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              <span>{targetTitle} • {targetDateFormatted}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {timeLeft.isPassed ? (
                <span className="text-emerald-400 flex items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 animate-spin" /> Viti Ka Filluar!
                </span>
              ) : (
                `Sa Ditë Kanë Mbetur?`
              )}
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto font-medium">
              {timeLeft.isPassed
                ? `Suksese në vitin e ri ${isUniversityMode ? 'akademik' : 'shkollor'}! Programi është plotësisht i gatshëm për përdorim.`
                : `Numërimi mbrapsht deri në nisjen e vitit të ri ${isUniversityMode ? 'akademik' : 'shkollor'}. Përgatituni me organizimin e lëndëve.`}
            </p>
          </div>

          {/* Large Countdown Cards */}
          {timeLeft.isPassed ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl max-w-xl mx-auto space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 animate-bounce" />
              <h3 className="text-2xl font-bold text-white">Viti ka Nisur me Sukses!</h3>
              <p className="text-xs text-zinc-300">Të gjitha modulët e lëndëve, detyrave dhe shënimeve janë të zhbllokuara.</p>
              <button
                onClick={onClose}
                className="mt-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl shadow-xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                Hyr në Aplikacion <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* Days */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl hover:border-emerald-500/50 transition-all">
                <span className="text-5xl md:text-7xl font-black font-mono tracking-tight text-emerald-400">
                  {timeLeft.days}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-2">Ditë</span>
              </div>

              {/* Hours */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl hover:border-emerald-500/50 transition-all">
                <span className="text-5xl md:text-7xl font-black font-mono tracking-tight text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-2">Orë</span>
              </div>

              {/* Minutes */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl hover:border-emerald-500/50 transition-all">
                <span className="text-5xl md:text-7xl font-black font-mono tracking-tight text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-2">Minuta</span>
              </div>

              {/* Seconds */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl hover:border-amber-400/50 transition-all">
                <span className="text-5xl md:text-7xl font-black font-mono tracking-tight text-amber-400 animate-pulse">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-2">Sekonda</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {!timeLeft.isPassed && (
            <div className="max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Progresi i Kohës</span>
                <span>{timeLeft.progressPercentage}% të kaluara</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${timeLeft.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Enter Application Override Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Unlock className="w-5 h-5" /> Hyr në Aplikacion (Hap Sistemin Akademik)
            </button>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" /> Sistemi Akademik OS • Modaliteti me Ekran të Plotë
          </span>
          <span>Shtyp 'Hyr' për të hyrë menjëherë</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
