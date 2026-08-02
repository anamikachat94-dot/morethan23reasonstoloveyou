import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export const MAX_SLOTS = 10;

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "memories-gate",
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function codeMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input.trim(), "utf8").digest();
  const b = createHash("sha256").update(expected.trim(), "utf8").digest();
  return timingSafeEqual(a, b);
}

async function requireUnlocked() {
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) throw new Error("Locked");
}

export type Memory = {
  id: string;
  slot: number;
  kind: string;
  caption: string | null;
  url: string;
};

/** Public: the gallery items with fresh signed links. */
export const listMemories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("memories")
    .select("id, slot, kind, caption, storage_path")
    .order("slot", { ascending: true });
  if (error) return { items: [] as Memory[] };

  const items: Memory[] = [];
  for (const row of data ?? []) {
    const signed = await supabaseAdmin.storage
      .from("memories")
      .createSignedUrl(row.storage_path, 60 * 60 * 6);
    if (!signed.data?.signedUrl) continue;
    items.push({
      id: row.id,
      slot: row.slot,
      kind: row.kind,
      caption: row.caption,
      url: signed.data.signedUrl,
    });
  }
  return { items };
});

/** Is this visitor in edit mode? */
export const getGateState = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  return { unlocked: session.data.unlocked === true };
});

export const unlockUploads = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["MEMORIES_UPLOAD_CODE"];
    if (!expected) return { ok: false as const };
    if (!codeMatches(data.code, expected)) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockUploads = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const uploadMemory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data");
    return data;
  })
  .handler(async ({ data }) => {
    await requireUnlocked();

    const file = data.get("file");
    const slot = Number(data.get("slot"));
    const caption = (data.get("caption") as string | null)?.slice(0, 200) || null;

    if (!(file instanceof File) || file.size === 0) throw new Error("No file");
    if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOTS) throw new Error("Bad slot");
    if (file.size > 45 * 1024 * 1024) throw new Error("File is too big (max 45MB)");

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) throw new Error("Only photos and videos");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const existing = await supabaseAdmin
      .from("memories")
      .select("id, storage_path")
      .eq("slot", slot)
      .maybeSingle();

    const ext = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase();
    const path = `slot-${slot}/${Date.now()}.${ext}`;

    const upload = await supabaseAdmin.storage
      .from("memories")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upload.error) throw new Error(upload.error.message);

    const row = {
      slot,
      url: path,
      storage_path: path,
      kind: isVideo ? "video" : "image",
      caption,
    };

    const saved = existing.data
      ? await supabaseAdmin.from("memories").update(row).eq("id", existing.data.id)
      : await supabaseAdmin.from("memories").insert(row);
    if (saved.error) throw new Error(saved.error.message);

    if (existing.data?.storage_path && existing.data.storage_path !== path) {
      await supabaseAdmin.storage.from("memories").remove([existing.data.storage_path]);
    }

    return { ok: true as const };
  });

export const deleteMemory = createServerFn({ method: "POST" })
  .inputValidator((data: { slot: number }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existing = await supabaseAdmin
      .from("memories")
      .select("id, storage_path")
      .eq("slot", data.slot)
      .maybeSingle();
    if (!existing.data) return { ok: true as const };
    await supabaseAdmin.from("memories").delete().eq("id", existing.data.id);
    await supabaseAdmin.storage.from("memories").remove([existing.data.storage_path]);
    return { ok: true as const };
  });
