# Frontend verification

Use Node 22.22.2+ (the CI Node 22 runtime), 24.15+ or 26+. Install with `npm ci`.

```sh
npm test                     # API/auth/policy helpers
npm run test:components      # React Testing Library + Vitest/jsdom
npx playwright install chromium
npm run test:browser         # desktop + mobile Chromium emulation
```

If the browser CDN is unavailable and Google Chrome is installed:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:browser
```

Playwright owns two loopback servers on ports 3110 and 3111. It refuses to reuse another server. The Next app uses `.next-audit-browser` and a same-origin test API URL; it does not load a real backend. Keep these ports free. The Vite gallery is rooted under `tests/browser/gallery`, mounts the real checkout/billing components, and adds no route to the deployed application. Test providers are installed only in isolated browser contexts. Never use real credentials or a real payment provider in these fixtures.

## Coverage

- Component checks: password visibility/value preservation, OTP preview suppression/rejection/retry, confirmation recovery and same-order retry, denied purchases, subscription location/consent invalidation, denied billing.
- Actual Next pages: student/studio registration, consent/studio-name gating, OTP activation, rejected and successful password login, unverified login/OTP retry, reset-password flow, unsafe return destination, expired staff session and foreign studio selection.
- Browser component gallery: paid/free class checkout, confirmation failure and recovery after reload, dismissed payment, guest redirect, purchase denial/expired-session credential clearing, subscription quote/consent/verification/history, pending-payment reconciliation, teacher billing denial.
- All 17 browser scenarios run at desktop and mobile sizes (34 checks). Mobile emulates Chromium touch/viewport; this is not a physical Android/iOS or WebKit test.

API routes use explicit controlled responses; any unconfigured API request fails the test. Browser runtime errors also fail. Razorpay is replaced at its widget boundary; no real payment/email occurs. API/database enforcement is covered separately by the backend suite, including item 4's role/tenant tests. These frontend suites do not certify a full application-to-database journey, provider sandbox behavior, every dashboard tab, or backend permission enforcement. Existing valid backend schema/contract changes must be reflected in the fixtures and assertions.

Tests use role/label locators, exact navigation destinations, and observable UI/storage/request outcomes without fixed sleeps. Component dialog/resize methods are shimmed because jsdom lacks those native APIs; the Playwright gallery exercises the actual browser dialog.

CI runs helpers, components and both browser projects before the production build. CI installs Chromium and Linux dependencies; its browser-download path has not been executed locally. Failure evidence is retained for seven days as a GitHub artifact. Local HTML reports: `npx playwright show-report`; traces: `npx playwright show-trace test-results/<test>/trace.zip`. Reports/traces are ignored by Git. Fixtures contain synthetic data only.

## Item 7 checks

The suite now also runs axe WCAG A/AA scans on login, student/studio registration,
privacy, pricing and styled checkout/billing; privacy-dialog keyboard containment,
Escape and focus restoration; repeated mount/unmount heap/DOM/listener samples;
local paint/layout samples; and security-header assertions. These selected checks
are not a full-site WCAG or real-user Web Vitals certification. The gallery loads
production CSS. Component tests cover consent request payloads and bounded object
URL cleanup in addition to the auth/payment controls above.

For a production frontend run (ports 3110/3111 must be free):

```sh
NEXT_PUBLIC_API_URL=http://127.0.0.1:3110/api/v1 NEXT_PUBLIC_APP_ENV=test \
NEXT_DIST_DIR=.next-audit-item7 npm run build
PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_CHANNEL=chrome npm run test:browser
```

Without `PLAYWRIGHT_PRODUCTION=1` the runner starts its isolated development app.
Local resource/page samples use synthetic data and controlled responses and are
attached to the report. Private temporary JSON files are written under
`/private/tmp/item7-*`; no production accounts/credentials belong in test fixtures.
