# Glisse

Send files, no middleman, no bullshit.

Ever emailed yourself a file? PDF, screenshot… maybe even your dignity. WiFi's right there, the person's right there… yet somehow your file went through three mysterious servers in Timbuktu.

This is Glisse. The tool that finally fixes that.

## Magic in 4 Characters

1. Open a browser
2. Get a 4-character code
3. Share it
4. Drop files or paste text

Done. That's literally it.

No apps, no accounts, no limits. Files go directly from your browser to theirs. Server only introduces you two, then disappears. End-to-end encryption by default (DTLS-SRTP, doing the lord's work).

## Try it locally

**Needs:** [Bun](https://bun.sh)

```bash
git clone https://github.com/Moq77111113/glisse.xyz.git
cd glisse.xyz
bun install
bun run dev
```

Open `http://localhost:5173` in two tabs. Pretend you have friends. Send something. Watch the magic.

**Production:**

```bash
bun run build
bun run start 
```

Dockerfile included — for those who containerize everything, including feelings.

## MVP Status

- 2 people per room (not a bug, a feature)
- No fancy error toasts (refresh and smile)
- Rooms in memory (server restart = amnesia)
- Large files? Theoretically… I believe in you.

## Tech Stack

- HTML + vanilla TypeScript
- TailwindCSS
- Bun + Hono backend
- Native WebRTC
- No frameworks, no state management, no PhD required

## License

MIT. Do whatever. Free as in freedom, free as in beer 🍺.
