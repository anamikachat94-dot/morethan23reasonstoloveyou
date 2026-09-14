import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MAX_SLOTS,
  deleteMemory,
  getGateState,
  listMemories,
  lockUploads,
  unlockUploads,
  uploadMemory,
  type Memory,
} from "@/lib/memories.functions";

const DEFAULT_MEDIA: Memory[] = [
  { id: "def-1", slot: 1, kind: "image", caption:  "My💕", url: "/a pic.jpeg" },
  { id: "def-2", slot: 2, kind: "video", caption: "Our little moment", url: "/b vid.mov" },
  { id: "def-3", slot: 3, kind: "image", caption: "Babygirl💘", url: "/c pic.jpeg" },
  { id: "def-4", slot: 4, kind: "video", caption: "Marking my territory❤️", url: "/d vid.mov" },
  { id: "def-5", slot: 5, kind: "image", caption: "My favourite person", url: "/e pic.jpeg" },
  { id: "def-6", slot: 6, kind: "video", caption: "Love our kisses💘", url: "/f vid.mov" },
  { id: "def-7", slot: 7, kind: "image", caption: "Every moment with you", url: "/g pic.jpeg" },
  { id: "def-8", slot: 8, kind: "video", caption: "us❤️", url: "/h vid.mov" },
  { id: "def-9", slot: 9, kind: "image", caption: "Ps- I still love you💕", url: "/i pic.jpeg" },
];

// How many degrees of disk rotation before we advance to the next media step
const DEGREES_PER_STEP = 120; // one full 120° turn per media swap — 6 steps × 120° = 720° total

