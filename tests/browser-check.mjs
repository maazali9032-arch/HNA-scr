import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const base = process.env.INVITATION_TEST_URL || "http://127.0.0.1:4173";
const errors = [];
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
page.on("pageerror", (error) => errors.push(page.url() + " " + error.message));
let requests = [];
let response = {
  state: "live",
  shop: { name: "Public Atelier", phone: "SHOP_SECRET" },
  content: {
    groom_name: "Alexander",
    bride_name: "Amelia",
    invocation: "Together in love",
    wedding_date: "2099-12-14",
    start_time: "11:00",
    end_time: "13:00",
    groom_occupation: "Architect",
    groom_parents: "With blessings from family",
    bride_qualification: "Doctor",
    relatives: "With all our family",
    venue_name: "The Garden",
    venue_address: "1 Garden Lane",
    city: "Hyderabad",
    maps_url: "https://maps.google.com/?q=garden",
    events: [
      {
        title: "Wedding",
        event_date: "2099-12-14",
        start_time: "11:00",
        venue_name: "The Garden",
        note: "Lunch to follow",
      },
    ],
    contacts: [{ name: "Family", phone: "+91 90000 00000" }],
    music_enabled: true,
    music_url: "https://media.example.test/silent.mp3",
    gallery: ["https://media.example.test/photo.jpg"],
  },
};
await page.route("**/rest/v1/rpc/get_public_invitation_content", async (route) => {
  requests.push(route.request().postDataJSON());
  if (response === "error") return route.fulfill({ status: 503, body: "{}" });
  await route.fulfill({ json: response });
});
await page.route("https://media.example.test/**", (route) => route.abort());
await mkdir("test-results", { recursive: true });
await page.goto(`${base}/browser-test`);
await page.getByRole("button", { name: "Open Invitation" }).click();
await page.locator("#contact").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
assert.deepEqual(requests, [{ p_slug: "browser-test" }]);
assert.equal(await page.locator('a[href="tel:+91 90000 00000"]').count(), 1);
assert.equal(
  await page.locator('a[href="https://wa.me/919000000000"]').getAttribute("rel"),
  "noreferrer noopener",
);
assert.equal((await page.locator("body").innerText()).includes("SHOP_SECRET"), false);
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    `overflow at ${width}`,
  );
  const ribbon = await page.locator(".brand-ribbon").boundingBox();
  assert.ok(ribbon.height <= 17 && Math.abs(ribbon.y + ribbon.height - 844) < 1);
  await page.screenshot({ path: `test-results/hero-${width}.png` });
}
await page.getByRole("button", { name: "Play music" }).click();
await page.waitForTimeout(200);
assert.equal(await page.getByRole("button", { name: "Play music" }).count(), 1);
response = {
  state: "live",
  content: { bride_name: "A very long name that should wrap safely on the invitation" },
};
await page.setViewportSize({ width: 320, height: 740 });
await page.reload();
await page.getByRole("button", { name: "Open Invitation" }).click();
assert.equal(
  await page
    .locator("#venue, #contact, #gallery, #events, #couple, #countdown, .brand-ribbon")
    .count(),
  0,
);
assert.equal((await page.locator("header h1").innerText()).includes("&"), false);
await page.screenshot({ path: "test-results/minimal-mobile.png" });
response = {
  state: "fallback",
  shop: { name: "Public Atelier", phone: "123", whatsapp: "https://wa.me/123" },
  content: { groom_name: "PRIVATE WEDDING" },
};
await page.reload();
await page.getByRole("heading", { name: "This invitation is unavailable" }).waitFor();
assert.equal((await page.locator("body").innerText()).includes("PRIVATE WEDDING"), false);
await page.screenshot({ path: "test-results/fallback-mobile.png" });
response = "error";
await page.reload();
await page.getByRole("button", { name: "Try again" }).waitFor();
response = { state: "not_found" };
await page.getByRole("button", { name: "Try again" }).click();
await page.getByRole("heading", { name: "Invitation not found" }).waitFor();
for (const path of ["/", "/%E0%A4%A", "/%2F", "/%5C", "/too/many/segments"]) {
  const count = requests.length;
  await page.goto(`${base}${path}`);
  await page.getByRole("heading", { name: "Invitation not found" }).waitFor();
  assert.equal(requests.length, count, `unexpected RPC for ${path}`);
}
const iconPaths = await page
  .locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
assert.ok(
  iconPaths.includes("/favicon.ico") &&
    iconPaths.includes("/apple-icon-180x180.png") &&
    iconPaths.includes("/manifest.json"),
);
for (const path of iconPaths) assert.equal((await page.request.get(`${base}${path}`)).ok(), true);
assert.deepEqual(errors, []);
console.log(
  "Browser checks passed: 4 viewports, live/minimal/fallback/error/retry/not-found, malformed paths, contact privacy, music failure, favicons.",
);
await browser.close();
