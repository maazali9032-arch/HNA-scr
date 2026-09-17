import assert from "node:assert/strict";
import { test } from "node:test";
import {
  slugFromPathname,
  normalize,
  safeUrl,
  mapLiveContent,
} from "../src/lib/publicInvitation.ts";

test("pathname decoding never substitutes or accepts decoded separators", () => {
  for (const path of ["/", "", "/%E0%A4%A", "/%2f", "/%5c", "/%20"])
    assert.equal(slugFromPathname(path), null);
  assert.equal(slugFromPathname("/first/final/"), "final");
  assert.equal(slugFromPathname("/%E0%A4%B0%E0%A4%BE%E0%A4%AE"), "राम");
});
test("fallback discards all wedding information, live retains no shop contacts", () => {
  const payload = {
    state: "fallback",
    content: { groom_name: "PRIVATE" },
    shop: { name: "Public brand", phone: "123", secret: "PRIVATE" },
  };
  assert.deepEqual(normalize(payload), {
    state: "fallback",
    shop: { name: "Public brand", phone: "123" },
  });
  const live = normalize({ ...payload, state: "live" });
  assert.equal(live.invite.brandName, "Public brand");
  assert.equal(JSON.stringify(live).includes("123"), false);
  assert.deepEqual(normalize({ data: { state: "not_found", content: payload.content } }), {
    state: "not_found",
  });
});
test("malformed responses are retryable errors, not fabricated not-found states", () => {
  for (const value of [
    null,
    [],
    {},
    { state: "draft" },
    { state: "live", content: [] },
    { data: { data: { state: "live" } } },
  ])
    assert.throws(() => normalize(value));
});
test("contacts use only the first two objects and their own phone", () => {
  const invite = mapLiveContent({
    contacts: [null, { phone: "+91 90000 00000" }, { phone: "999" }],
  });
  assert.deepEqual(invite.contacts, [
    { phone: "+91 90000 00000", whatsappUrl: "https://wa.me/919000000000" },
  ]);
  assert.equal(mapLiveContent({ contacts: [{ name: "No phone" }] }).contacts.length, 0);
  assert.equal(
    mapLiveContent({ contacts: [{ phone: "123", whatsapp_url: "javascript:alert(1)" }] })
      .contacts[0].whatsappUrl,
    undefined,
  );
});
test("untrusted links, malformed arrays and optional media fail safely", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:image/svg+xml,evil",
    "//host.test",
    "/local",
    "https://user:pass@host.test",
    {},
  ])
    assert.equal(safeUrl(value), undefined);
  const invite = mapLiveContent({
    gallery: [null, {}, "javascript:alert(1)", { url: "https://example.com/photo.jpg" }],
    events: "wrong",
    contacts: {},
    groom_photo_url: "javascript:alert(1)",
    music_enabled: false,
    music_url: "https://example.com/audio.mp3",
  });
  assert.equal(invite.gallery.length, 1);
  assert.equal(invite.groom.photo, undefined);
  assert.equal(invite.musicUrl, undefined);
  assert.deepEqual(invite.events, []);
});
test("end-only timing and partial events render without inventing a countdown", () => {
  const invite = mapLiveContent({
    wedding_date: "2099-01-01",
    end_time: "18:00",
    events: [{ start_time: "12:00" }, null],
  });
  assert.equal(invite.timeLabel, "18:00");
  assert.equal(invite.targetISO, undefined);
  assert.equal(invite.events.length, 1);
  assert.equal(
    mapLiveContent({ wedding_date: "2099-01-01", start_time: "invalid" }).targetISO,
    undefined,
  );
  assert.ok(mapLiveContent({ wedding_date: "2099-01-01", start_time: "12:00" }).targetISO);
});
test("public URL is retained exactly, never synthesized", () => {
  const url = "https://invitations.example/a%20b?x=1";
  assert.equal(
    normalize({ state: "live", content: {}, invitation: { public_url: url } }).invite.publicUrl,
    url,
  );
  assert.equal(mapLiveContent({}).publicUrl, undefined);
});
