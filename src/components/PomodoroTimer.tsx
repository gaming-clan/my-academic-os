import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

type TimerMode = 'study' | 'short' | 'long';

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const durationMap: Record<TimerMode, number> = {
    study: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  const modeLabels: Record<TimerMode, string> = {
    study: 'Study Time',
    short: 'Short Break',
    long: 'Long Break',
  };

  useEffect(() => {
    setTimeLeft(durationMap[mode]);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [mode]);

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

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMap[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((durationMap[mode] - timeLeft) / durationMap[mode]) * 100;

  return (
    <div id="pomodoro-timer" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between h-52">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
          {mode === 'study' && <Flame className="w-3.5 h-3.5 text-amber-500" />}
          {mode === 'short' && <Coffee className="w-3.5 h-3.5 text-blue-400" />}
          {mode === 'long' && <Trophy className="w-3.5 h-3.5 text-indigo-400" />}
          Focus Timer
        </span>
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
              {m === 'study' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        <h3 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 font-mono">
          {formatTime(timeLeft)}
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
          {modeLabels[mode]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${
            mode === 'study' ? 'bg-amber-500' : mode === 'short' ? 'bg-blue-400' : 'bg-indigo-400'
          }`}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleStartStop}
          className={`flex items-center gap-1.5 px-5 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all text-white ${
            isRunning
              ? 'bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Start
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
