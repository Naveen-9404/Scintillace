import { useEffect, useMemo, useState } from 'react';

function Countdown({ targetDate }) {
  const [remaining, setRemaining] = useState(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const difference = new Date(targetDate).getTime() - Date.now();
    return {
      days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((difference / (1000 * 60)) % 60)),
      seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
    };
  });

  useEffect(() => {
    if (!targetDate) return undefined;
    const interval = window.setInterval(() => {
      const difference = new Date(targetDate).getTime() - Date.now();
      setRemaining({
        days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
        minutes: Math.max(0, Math.floor((difference / (1000 * 60)) % 60)),
        seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  const values = useMemo(() => [
    ['Days', remaining.days],
    ['Hours', remaining.hours],
    ['Minutes', remaining.minutes],
    ['Seconds', remaining.seconds],
  ], [remaining]);

  return (
    <div className="flex flex-wrap gap-3">
      {values.map(([label, value]) => (
        <div key={label} className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-center shadow-[0_10px_30px_rgba(6,8,22,0.18)]">
          <div className="text-xl font-semibold text-[color:var(--color-text-primary)]">{value}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