export function RotatingDiskGallery() {
  const load = useServerFn(listMemories);
  const gate = useServerFn(getGateState);
  const unlock = useServerFn(unlockUploads);
  const lock = useServerFn(lockUploads);
  const upload = useServerFn(uploadMemory);

  const [items, setItems] = useState<Memory[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [, setError] = useState<string | null>(null);
  const inputs = useRef<Record<number, HTMLInputElement | null>>({});

  // Track rotation angle in degrees directly from scroll position
  // Positive = clockwise (scroll down), negative = anticlockwise (scroll up)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  const refresh = async () => {
    try {
      const [media, state] = await Promise.all([load(), gate()]);
      setItems(media.items || []);
      setUnlocked(state.unlocked || false);
    } catch {
      // Fallback — keep defaults
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      // currentScroll goes from 0 (top of section) to totalScrollable (bottom)
      const currentScroll = Math.max(0, -rect.top);
      // Map scroll position linearly to rotation:
      // full scroll range = 6 steps × DEGREES_PER_STEP = 720°
      const totalDegrees = (DEFAULT_MEDIA.length - 3) * DEGREES_PER_STEP; // 720°
      const angle = (currentScroll / totalScrollable) * totalDegrees;
      setRotationAngle(angle);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map 9 slots: user-uploaded items override defaults
  const filledMap = new Map(items.map((m) => [m.slot, m]));
  const allMediaList: Memory[] = DEFAULT_MEDIA.map((def, i) => filledMap.get(i + 1) ?? def);

  const getMedia = (index: number): Memory =>
    allMediaList[index] ?? DEFAULT_MEDIA[index % DEFAULT_MEDIA.length] ?? DEFAULT_MEDIA[0]!;

  // Current media step: derived from rotation angle, clamped to valid range
  const MEDIA_COUNT = DEFAULT_MEDIA.length; // 9
  const totalSteps = MEDIA_COUNT - 3; // 6
  const rawStep = rotationAngle / DEGREES_PER_STEP;
  const currentStep = Math.min(totalSteps, Math.max(0, Math.floor(rawStep)));

  const slotIndex0 = currentStep;
  const slotIndex1 = (currentStep + 1) % MEDIA_COUNT;
  const slotIndex2 = (currentStep + 2) % MEDIA_COUNT;

  const cardSlots: { baseAngle: number; media: Memory; slotNum: number }[] = [
    { baseAngle: 0,   media: getMedia(slotIndex0), slotNum: slotIndex0 + 1 },
    { baseAngle: 120, media: getMedia(slotIndex1), slotNum: slotIndex1 + 1 },
    { baseAngle: 240, media: getMedia(slotIndex2), slotNum: slotIndex2 + 1 },
  ];

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await unlock({ data: { code } });
    if (res.ok) {
      setUnlocked(true);
      setShowCode(false);
      setCode("");
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

  const onPick = async (slot: number, file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusySlot(slot);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("slot", String(slot));
      await upload({ data: form });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusySlot(null);
    }
  };

  return (
    <div ref={containerRef} className="relative h-[320vh] w-full">
      {/* Sticky Viewport */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-4 sm:px-8">
        <div className="relative flex w-full max-w-6xl flex-col items-center justify-between gap-8 md:flex-row md:gap-12">

          {/* Rotating Vinyl Record Container */}
          <div className="relative flex items-center justify-center">
            {/* Outer container — cards and disk share this coordinate space */}
            <div className="relative h-[320px] w-[320px] sm:h-[440px] sm:w-[440px] lg:h-[500px] lg:w-[500px]">

              {/* Rotating Vinyl Disc — spins, but cards are NOT inside it */}
              <div
                style={{ transform: `rotate(${rotationAngle}deg)` }}
                className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] will-change-transform"
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-0 rounded-full bg-[#121214] p-2">
                  <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(40,40,45,1)_0%,rgba(18,18,20,1)_35%,rgba(35,35,40,1)_45%,rgba(15,15,18,1)_70%,rgba(28,28,32,1)_100%)] shadow-inner" />
                  <div className="absolute inset-3  rounded-full border border-white/5  opacity-40 pointer-events-none" />
                  <div className="absolute inset-8  rounded-full border border-white/10 opacity-30 pointer-events-none" />
                  <div className="absolute inset-14 rounded-full border border-white/5  opacity-40 pointer-events-none" />
                  <div className="absolute inset-20 rounded-full border border-white/10 opacity-30 pointer-events-none" />
                  <div className="absolute inset-28 rounded-full border border-white/5  opacity-40 pointer-events-none" />
                </div>

                {/* Center Label */}
                <div className="absolute inset-0 m-auto flex h-[110px] w-[110px] sm:h-[150px] sm:w-[150px] items-center justify-center rounded-full border-4 border-[#2A2A2E] bg-[#F7F5EE] shadow-md">
                  <div className="relative flex h-full w-full flex-col items-center justify-between p-3 text-center text-[#1E1E20]">
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.25em] sm:text-[0.65rem]">SIDE A</span>
                    <div className="my-auto flex items-center gap-1">
                      <div className="h-px w-3 bg-[#1E1E20]/40" />
                      <span className="text-[0.6rem] font-semibold tracking-wider sm:text-[0.7rem]">- 33⅓ RPM -</span>
                      <div className="h-px w-3 bg-[#1E1E20]/40" />
                    </div>
                    <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] sm:text-[0.6rem]">STEREO</span>
                    <div className="absolute inset-0 m-auto h-4 w-4 rounded-full border border-black/20 bg-[#121214] shadow-inner sm:h-5 sm:w-5" />
                  </div>
                </div>
              </div>

              {/* Polaroid Cards — separate layer, NOT inside the rotating disk.
                  Each card orbits the disk centre at the same radius but is only
                  transformed once, keeping images pixel-sharp with no nested-transform blur. */}
              {cardSlots.map((card, idx) => {
                const cardAngle = card.baseAngle;
                const radiusPercent = 38;
                const rad = ((cardAngle + rotationAngle) * Math.PI) / 180;
                const x = 50 + radiusPercent * Math.cos(rad);
                const y = 50 + radiusPercent * Math.sin(rad);

                return (
                  <div
                    key={idx}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute z-20"
                  >
                    <figure
                      key={card.media.id}
                      className="group relative w-[115px] sm:w-[165px] lg:w-[185px] rounded-[3px] bg-[#FAF8F5] p-1.5 sm:p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
                    >
                      {/* Media frame — object-contain keeps original proportions, no crop */}
                      <div className="relative w-full overflow-hidden bg-neutral-900 rounded-[2px]" style={{ height: "145px" }}>
                        {allMediaList.map((m) =>
                          m.kind === "video" ? (
                            <video
                              key={m.url}
                              src={m.url}
                              poster={m.url === "/h vid.mov" ? "/h vid-poster.jpg" : undefined}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="auto"
                              className="absolute inset-0 h-full w-full object-contain"
                              style={{ display: m.url === card.media.url ? "block" : "none" }}
                            />
                          ) : (
                            <img
                              key={m.url}
                              src={m.url}
                              alt={m.caption || `Memory`}
                              className="absolute inset-0 h-full w-full object-contain"
                              style={{ display: m.url === card.media.url ? "block" : "none" }}
                            />
                          )
                        )}
                      </div>

                      <figcaption
                        className="mt-2 text-center font-display italic text-[0.8rem] sm:text-[0.85rem] leading-snug truncate"
                        style={{ color: "#6d1220", fontWeight: 500 }}
                      >
                        {card.media.caption || `Memory #${card.slotNum}`}
                      </figcaption>

                      {/* Edit Mode */}
                      {unlocked && (
                        <div className="mt-1 flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => inputs.current[card.slotNum]?.click()}
                            disabled={busySlot === card.slotNum}
                            className="rounded border border-black/20 px-1 py-0.5 text-[0.55rem] uppercase text-black"
                          >
                            {busySlot === card.slotNum ? "…" : "replace"}
                          </button>
                          <input
                            ref={(el) => { inputs.current[card.slotNum] = el; }}
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              void onPick(card.slotNum, e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      )}
                    </figure>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Text */}
          <div className="relative z-10 flex flex-col items-center text-center md:items-end md:text-right">
            <h2 className="font-display text-4xl font-normal leading-tight sm:text-6xl lg:text-7xl">
              Only
              <span className="ml-3 font-script text-5xl sm:text-7xl lg:text-8xl text-gold block sm:inline">
                Us
              </span>
            </h2>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-muted-foreground sm:text-base md:max-w-sm">
              Every moment feels a little brighter when it's just us
            </p>

            <div className="mt-8 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
              <span>Scroll to rotate</span>
              <div className="h-4 w-px bg-primary/40 animate-pulse" />
            </div>

            <div className="mt-6">
              {unlocked ? (
                <button
                  type="button"
                  onClick={async () => { await lock(); setUnlocked(false); }}
                  className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground underline hover:text-foreground"
                >
                  Done Editing
                </button>
              ) : showCode ? (
                <form onSubmit={submitCode} className="flex items-center gap-2">
                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="secret code"
                    className="w-28 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="rounded border border-primary/50 px-2 py-1 text-[0.6rem] uppercase tracking-wider text-primary"
                  >
                    Unlock
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCode(true)}
                  className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/80 hover:text-foreground"
                >
                  Edit Media (9 Slots)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
