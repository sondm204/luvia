# Local memory album

Run `pnpm install`, then `pnpm dev`. No database, cloud storage, secrets or migrations are needed.

- `data/memories.json`: all memory information.
- `public/uploads/`: photo files.
- The Add Memory form writes both through the local Next.js server.

You can also place an image in `public/uploads/` and add an entry to the JSON array:

```json
{
  "id": "my-first-memory",
  "title": "A day together",
  "note": "Our favorite moment.",
  "date": "2026-10-12",
  "image": "/uploads/my-photo.jpg",
  "createdAt": "2026-10-12T00:00:00.000Z"
}
```

Use unique IDs and filenames containing letters, digits, underscores or hyphens. Images can be JPG, PNG or WebP. Refresh after manual edits. The form accepts photos up to 10 MB.

Back up `data/memories.json` and `public/uploads/` together. Run one Node server with writable persistent project storage. For production use `pnpm build` then `pnpm start` on that machine. Photos added after building are served by a local route, so no rebuild is required. Static-only or ephemeral serverless hosting cannot persist these file writes. Old env files are unused.
