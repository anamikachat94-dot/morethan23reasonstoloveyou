import { createFileRoute } from "@tanstack/react-router";

import { Starfield } from "@/components/Starfield";
import { Countdown } from "@/components/Countdown";
import { ConfettiButton } from "@/components/ConfettiButton";
import starrySky from "@/assets/starry-sky.jpg";
import photo1 from "@/assets/photo-1.jpg";
import photo2 from "@/assets/photo-2.jpg";
import photo3 from "@/assets/photo-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy 23rd Birthday, Anas" },
      {
        name: "description",
        content:
          "A birthday letter, a countdown and all our little memories — made with love for Anas, turning 23 on 18 September.",
      },
      { property: "og:title", content: "Happy 23rd Birthday, Anas" },
      {
        property: "og:description",
        content: "A birthday letter, a countdown and all our little memories.",
      },
    ],
  }),
  component: Index,
});

const gallery = [
  { src: photo1, alt: "Us together under a sky full of stars" },
  { src: photo2, alt: "Our hands held together in the fairy lights" },
  { src: photo3, alt: "A birthday cake glowing with candles" },
];

const timeline = [
  {
    title: "The first hello",
    text: "I had no idea a single conversation could quietly rearrange my whole life.",
  },
  {
    title: "The first time you made me laugh like that",
    text: "The kind of laugh that hurts your stomach. I knew then I wasn't going anywhere.",
  },
  {
    title: "Every ordinary day since",
    text: "Long calls, silly voice notes, and being called babygirl. My favourite ordinary.",
  },
  {
    title: "Today — 23",
    text: "A whole new year for you, and I get a front row seat. Lucky me.",
  },
];

const reasons = [
  "The way you say my name",
  "Your stupidly perfect laugh",
  "How safe you make me feel",
  "Your patience with me",
  "The way you listen",
  "That you're mine",
];

function Index() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <img
          src={starrySky}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-background/50" />
        <Starfield />

        <div className="relative z-10 max-w-2xl">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
            18 · September
          </p>
          <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-7xl">
            Happy Birthday,
            <span className="mt-2 block font-script text-6xl text-gold sm:text-8xl">Anas</span>
          </h1>
          <p className="mx-auto mt-8 max-w-md text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
            Twenty-three years of you existing, and I'm the one who got lucky. I built this
            little corner of the internet so you'd know exactly how loved you are.
          </p>
          <p className="mt-6 font-script text-2xl text-gold">— your girl</p>
        </div>

        <div className="relative z-10 mt-16 w-full max-w-xl">
          <p className="mb-6 text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
            until your day
          </p>
          <Countdown />
        </div>
      </section>

      {/* Letter */}
      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl sm:text-5xl">A little letter</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/50" />
          <div className="mt-10 space-y-6 text-sm font-light leading-loose text-muted-foreground sm:text-base">
            <p>
              Babygirl, if I tried to write down everything you are to me, I'd never finish. You
              are the calm in my noisy days and the reason my phone screen makes me smile before
              I even read the message.
            </p>
            <p>
              Thank you for the patience, the softness, the way you show up for me without ever
              being asked. Thank you for being the person I want to tell everything to first.
            </p>
            <p>
              Here's to 23 — to everything you're going to build this year, and to me cheering
              the loudest the whole way through.
            </p>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="relative overflow-hidden bg-card/40 px-6 py-28">
        <Starfield count={40} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="text-center font-display text-4xl sm:text-5xl">
            A few of my favourite things about you
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/50" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {reasons.map((reason, i) => (
              <li
                key={reason}
                className="flex items-center gap-4 rounded-sm border border-border bg-background/40 px-5 py-4 backdrop-blur-sm"
              >
                <span className="font-display text-lg text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-light">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-4xl sm:text-5xl">Us, in pictures</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/50" />
          <p className="mx-auto mt-6 max-w-md text-center text-xs font-light text-muted-foreground">
            Swap these for our own photos and videos whenever you like.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {gallery.map((photo, i) => (
              <figure
                key={photo.alt}
                className="group overflow-hidden rounded-sm border border-border shadow-soft"
                style={i === 1 ? { marginTop: "2rem" } : undefined}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-card/40 px-6 py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-4xl sm:text-5xl">Our little timeline</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/50" />
          <ol className="relative mt-14 border-l border-border pl-8">
            {timeline.map((item) => (
              <li key={item.title} className="relative pb-12 last:pb-0">
                <span className="absolute -left-[2.15rem] top-1.5 h-2 w-2 rounded-full bg-primary shadow-glow" />
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Surprise */}
      <section className="relative overflow-hidden px-6 py-32 text-center">
        <Starfield count={50} />
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="font-display text-4xl sm:text-5xl">One last surprise</h2>
          <p className="mx-auto mt-6 max-w-sm text-sm font-light text-muted-foreground">
            Go on. Press the button as many times as you want.
          </p>
          <div className="mt-12">
            <ConfettiButton />
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12 text-center">
        <p className="font-script text-2xl text-gold">Happy 23rd, babygirl</p>
        <p className="mt-3 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
          made with love · 18 September
        </p>
      </footer>
    </main>
  );
}
