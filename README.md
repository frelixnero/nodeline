# nodeline

A visual workflow editor and orchestrator — build, run and observe event-driven workflows with a modern Next.js UI and a Prisma-backed backend.

Elevator pitch: a developer-first workflow studio for creating and executing orchestrated flows (editor + executions + monitoring).

## Key Features

- Visual workflow editor using React Flow (drag, connect, edit nodes)
- Realtime and async executions with Inngest-backed functions and background processing
- tRPC API surface for frontend↔backend type-safe calls
- PostgreSQL/Neon persistence via Prisma with full migrations
- Auth, dashboards, and subscription workflows out of the box
- Observability integrations (Sentry)

## Architecture (high level)

- Frontend: Next.js (app router) + TypeScript — UI components live in `src/components` and pages in `src/app`.
- API & RPC: `src/trpc` exposes typed server routes consumed by the UI.
- Workers / events: `src/inngest` contains client and function definitions powering async workflows.
- Persistence: `prisma/schema.prisma` and the `prisma/migrations` folder manage the DB schema.
- Utilities: DB helpers in `src/lib/db.ts`, auth helpers in `src/lib/auth-client.ts`.

Notable files:

- [prisma/schema.prisma](prisma/schema.prisma)
- [src/app/(dashboard)](src/app/%28dashboard%29)
- [src/components/react-flow](src/components/react-flow)
- [src/trpc](src/trpc)
- [src/inngest/client.ts](src/inngest/client.ts)

## Quickstart (development)

Prereqs: Node 18+ and your preferred package manager (npm / pnpm / yarn).

1. Install dependencies

```bash
npm install
```

2. Prepare environment

- Copy `.env.example` to `.env` and set your DB connection and any provider keys (Neon, Sentry, Inngest, auth secrets).

3. Generate Prisma client & run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 and sign in to the dashboard to start creating workflows.

## Deployment

This project deploys well to Vercel for the frontend; backend functions and long-running workers may require a dedicated runtime (e.g., serverless functions, dedicated worker host, or Inngest runner). Ensure environment variables and the database connection are configured in your deployment target.

## Contributing

Contributions, issues and suggestions are welcome. Please open a PR or issue and describe the change or bug. For architecture or design discussions, start an issue so we can align on goals.

## License

Add a license or keep it private depending on your preference.

---

Need a shorter one-line pitch for README header or a more marketing-focused landing blurb? I can produce both variants.
