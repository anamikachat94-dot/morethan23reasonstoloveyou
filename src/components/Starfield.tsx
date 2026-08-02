import { useMemo } from "react";

type Star = { top: string; left: string; size: number; delay: string; duration: string };

/** Decorative twinkling stars layer. */
export function Starfield({ count = 70 }: { count?: number }) {
  const stars = useMemo<Star[]>(() => {
    // Deterministic pseudo-random so SSR and client agree.
    const out: Star[] = [];
    for (let i = 0; i < count; i++) {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      const c = Math.sin(i * 39.4271) * 9876.54321;
      const r1 = a - Math.floor(a);
      const r2 = b - Math.floor(b);
      const r3 = c - Math.floor(c);
      out.push({
        top: `${(r1 * 100).toFixed(2)}%`,
        left: `${(r2 * 100).toFixed(2)}%`,
        size: r3 > 0.85 ? 3 : r3 > 0.5 ? 2 : 1,
        delay: `${(r3 * 4).toFixed(2)}s`,
        duration: `${(3 + r1 * 4).toFixed(2)}s`,
      });
    }
    return out;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary animate-twinkle"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
