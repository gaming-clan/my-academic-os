import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// Mapuar manualisht nga anglishtja pasi jo çdo shfletues ka të dhëna ICU për 'sq'
const WEEKDAYS_SQ: Record<string, string> = {
  Sun: 'Die', Mon: 'Hën', Tue: 'Mar', Wed: 'Mër', Thu: 'Enj', Fri: 'Pre', Sat: 'Sht',
};
const MONTHS_SQ: Record<string, string> = {
  Jan: 'Janar', Feb: 'Shkurt', Mar: 'Mars', Apr: 'Prill', May: 'Maj', Jun: 'Qershor',
  Jul: 'Korrik', Aug: 'Gusht', Sep: 'Shtator', Oct: 'Tetor', Nov: 'Nëntor', Dec: 'Dhjetor',
};

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Europe/Tirane' });
  };

  const formatDate = (date: Date) => {
    const [weekday, month, day, year] = date
      .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Europe/Tirane' })
      .replace(/,/g, '')
      .split(' ');
    return `${WEEKDAYS_SQ[weekday] || weekday}, ${day} ${MONTHS_SQ[month] || month} ${year}`;
  };

  return (
    <div id="clock-widget" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between h-44">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
          Ora Aktuale (Tiranë)
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
