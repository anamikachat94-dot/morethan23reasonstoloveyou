import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// 18 September 2026 00:00:00 IST = UTC+5:30 → UTC 18:30:00 on 17 Sep 2026
const UNLOCK_TIME = new Date("2026-09-17T18:30:00.000Z").getTime();

function isUnlocked() {
  return Date.now() >= UNLOCK_TIME;
}

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getparts(now: number): Parts {
  const diff = Math.max(0, UNLOCK_TIME - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export const Route = createFileRoute("/splash")({
  beforeLoad: () => {
    // If already past unlock time, skip the splash and go straight to the site
    if (isUnlocked()) {
      throw redirect({ to: "/" });
    }
  },
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Parts>(() => getparts(Date.now()));
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  const [fadeOut, setFadeOut] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Tick every second
  useEffect(() => {
    if (unlocked) return;
    const id = setInterval(() => {
      const now = Date.now();
      setParts(getparts(now));
      if (isUnlocked()) {
        setUnlocked(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [unlocked]);

  // Once unlocked, fade the countdown out
  useEffect(() => {
    if (unlocked) {
      const t = setTimeout(() => setFadeOut(true), 300);
      return () => clearTimeout(t);
    }
  }, [unlocked]);

  const handleClick = () => {
    if (!unlocked) return;
    void navigate({ to: "/" });
  };

  const handleSecondsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPasswordPrompt(true);
    setPassword("");
    setPasswordError(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "anas100") {
      sessionStorage.setItem("dev_bypass", "1");
      void navigate({ to: "/" });
    } else {
      setPasswordError(true);
      setPassword("");
    }
  };

  const items: [string, number][] = [
    ["days",    parts.days],
    ["hours",   parts.hours],
    ["minutes", parts.minutes],
    ["seconds", parts.seconds],
  ];

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      onClick={handleClick}
      style={{ cursor: unlocked ? "pointer" : "default" }}
    >
      {/* Background — laptop.png on md+, mobile.jpeg on smaller screens */}
      <img
        src="/laptop.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      />
      <img
        src="/mobile.jpeg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full object-cover md:hidden"
      />

      {/* Dark scrim so countdown is legible */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Countdown / unlocked message */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 text-center transition-opacity duration-700"
        style={{ opacity: fadeOut ? 0 : 1 }}
      >
        {unlocked ? (
          <>
            <p className="font-script text-5xl text-gold sm:text-7xl animate-rise">
              It's your day 💕
            </p>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 animate-rise">
              tap anywhere to enter
            </p>
          </>
        ) : (
          <>
            <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/60">
              counting down to
            </p>
            <p className="font-script text-4xl text-gold sm:text-5xl">18 · September</p>

            {/* Countdown boxes */}
            <div className="flex items-start justify-center gap-3 sm:gap-6">
              {items.map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-16 text-center sm:min-w-24"
                  onClick={label === "seconds" ? handleSecondsClick : undefined}
                  style={{ cursor: label === "seconds" ? "pointer" : "default" }}
                >
                  <div className="rounded-sm border border-white/20 bg-black/40 px-2 py-4 shadow-lg backdrop-blur-sm sm:px-4 sm:py-6">
                    <span className="font-display text-3xl tabular-nums text-gold sm:text-5xl">
                      {String(value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="mt-2 block text-[0.6rem] uppercase tracking-[0.3em] text-white/60">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Password prompt modal */}
      {showPasswordPrompt && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={() => setShowPasswordPrompt(false)}
        >
          <form
            onSubmit={handlePasswordSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-4 rounded-lg border border-white/20 bg-black/70 px-8 py-8 shadow-2xl"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60">enter password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
              autoFocus
              className="w-48 rounded border border-white/20 bg-white/10 px-3 py-2 text-center text-sm text-white outline-none focus:border-white/50"
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-[0.6rem] uppercase tracking-widest text-red-400">incorrect</p>
            )}
            <button
              type="submit"
              className="rounded border border-white/30 px-6 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-white/80 hover:border-white/60 hover:text-white"
            >
              enter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
