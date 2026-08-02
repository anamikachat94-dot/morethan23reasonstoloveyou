import { useState } from "react";

const MESSAGES = [
  "23 looks so good on you.",
  "Every version of you is my favourite.",
  "Thank you for being my safest place.",
  "I'd pick you again. Always.",
  "You are my best hello and hardest goodbye.",
];

export function ConfettiButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const burst = async () => {
    setMessage(MESSAGES[index % MESSAGES.length]);
    setIndex((i) => i + 1);
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#e8c07a", "#f5e0a8", "#c9a84c", "#fdf6e3"];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors });
    setTimeout(
      () =>
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 },
          colors,
        }),
      180,
    );
    setTimeout(
      () =>
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 },
          colors,
        }),
      280,
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={burst}
        className="rounded-full border border-primary/60 px-8 py-3 text-xs uppercase tracking-[0.35em] text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-glow"
      >
        Press me
      </button>
      {message && (
        <p key={message} className="animate-rise font-script text-3xl text-gold sm:text-4xl">
          {message}
        </p>
      )}
    </div>
  );
}
