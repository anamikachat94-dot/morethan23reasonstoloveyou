import { useEffect, useRef } from "react";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Always start from the very beginning of the song
    audio.currentTime = 0;

    // Attempt autoplay immediately
    const tryPlay = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browser blocked autoplay — wait for first user interaction then play from start
        const enablePlay = () => {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          window.removeEventListener("click", enablePlay);
          window.removeEventListener("touchstart", enablePlay);
          window.removeEventListener("scroll", enablePlay);
          window.removeEventListener("keydown", enablePlay);
        };

        window.addEventListener("click", enablePlay, { once: true });
        window.addEventListener("touchstart", enablePlay, { once: true });
        window.addEventListener("scroll", enablePlay, { once: true });
        window.addEventListener("keydown", enablePlay, { once: true });
      });
    };

    tryPlay();
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/glue-song.mp3"
      loop
      preload="auto"
      className="hidden"
      aria-hidden="true"
    />
  );
}
