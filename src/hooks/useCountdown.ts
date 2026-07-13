import { useEffect, useMemo, useState } from "react";

export type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasEnded: boolean;
  remainingMilliseconds: number;
};

function calculateCountdown(targetTimestamp: number): CountdownValue {
  const remainingMilliseconds = Math.max(0, targetTimestamp - Date.now());
  const totalSeconds = Math.floor(remainingMilliseconds / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    hasEnded: remainingMilliseconds <= 0,
    remainingMilliseconds,
  };
}

/**
 * Client-side display timer. The ISO target includes its IST offset, so every
 * browser counts down to the same instant while calculations use local time.
 */
export function useCountdown(targetIso: string) {
  const targetTimestamp = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetTimestamp));

  useEffect(() => {
    const tick = () => setCountdown(calculateCountdown(targetTimestamp));
    tick();

    if (targetTimestamp <= Date.now()) return;
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [targetTimestamp]);

  return countdown;
}
