import { useEffect, useState } from "react";

const BIRTH_MONTH = 8; // September (0-indexed)
const BIRTH_DAY = 18;

function nextBirthday(now: Date) {
  const year = now.getFullYear();
  const thisYear = new Date(year, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  return thisYear.getTime() > now.getTime()
    ? thisYear
    : new Date(year + 1, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
}

function isBirthdayToday(now: Date) {
  return now.getMonth() === BIRTH_MONTH && now.getDate() === BIRTH_DAY;
}

type Parts = { days: number; hours: number; minutes: number; seconds: number };

export function Countdown() {
  const [parts, setParts] = useState<Parts | null>(null);
  const [today, setToday] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setToday(isBirthdayToday(now));
      const diff = Math.max(0, nextBirthday(now).getTime() - now.getTime());
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (today) {
    return (
      <p className="font-script text-4xl text-gold sm:text-5xl">It's your day, babygirl</p>
    );
  }

  const items: Array<[string, number | null]> = [
    ["days", parts?.days ?? null],
    ["hours", parts?.hours ?? null],
    ["minutes", parts?.minutes ?? null],
    ["seconds", parts?.seconds ?? null],
  ];

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-6">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-16 text-center sm:min-w-24">
          <div className="rounded-sm border border-border bg-card/60 px-2 py-4 shadow-soft backdrop-blur-sm sm:px-4 sm:py-6">
            <span className="font-display text-3xl tabular-nums text-gold sm:text-5xl">
              {value === null ? "--" : String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 block text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
