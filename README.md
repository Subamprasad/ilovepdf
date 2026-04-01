# Briefly

Anonymous URL shortener built with Next.js, TypeScript, Tailwind CSS, Prisma, and SQLite.
try this https://url-shoter-link.netlify.app/

## Features

- Create short URLs without creating an account
- Optional custom alias
- Optional password protection
- Optional expiration date/time
- Optional downloadable QR code
- Private manage URL shown once after link creation
- Edit destination URL later from the private manage page
- Disable or delete links
- Basic click counting and click event storage

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite storage (local file in development, `/tmp` fallback on Netlify)

## Getting Started

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Generate Prisma client with `npm run prisma:generate`
4. Create the local SQLite database with `npm run db:init`
5. Start the app with `npm run dev`.

## Environment Variables

- `DATABASE_URL`: Prisma connection string (optional locally, defaults to `file:./dev.db`)
- `NEXT_PUBLIC_APP_URL`: public app base URL (optional; API falls back to request origin)
- `REDIS_URL`: reserved for future distributed rate limiting

## Netlify Deployment

This repo now includes a `netlify.toml` with:

- `build.command = "npm run build"`
- `NODE_VERSION = "20"`
- `DATABASE_URL = "file:/tmp/url-shortener.db"` for serverless runtime compatibility

### Deploy steps

1. Push this repo to GitHub.
2. In Netlify, create a new site from the repository.
3. Keep the default build command (`npm run build`).
4. (Recommended) Add `NEXT_PUBLIC_APP_URL` in Netlify env vars to your site domain.
5. Deploy.

## Notes

- The app auto-initializes SQLite tables at runtime when using a `file:` database URL.
- Netlify serverless file storage (`/tmp`) is ephemeral; data can reset across cold starts/redeploys.
- For durable production data, move to PostgreSQL and set `DATABASE_URL` to your external database.

## Next Steps

- Replace the in-memory rate limiter with Redis
- Move from SQLite to PostgreSQL for production
- Add QR code generation
- Add abuse detection and blocked domain checks
- Add richer analytics charts
