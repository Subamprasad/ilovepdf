# PDF Forge Clone (iLovePDF Style)

A Next.js app inspired by iLovePDF with a large tools catalog UI and working server-side PDF processing routes.

## Live Working Tools

- Merge PDF
- Split PDF (page ranges)
- Compress PDF (structure optimization)
- Organize PDF (custom page order)
- Rotate PDF
- Watermark PDF (text, opacity, angle, size)
- Add Page Numbers
- Crop PDF
- JPG/PNG to PDF

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- `pdf-lib` for PDF processing

## Local Run

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Production Build Check

```bash
npm run lint
npm run build
```

## Deploy to Netlify (from GitHub)

This repo is configured for Netlify + Next.js runtime.

1. Push code to GitHub.
2. In Netlify, choose **Add new site** -> **Import from Git**.
3. Select this GitHub repository.
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: leave empty/default (do not set `out`)
   - Node version: `20`
5. Deploy.

## Netlify Config

- `netlify.toml` includes `@netlify/plugin-nextjs`
- `next.config.mjs` does **not** use `output: "export"` (required for API routes)

## Notes

- Some advanced conversions shown in iLovePDF screenshots (for example PDF to Word, OCR, Unlock with cryptographic workflows) are marked as coming soon and need additional engines/services.
