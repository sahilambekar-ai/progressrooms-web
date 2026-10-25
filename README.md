# Progress Rooms Web (Frontend Application)

Production-grade Next.js 14 application for Progress Rooms multi-tenant platform.

## Tech Stack
- **Framework**: Next.js 14.2.35 (App Router, Server-Side Rendering)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React

## Structure
- `src/app/(tenant)/[orgSlug]`: Server-side rendered public teacher & studio pages.
- `src/app/(tenant)/[orgSlug]/sessions/[sessionSlug]`: Public SSR session details, schedule & booking.
- `src/app/(dashboard)`: Studio management portal (Sessions, Scheduling, Attendance, Website customization).
- `src/app/(student)`: Student portal (Upcoming classes, Zoom join links, package credits).
- `src/app/(admin)`: Platform Super Admin operations.

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to view the application.

## Small production deployment

Run `npm run build:standalone`, then deploy `.next/standalone` and start its
`server.js` with Node (`npm run start:standalone` from this checkout). The packaging
step includes `public` and `.next/static`; deploy the prepared directory rather
than the full development `node_modules` or build cache. Set `PORT` and `HOSTNAME`
for the deployment environment. Normal builds still require Google Fonts access
for the existing `next/font` Lora configuration.

`npm run typecheck` also rejects unused locals and parameters. Dashboard panels
load when opened; the global communication button loads its panel on demand.

## Select a backend while running locally

From this Web repository:

```bash
npm start dev     # localhost frontend -> localhost:8000 API; local developer controls
npm start uat     # localhost frontend -> https://uat.progressrooms.com/api/v1
npm start prod    # localhost frontend -> https://progressrooms.com/api/v1
```

`npm run start:dev`, `npm run start:uat` and `npm run start:prod` are aliases;
`npm run dev` selects the local API. These commands run a local Next development
server, not a deployment. `npm start prod` connects to real production data.
Keep normal password authentication enabled; the developer shortcut is not used.

Browser requests use `/api/v1`, proxied by Next to the selected backend, so no VPS
CORS expansion is needed. Server-rendered studio pages and communication requests
use the same backend. `.env.local` cannot silently redirect these target modes.
Separate `.next-dev`, `.next-uat` and `.next-prod` caches avoid mixing environments.
Stop one mode before switching, or use a different port:

```bash
npm start uat -- -p 3001
npm start uat -- --check   # show target configuration without starting a server
```

Override a backend using a process environment variable (the URL must end in
`/api/v1`; UAT/prod require HTTPS):

```bash
PROGRESSROOMS_UAT_API_URL=https://uat.progressrooms.com/api/v1 npm start uat
```

`PROGRESSROOMS_DEV_API_URL` and `PROGRESSROOMS_PROD_API_URL` work similarly.
`npm start` without a target retains `next start` behavior for an existing
production build; Docker/standalone deployments keep their existing startup.
Build-time `NEXT_PUBLIC_API_URL` still selects the backend for deployed images.
The floating developer controls require a local hostname, development build and
dev target. They are always hidden in production builds and in UAT/prod targets,
regardless of a previously saved browser toggle.
