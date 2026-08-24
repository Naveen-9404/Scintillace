import { useEffect, useMemo, useState } from "react";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function getRemainingTime(targetDate) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();

  const difference = Math.max(target - now, 0);

  return {
    total: difference,
    days: Math.floor(difference / DAY),
    hours: Math.floor((difference % DAY) / HOUR),
    minutes: Math.floor((difference % HOUR) / MINUTE),
    seconds: Math.floor((difference % MINUTE) / SECOND),
  };
}

export default function useCountdown(targetDate) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() =>
    getRemainingTime(target)
  );

  useEffect(() => {
    if (timeLeft.total <= 0) return;

    const interval = setInterval(() => {
      const remaining = getRemainingTime(target);

      setTimeLeft(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, timeLeft.total]);

  return {
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
    seconds: timeLeft.seconds,
    completed: timeLeft.total <= 0,
  };
}