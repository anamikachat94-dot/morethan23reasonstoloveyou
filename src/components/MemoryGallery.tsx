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

/** Ten photo/video slots, editable only after the secret code is entered. */
export function MemoryGallery() {
  const load = useServerFn(listMemories);
  const gate = useServerFn(getGateState);
  const unlock = useServerFn(unlockUploads);
  const lock = useServerFn(lockUploads);
  const upload = useServerFn(uploadMemory);
  const remove = useServerFn(deleteMemory);

  const [items, setItems] = useState<Memory[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<number, HTMLInputElement | null>>({});

  const refresh = async () => {
    const [media, state] = await Promise.all([load(), gate()]);
    setItems(media.items);
    setUnlocked(state.unlocked);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onRemove = async (slot: number) => {
    setBusySlot(slot);
    try {
      await remove({ data: { slot } });
      await refresh();
    } finally {
      setBusySlot(null);
    }
  };

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => i + 1);
  const filled = new Map(items.map((m) => [m.slot, m]));
  const visible = unlocked ? slots : slots.filter((s) => filled.has(s));

  return (
    <div>
      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm font-light text-muted-foreground">
          Our photos and videos are coming here soon.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((slot, i) => {
            const item = filled.get(slot);
            const tilt = [-3.5, 2.5, -1.5, 3, -2.5, 1.8][i % 6];
            return (
              <figure
                key={slot}
                style={{ transform: `rotate(${tilt}deg)` }}
                className="polaroid group relative mx-auto w-full max-w-[19rem] rounded-[2px] hover:!rotate-0"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary/40">
                  {item ? (
                    item.kind === "video" ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption ?? "One of our memories"}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-light tracking-widest text-primary-foreground/60">
                      empty
                    </span>
                  )}
                </div>
                {!unlocked && (
                  <figcaption className="absolute inset-x-3 bottom-2 text-center font-script text-xl text-[oklch(0.32_0.09_22)]">
                    only us
                  </figcaption>
                )}

                {unlocked && (
                  <div className="absolute inset-x-3 bottom-2 flex gap-2">

                    <button
                      type="button"
                      onClick={() => inputs.current[slot]?.click()}
                      disabled={busySlot === slot}
                      className="flex-1 rounded-sm border border-[oklch(0.32_0.09_22/25%)] px-2 py-1 text-[0.65rem] uppercase tracking-widest text-[oklch(0.32_0.09_22)] disabled:opacity-50"
                    >
                      {busySlot === slot ? "…" : item ? "replace" : "add"}
                    </button>
                    {item && (
                      <button
                        type="button"
                        onClick={() => onRemove(slot)}
                        disabled={busySlot === slot}
                        className="rounded-sm border border-[oklch(0.32_0.09_22/25%)] px-2 py-1 text-[0.65rem] uppercase tracking-widest text-[oklch(0.5_0.16_25)] disabled:opacity-50"
                      >
                        remove
                      </button>
                    )}
                    <input
                      ref={(el) => {
                        inputs.current[slot] = el;
                      }}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        void onPick(slot, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}
              </figure>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-6 text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 text-center">
        {unlocked ? (
          <button
            type="button"
            onClick={async () => {
              await lock();
              setUnlocked(false);
            }}
            className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground underline-offset-4 hover:underline"
          >
            done editing
          </button>
        ) : showCode ? (
          <form onSubmit={submitCode} className="mx-auto flex max-w-xs flex-col items-center gap-3">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="secret code"
              autoComplete="off"
              className="w-full rounded-sm border border-border bg-card/60 px-4 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {codeError && <span className="text-xs text-destructive">That's not it.</span>}
            <button
              type="submit"
              className="rounded-sm border border-primary/50 px-5 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-primary"
            >
              unlock
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCode(true)}
            className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground underline-offset-4 hover:underline"
          >
            add photos
          </button>
        )}
      </div>
    </div>
  );
}
