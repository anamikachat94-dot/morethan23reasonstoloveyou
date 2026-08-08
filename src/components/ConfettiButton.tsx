import { useState } from "react";
import { createPortal } from "react-dom";

const MESSAGES = [
  "23 looks so good on you.",
  "Every version of you is my favourite.",
  "Thank you for being my safest place.",
  "I'd pick you again. Always.",
  "You are my best hello and hardest goodbye.",
];

function Certificate({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close certificate"
          className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-[#6d1220] shadow-md hover:bg-gray-100"
        >
          ✕
        </button>
        <img
          src="/certificate.png"
          alt="Certificate: Best Boyfriend In The World, presented to Anas"
          className="max-h-[90vh] w-auto max-w-[90vw] rounded shadow-2xl"
        />
      </div>
    </div>,
    document.body
  );
}

export function ConfettiButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const burst = async () => {
    // Show certificate only on the very first press
    if (index === 0) {
      setShowCertificate(true);
    }

    setMessage(MESSAGES[index % MESSAGES.length] ?? MESSAGES[0]!);
    setIndex((i) => i + 1);
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#f5efe2", "#e8c9a0", "#a02a35", "#6d1220"];
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
    <>
      {showCertificate && <Certificate onClose={() => setShowCertificate(false)} />}
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
    </>
  );
}
