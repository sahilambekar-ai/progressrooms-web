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
