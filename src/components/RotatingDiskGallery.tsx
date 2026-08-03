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
  { id: "def-1", slot: 1, kind: "image", caption: "Cozy mornings", url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop" },
  { id: "def-2", slot: 2, kind: "image", caption: "Golden hour walks", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop" },
  { id: "def-3", slot: 3, kind: "image", caption: "Sweetest laughs", url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop" },
  { id: "def-4", slot: 4, kind: "image", caption: "Holding hands", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop" },
  { id: "def-5", slot: 5, kind: "image", caption: "Favorite dates", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop" },
  { id: "def-6", slot: 6, kind: "image", caption: "Arcade peak date", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop" },
  { id: "def-7", slot: 7, kind: "image", caption: "Staring deeply into your eyes", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop" },
  { id: "def-8", slot: 8, kind: "image", caption: "Warm embraces", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop" },
  { id: "def-9", slot: 9, kind: "image", caption: "Night walks together", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop" },
  { id: "def-10", slot: 10, kind: "image", caption: "Always & forever", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop" },
];

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

  // Scroll driven animation state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const refresh = async () => {
    try {
      const [media, state] = await Promise.all([load(), gate()]);
      setItems(media.items || []);
      setUnlocked(state.unlocked || false);
    } catch {
      // Fallback
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

      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(rawProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map 10 slots: user uploaded items override default items
  const filledMap = new Map(items.map((m) => [m.slot, m]));
  const defaultFirst = DEFAULT_MEDIA[0]!;

  const allMediaList: Memory[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const slot = i + 1;
    const item = filledMap.get(slot);
    const fallback = DEFAULT_MEDIA[i] ?? defaultFirst;
    allMediaList.push(item ?? fallback);
  }

  const getMedia = (index: number): Memory => {
    return allMediaList[index] ?? DEFAULT_MEDIA[index % DEFAULT_MEDIA.length] ?? defaultFirst;
  };

  // Disk rotation degrees based on scroll
  const rotationAngle = scrollProgress * 720; // 2 full rotations

  // 10 items grouped in sliding sets of 3
  const totalSteps = MAX_SLOTS - 3;
  const currentStep = Math.min(totalSteps, Math.floor(scrollProgress * (totalSteps + 1)));

  const slotIndex0 = currentStep;
  const slotIndex1 = (currentStep + 1) % MAX_SLOTS;
  const slotIndex2 = (currentStep + 2) % MAX_SLOTS;

  const cardSlots: { baseAngle: number; media: Memory; slotNum: number }[] = [
    { baseAngle: 0, media: getMedia(slotIndex0), slotNum: slotIndex0 + 1 },
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
            {/* Vinyl Disc Outer Frame & Shadow */}
            <div className="relative h-[320px] w-[320px] sm:h-[440px] sm:w-[440px] lg:h-[500px] lg:w-[500px]">
              
              {/* Rotating Vinyl Disc Element */}
              <div
                style={{ transform: `rotate(${rotationAngle}deg)` }}
                className="relative h-full w-full rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-75 ease-out"
              >
                {/* Vinyl Grooves Background */}
                <div className="absolute inset-0 rounded-full bg-[#121214] p-2">
                  <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(40,40,45,1)_0%,rgba(18,18,20,1)_35%,rgba(35,35,40,1)_45%,rgba(15,15,18,1)_70%,rgba(28,28,32,1)_100%)] shadow-inner" />
                  
                  {/* Subtle Metallic Groove Lines */}
                  <div className="absolute inset-3 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                  <div className="absolute inset-8 rounded-full border border-white/10 opacity-30 pointer-events-none" />
                  <div className="absolute inset-14 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                  <div className="absolute inset-20 rounded-full border border-white/10 opacity-30 pointer-events-none" />
                  <div className="absolute inset-28 rounded-full border border-white/5 opacity-40 pointer-events-none" />
                </div>

                {/* Center Label (Matches Reference Image) */}
                <div className="absolute inset-0 m-auto flex h-[110px] w-[110px] sm:h-[150px] sm:w-[150px] items-center justify-center rounded-full border-4 border-[#2A2A2E] bg-[#F7F5EE] shadow-md">
                  <div className="relative flex h-full w-full flex-col items-center justify-between p-3 text-center text-[#1E1E20]">
                    {/* Top Label */}
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.25em] sm:text-[0.65rem]">
                      SIDE A
                    </span>
                    
                    {/* RPM Center Line */}
                    <div className="my-auto flex items-center gap-1">
                      <div className="h-px w-3 bg-[#1E1E20]/40" />
                      <span className="text-[0.6rem] font-semibold tracking-wider sm:text-[0.7rem]">
                        - 33⅓ RPM -
                      </span>
                      <div className="h-px w-3 bg-[#1E1E20]/40" />
                    </div>

                    {/* Bottom Label */}
                    <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] sm:text-[0.6rem]">
                      STEREO
                    </span>

                    {/* Center Spindle Hole */}
                    <div className="absolute inset-0 m-auto h-4 w-4 rounded-full border border-black/20 bg-[#121214] shadow-inner sm:h-5 sm:w-5" />
                  </div>
                </div>

                {/* 3 Polaroid Cards attached to disk at 120° intervals */}
                {cardSlots.map((card, idx) => {
                  const cardAngle = card.baseAngle;
                  const radiusPercent = 38;
                  const rad = (cardAngle * Math.PI) / 180;
                  const x = 50 + radiusPercent * Math.cos(rad);
                  const y = 50 + radiusPercent * Math.sin(rad);

                  return (
                    <div
                      key={idx}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${cardAngle + 90}deg)`,
                      }}
                      className="absolute z-20 transition-all duration-300 ease-out"
                    >
                      <figure className="group relative w-[95px] sm:w-[135px] lg:w-[155px] rounded-[3px] bg-[#FAF8F5] p-1.5 sm:p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
                        <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 rounded-[2px]">
                          {card.media.kind === "video" ? (
                            <video
                              src={card.media.url}
                              controls
                              playsInline
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src={card.media.url}
                              alt={card.media.caption || `Memory ${card.slotNum}`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          )}
                        </div>

                        <figcaption className="mt-1.5 text-center font-script text-[0.7rem] sm:text-xs text-[#2A1810] truncate">
                          {card.media.caption || `Memory #${card.slotNum}`}
                        </figcaption>

                        {/* Edit Mode Buttons */}
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
                              ref={(el) => {
                                inputs.current[card.slotNum] = el;
                              }}
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
          </div>

          {/* Right Text Content matching reference aesthetic */}
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

            {/* Scroll indicator */}
            <div className="mt-8 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
              <span>Scroll to rotate</span>
              <div className="h-4 w-px bg-primary/40 animate-pulse" />
            </div>

            {/* Edit Photos trigger */}
            <div className="mt-6">
              {unlocked ? (
                <button
                  type="button"
                  onClick={async () => {
                    await lock();
                    setUnlocked(false);
                  }}
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
                  Edit Media (10 Slots)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
