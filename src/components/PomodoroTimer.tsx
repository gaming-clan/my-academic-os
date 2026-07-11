import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Play, Pause, RotateCcw, Flame, Coffee, Trophy, Minus, Plus, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';

type TimerMode = 'study' | 'short' | 'long';

const MIN_DURATION = 5 * 60;
const MAX_DURATION = 2 * 60 * 60;
const STEP = 5 * 60;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('study');
  const [durations, setDurations] = useState<Record<TimerMode, number>>({
    study: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  });
  const [timeLeft, setTimeLeft] = useState(durations.study);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  const modeLabels: Record<TimerMode, string> = {
    study: 'Koha e Studimit',
    short: 'Pushim i Shkurtër',
    long: 'Pushim i Gjatë',
  };

  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const adjustDuration = (delta: number) => {
    if (isRunning) return;
    const newDuration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, durations[mode] + delta));
    setDurations((prev) => ({ ...prev, [mode]: newDuration }));
    setTimeLeft(newDuration);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Play a notification sound
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
              console.log('Audio notification bypassed due to browser policy');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Keep focus mode in sync if the user exits fullscreen via Esc or the browser UI
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleEnterFocusMode = () => {
    // Commit the overlay to the DOM synchronously so focusRef is attached before requesting fullscreen
    flushSync(() => setIsFocusMode(true));
    focusRef.current?.requestFullscreen?.().catch(() => {});
  };

  const handleExitFocusMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFocusMode(false);
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  const modeAccent = mode === 'study' ? 'bg-amber-500' : mode === 'short' ? 'bg-blue-400' : 'bg-indigo-400';

  const renderModeTabs = () => (
    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-[10px] font-medium">
      {(['study', 'short', 'long'] as TimerMode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`px-2 py-1 rounded-md transition-all ${
            mode === m
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          {m === 'study' ? 'Fokus' : m === 'short' ? 'Shkurtër' : 'Gjatë'}
        </button>
      ))}
    </div>
  );

  const renderTimeDisplay = (large: boolean) => (
    <div className="flex flex-col items-center justify-center my-auto">
      <div className={`flex items-center ${large ? 'gap-6' : 'gap-3'}`}>
        <button
          onClick={() => adjustDuration(-STEP)}
          disabled={isRunning || durations[mode] <= MIN_DURATION}
          title="Zvogëlo kohën (min. 5 min)"
          className={`rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 ${
            large ? 'p-3' : 'p-1'
          }`}
        >
          <Minus className={large ? 'w-8 h-8' : 'w-4 h-4'} />
        </button>
        <h3
          className={`font-bold tracking-tight text-zinc-800 dark:text-zinc-100 font-mono tabular-nums ${
            large ? 'text-[9rem] leading-none' : 'text-4xl'
          }`}
        >
          {formatTime(timeLeft)}
        </h3>
        <button
          onClick={() => adjustDuration(STEP)}
          disabled={isRunning || durations[mode] >= MAX_DURATION}
          title="Rrit kohën (maks. 2 orë)"
          className={`rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 ${
            large ? 'p-3' : 'p-1'
          }`}
        >
          <Plus className={large ? 'w-8 h-8' : 'w-4 h-4'} />
        </button>
      </div>
      <p className={`text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 ${large ? 'text-base mt-4' : 'text-xs'}`}>
        {modeLabels[mode]}
      </p>
    </div>
  );

  const renderProgressBar = (large: boolean) => (
    <div className={`w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden ${large ? 'h-2.5 max-w-md' : 'h-1.5 mb-3'}`}>
      <motion.div
        className={`h-full rounded-full ${modeAccent}`}
        initial={{ width: '0%' }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );

  const renderControls = (large: boolean) => (
    <div className={`flex items-center justify-center ${large ? 'gap-5' : 'gap-3'}`}>
      <button
        onClick={handleStartStop}
        className={`flex items-center gap-1.5 rounded-xl font-medium shadow-sm transition-all text-white ${
          isRunning
            ? 'bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        } ${large ? 'px-8 py-3 text-base' : 'px-5 py-1.5 text-xs'}`}
      >
        {isRunning ? (
          <>
            <Pause className={`${large ? 'w-5 h-5' : 'w-3.5 h-3.5'} fill-current`} /> Pauzë
          </>
        ) : (
          <>
            <Play className={`${large ? 'w-5 h-5' : 'w-3.5 h-3.5'} fill-current`} /> Fillo
          </>
        )}
      </button>
      <button
        onClick={handleReset}
        className={`rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ${
          large ? 'p-3' : 'p-1.5'
        }`}
        title="Rifillo"
      >
        <RotateCcw className={large ? 'w-6 h-6' : 'w-4 h-4'} />
      </button>
    </div>
  );

  return (
    <div id="pomodoro-timer" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between h-52">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
          {mode === 'study' && <Flame className="w-3.5 h-3.5 text-amber-500" />}
          {mode === 'short' && <Coffee className="w-3.5 h-3.5 text-blue-400" />}
          {mode === 'long' && <Trophy className="w-3.5 h-3.5 text-indigo-400" />}
          Kohëmatësi i Fokusit
        </span>
        <div className="flex items-center gap-1.5">
          {renderModeTabs()}
          <button
            onClick={handleEnterFocusMode}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            title="Modaliteti i Fokusit (Ekran i Plotë)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {renderTimeDisplay(false)}
      {renderProgressBar(false)}
      {renderControls(false)}

      {/* Fullscreen Focus Mode Overlay */}
      {isFocusMode && (
        <div
          ref={focusRef}
          className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-8 p-8"
        >
          <button
            onClick={handleExitFocusMode}
            className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            title="Dil nga Modaliteti i Fokusit"
          >
            <Minimize2 className="w-6 h-6" />
          </button>

          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-2">
            {mode === 'study' && <Flame className="w-4 h-4 text-amber-500" />}
            {mode === 'short' && <Coffee className="w-4 h-4 text-blue-400" />}
            {mode === 'long' && <Trophy className="w-4 h-4 text-indigo-400" />}
            Kohëmatësi i Fokusit
          </span>

          {renderModeTabs()}
          {renderTimeDisplay(true)}
          {renderProgressBar(true)}
          {renderControls(true)}
        </div>
      )}
    </div>
  );
}
