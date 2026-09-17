/**
 * ZAR public invitation integration.
 *
 * The browser talks to exactly one endpoint: the central public RPC
 * `get_public_invitation_content`. No tables, no schemas, no service role.
 */

export type InviteState = "live" | "fallback" | "not_found";

export interface InviteEvent {
  id: string;
  name: string;
  date?: string | undefined;
  time?: string | undefined;
  venue?: string | undefined;
  city?: string | undefined;
  mapsUrl?: string | undefined;
  note?: string | undefined;
}

export interface InviteImage {
  src: string;
  alt: string;
  caption?: string | undefined;
  span?: "tall" | "wide" | undefined;
}

export interface InviteContact {
  name?: string | undefined;
  phone: string;
  whatsappUrl?: string | undefined;
}

export interface InvitePerson {
  name?: string | undefined;
  photo?: string | undefined;
  qualification?: string | undefined;
  occupation?: string | undefined;
  parents?: string | undefined;
}

export interface Invite {
  brandName?: string | undefined;
  groom: InvitePerson;
  bride: InvitePerson;
  relatives?: string | undefined;
  invocation?: string | undefined;
  dateLabel?: string | undefined;
  targetISO?: string | undefined;
  timeLabel?: string | undefined;
  events: InviteEvent[];
  venue: {
    name?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    mapsUrl?: string | undefined;
    image?: string | undefined;
  };
  gallery: InviteImage[];
  musicUrl?: string | undefined;
  contacts: InviteContact[];
  qrText?: string | undefined;
  publicUrl?: string | undefined;
}

export interface ShopFallback {
  name?: string | undefined;
  phone?: string | undefined;
  whatsapp?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  business_contact?: string | undefined;
}

export type InviteResult =
  | { state: "live"; invite: Invite }
  | { state: "fallback"; shop: ShopFallback }
  | { state: "not_found" };

/* ------------------------------------------------------------------ */
/* Safe readers — every RPC field is untrusted input                   */
/* ------------------------------------------------------------------ */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

const pick = (o: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = str(o[k]);
    if (v) return v;
  }
  return undefined;
};

/** Only absolute HTTP(S) URLs may leave this public page. */
export function safeUrl(value: unknown): string | undefined {
  const valueString = str(value);
  if (!valueString) return undefined;
  try {
    const url = new URL(valueString);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
      ? valueString
      : undefined;
  } catch {
    return undefined;
  }
}

/** Read the last non-empty pathname segment, safely decoded. */
export function slugFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const raw = parts[parts.length - 1];
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  decoded = decoded.trim();
  if (!decoded || decoded.includes("/") || decoded.includes("\\")) return null;
  return decoded;
}

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

function mapEvents(v: unknown): InviteEvent[] {
  if (!Array.isArray(v)) return [];
  const out: InviteEvent[] = [];
  v.forEach((raw, i) => {
    if (!isObj(raw)) return;
    const name = pick(raw, "name", "title", "event_name");
    const date = pick(raw, "date", "event_date");
    const time = pick(raw, "time", "start_time");
    const venue = pick(raw, "venue", "venue_name");
    if (!name && !date && !time && !venue && !pick(raw, "city", "note", "description")) return;
    out.push({
      id: pick(raw, "id") ?? `event-${i}`,
      name: name ?? "Celebration",
      ...(date ? { date } : {}),
      ...(time ? { time } : {}),
      ...(venue ? { venue } : {}),
      ...(pick(raw, "city") ? { city: pick(raw, "city") } : {}),
      mapsUrl: safeUrl(pick(raw, "maps_url", "mapsUrl")),
      ...(pick(raw, "note", "description") ? { note: pick(raw, "note", "description") } : {}),
    });
  });
  return out;
}

function mapGallery(v: unknown): InviteImage[] {
  if (!Array.isArray(v)) return [];
  const out: InviteImage[] = [];
  for (const raw of v) {
    if (typeof raw === "string") {
      const s = str(raw);
      if (s && safeUrl(s)) out.push({ src: s, alt: "Wedding photograph" });
      continue;
    }
    if (!isObj(raw)) continue;
    const src = pick(raw, "url", "src", "image_url");
    if (!src || !safeUrl(src)) continue;
    const span = raw["span"];
    out.push({
      src,
      alt: pick(raw, "alt", "caption") ?? "Wedding photograph",
      ...(pick(raw, "caption") ? { caption: pick(raw, "caption") } : {}),
      ...(span === "tall" || span === "wide" ? { span } : {}),
    });
  }
  return out;
}

function digits(s: string) {
  return s.replace(/\D/g, "");
}

function mapContacts(v: unknown): InviteContact[] {
  if (!Array.isArray(v)) return [];
  const out: InviteContact[] = [];
  for (const raw of v.slice(0, 2)) {
    if (!isObj(raw)) continue;
    const phone = pick(raw, "phone");
    if (!phone) continue;
    const suppliedWa = pick(raw, "whatsapp_url");
    const wa = safeUrl(suppliedWa);
    const derived = digits(phone);
    out.push({
      ...(pick(raw, "name") ? { name: pick(raw, "name") } : {}),
      phone,
      ...(wa
        ? { whatsappUrl: wa }
        : !suppliedWa && derived
          ? { whatsappUrl: `https://wa.me/${derived}` }
          : {}),
    });
  }
  return out;
}

