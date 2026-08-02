import { createFileRoute } from "@tanstack/react-router";

import { Starfield } from "@/components/Starfield";
import { Countdown } from "@/components/Countdown";
import { ConfettiButton } from "@/components/ConfettiButton";
import { MemoryGallery } from "@/components/MemoryGallery";
import starrySky from "@/assets/starry-sky.jpg";

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


const timeline = [
  {
    title: "24th Jan 2025",
    text: "We met for the first time, I wont lie I was crazy shy and I wanted to hide my face because I felt like i was blushing so much by just looking at you. You were and are so attractive.",
  },
  {
    title: "2nd Feb 2025",
    text: "We went on our first date. It was the first time I felt I'm coming out of my comfort zone a little but i was still shy. Going arcade with you will always be my peak and favourite date. I had so much fun with you even though I was very conscious with what you were thinking but I was genuinely happy. Thankyou for making me feel safe.",
  },
  {
    title: "4th Feb",
    text: "We went to my college to get the medal. The moment we had then is still stuck in my head and I'm glad we didn't had our first official kiss their because I got the chance to fell for you by just staring in your eyes deeply. I love youuu",
  },
  {
    title: "9th Feb",
    text: "We had our first kiss and I dont think so I ever felt what I felt that day and I still can't forget the way your heart was beating so fast which was able to confirm that you actually had feelings for me, it was so adorable. I love you",
  },
  {
    title: "8th July",
    text: "We officially slept together and it is my favourite memory. I wont add anything more to it because I loved it.",
  },
];


const reasons = [
  "Your eyes",
  "Wavy hair",
  "The way you are patient with me",
  "The way you try to cheer me up",
  "That dick of yours which basically belongs to me\u{1F609}",
  "You belong to me",
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
          <p className="mx-auto mt-8 max-w-xl text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
            Happy birthday my love, you might be 23 now but I have more than 23 reasons to love
            you because each passing day my love just increases more and more for you. I'm so
            proud of you and I love you for the man you are right now and in future.
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
              My baby, no amount of letter can ever convey how I feel for you. I love you so much
              and I cant wait to kiss you today💕. We have been so into each other and idts I can
              ever get tired of you.
            </p>
            <p>
              Thankyou for being my strength and for loving me even after I purposely try to be
              mean. I loveeee you and I hope your day goes really amazing.
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
            Ten little slots for our photos and videos.
          </p>
          <MemoryGallery />
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
          <p className="mt-10 text-center text-sm font-light leading-relaxed text-muted-foreground">
            We have went to uncountable dates and have created crazy memories together and I hope
            it stays the same. I love you my baby and I hope this stays.
          </p>

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
