# Public invitation implementation and deployment

The invitation follows PUBLIC_INVITATION_INTEGRATION.md. The original henna SVG artwork, palette, typefaces and section choreography are retained. The root URL shows a themed welcome screen explaining that each invitation has its own link; unknown routes show the themed not-found screen. Wedding content is fetched only for a valid single-segment invitation URL.

## Configuration

Set only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the hosting provider before building. `.env.example` contains the two empty placeholders, and local environment files are ignored. No database setup or server runtime is required.

The browser sends one POST to get_public_invitation_content per slug load or explicit retry. Slug changes discard the old invitation immediately. Requests are cancelled on unmount and time out after 15 seconds. Live, fallback, not-found and request-error states are separate; malformed responses become retryable errors.

The ribbon uses only `shop.name` from the public RPC response. The contract defines no alternate brand field. If the central RPC does not include that approved name on live responses, the ribbon remains hidden until the platform supplies it; no brand is guessed and no shop contacts are retained in live state. Confirm this field with a real invitation before release.

The original design brief describes RSVP and social links, but the current integration contract provides neither a submission endpoint nor social fields. The implemented Contact section supplies the approved Call and WhatsApp actions. No fake form submission, extra backend, or public-page QR has been added.

## Hosting

Run `npm run build` and publish **dist/client**. TanStack Start generates `index.html` as the static SPA shell. `vercel.json` configures the build, output directory and deep-link rewrite. On another static host, rewrite unknown paths to `/index.html`, while serving existing assets normally. The build-time server output is not needed for hosting.

All favicon images are the existing files in `public`; icon binaries were not replaced. PNG, ICO, Apple touch icons, Android manifest icons and Windows browser configuration are connected. The manifest title identifies the invitation rather than an admin dashboard.

## Checks

- `npm test`: data-contract regression tests (Node 22.18+ or 24).
- `npx tsc --noEmit`: TypeScript.
- `npm run lint`: source formatting and lint rules. Existing shared UI fast-refresh warnings are non-blocking.
- `npm run build`: static production build.
- `node tests/serve-built.mjs`: locally serves the production build with SPA fallback on port 4174.
- `node tests/browser-check.mjs`: browser regression suite; requires Playwright and Microsoft Edge. Set INVITATION_TEST_URL to the local server URL and optionally PLAYWRIGHT_MODULE to a file URL for an existing Playwright installation. Use nonsecret test placeholders for the two build-time variables; RPC responses are intercepted with fixtures and never sent to a real backend. Screenshots are written to ignored `test-results`.

The browser suite covers 320, 390, 768 and 1440px layouts, full and sparse live content, fallback privacy, request failure and retry, not-found and malformed paths, music playback rejection, contact links, exact favicon paths and direct refresh. A real central-platform invitation and hosted deployment still need a final smoke test with the deployment's manually configured public values.