function formatDateLabel(raw?: string): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Build a countdown target only when it is a valid future datetime. */
function targetISO(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  // Never guess midnight or silently ignore an invalid supplied time.
  if (!time && !/T\d{2}:\d{2}/.test(date)) return undefined;
  const candidates = time ? [`${date}T${time}`, `${date} ${time}`] : [date];
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) return d.toISOString();
  }
  return undefined;
}

export function mapLiveContent(content: Record<string, unknown>, publicUrl?: string): Invite {
  const date = pick(content, "wedding_date");
  const start = pick(content, "start_time");
  const end = pick(content, "end_time");
  const target = targetISO(date, start);
  const timeLabel = start ? (end ? `${start} — ${end}` : start) : end;
  const groomPhoto = safeUrl(content["groom_photo_url"]);
  const bridePhoto = safeUrl(content["bride_photo_url"]);

  const gallery = mapGallery(content["gallery"]);
  for (const p of [groomPhoto, bridePhoto]) {
    if (p && !gallery.some((g) => g.src === p)) {
      gallery.push({ src: p, alt: "The couple" });
    }
  }

  const musicEnabled = content["music_enabled"] === true;
  const musicUrl = musicEnabled ? safeUrl(content["music_url"]) : undefined;

  return {
    groom: {
      ...(pick(content, "groom_name") ? { name: pick(content, "groom_name") } : {}),
      ...(groomPhoto ? { photo: groomPhoto } : {}),
      ...(pick(content, "groom_qualification")
        ? { qualification: pick(content, "groom_qualification") }
        : {}),
      ...(pick(content, "groom_occupation")
        ? { occupation: pick(content, "groom_occupation") }
        : {}),
      ...(pick(content, "groom_parents") ? { parents: pick(content, "groom_parents") } : {}),
    },
    bride: {
      ...(pick(content, "bride_name") ? { name: pick(content, "bride_name") } : {}),
      ...(bridePhoto ? { photo: bridePhoto } : {}),
      ...(pick(content, "bride_qualification")
        ? { qualification: pick(content, "bride_qualification") }
        : {}),
      ...(pick(content, "bride_occupation")
        ? { occupation: pick(content, "bride_occupation") }
        : {}),
      ...(pick(content, "bride_parents") ? { parents: pick(content, "bride_parents") } : {}),
    },
    ...(pick(content, "relatives") ? { relatives: pick(content, "relatives") } : {}),
    ...(pick(content, "invocation") ? { invocation: pick(content, "invocation") } : {}),
    ...(formatDateLabel(date) ? { dateLabel: formatDateLabel(date) } : {}),
    ...(target ? { targetISO: target } : {}),
    ...(timeLabel ? { timeLabel } : {}),
    events: mapEvents(content["events"]),
    venue: {
      ...(pick(content, "venue_name") ? { name: pick(content, "venue_name") } : {}),
      ...(pick(content, "venue_address") ? { address: pick(content, "venue_address") } : {}),
      ...(pick(content, "city") ? { city: pick(content, "city") } : {}),
      mapsUrl: safeUrl(content["maps_url"]),
      image: safeUrl(content["venue_image_url"]),
    },
    gallery,
    ...(musicUrl ? { musicUrl } : {}),
    contacts: mapContacts(content["contacts"]),
    ...(pick(content, "qr_text") ? { qrText: pick(content, "qr_text") } : {}),
    ...(publicUrl ? { publicUrl } : {}),
  };
}

export function normalize(payload: unknown): InviteResult {
  let root: unknown = payload;
  if (isObj(root) && !("state" in root) && "data" in root) root = root["data"];
  if (!isObj(root))
    throw new InvitationRequestError("The invitation could not be read. Please try again.");

  const state = str(root["state"]);
  if (state === "live") {
    const content = isObj(root["content"]) ? root["content"] : null;
    if (!content)
      throw new InvitationRequestError("The invitation could not be read. Please try again.");
    const invitation = isObj(root["invitation"]) ? root["invitation"] : {};
    const publicUrl = pick(invitation, "public_url");
    // Only the public shop name is approved for the live ribbon. Never retain contacts.
    const brandName = isObj(root["shop"]) ? str(root["shop"]["name"]) : undefined;
    return { state: "live", invite: { ...mapLiveContent(content, publicUrl), brandName } };
  }
  if (state === "fallback") {
    const shopRaw = isObj(root["shop"]) ? root["shop"] : {};
    const shop: ShopFallback = {};
    for (const k of ["name", "phone", "whatsapp", "address", "city", "business_contact"] as const) {
      const v = str(shopRaw[k]);
      if (v) shop[k] = v;
    }
    return { state: "fallback", shop };
  }
  if (state === "not_found") return { state: "not_found" };
  throw new InvitationRequestError("The invitation could not be read. Please try again.");
}

/* ------------------------------------------------------------------ */
/* The single allowed data call                                        */
/* ------------------------------------------------------------------ */

export class InvitationRequestError extends Error {}

export async function fetchPublicInvitation(
  slug: string,
  signal?: AbortSignal,
): Promise<InviteResult> {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !key) {
    throw new InvitationRequestError("Invitation service is not configured yet.");
  }

  let res: Response;
  try {
    res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/get_public_invitation_content`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_slug: slug }),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
  } catch {
    throw new InvitationRequestError("We could not reach the invitation service.");
  }

  if (!res.ok) throw new InvitationRequestError("The invitation could not be loaded.");

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new InvitationRequestError("The invitation could not be read.");
  }
  return normalize(payload);
}
