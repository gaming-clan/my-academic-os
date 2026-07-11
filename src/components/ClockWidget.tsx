import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div id="clock-widget" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between h-44">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Current Time
        </span>
        <Clock className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="my-auto">
        <h2 className="text-4xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 font-mono">
          {formatTime(time)}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
          {formatDate(time)}
        </p>
      </div>
    </div>
  );
}
