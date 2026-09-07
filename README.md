# ProgressRooms Web (Frontend Application)

Production-grade Next.js 14 application for ProgressRooms multi-tenant platform.

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
