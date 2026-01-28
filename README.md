# Glisse

Send files, no cloud, no accounts, no existential dread.

Ever emailed yourself a file just to get it from one device to another? Both devices are on the same WiFi, probably within arm's reach… yet your file took a scenic tour through several data centers on different continents.

Glisse fixes that. Browser to browser. The short route.

## Magic in 4 Characters

1. Open a browser
2. Get a 4-character code
3. Share it
4. Drop files or paste text

Done. That's literally it.

No apps, no accounts, no cloud storage. Files travel browser-to-browser via WebRTC. The server plays matchmaker, then politely exits stage left—your files never touch it, and the connection becomes fully peer-to-peer. Encrypted automatically by your browser's built-in DTLS (fancy cryptography that just works™).

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

Dockerfile included for the container enthusiasts.

## MVP Status

- 2 people per room (minimalism, not a bug)
- No fancy error toasts (refresh fixes most things)
- Rooms in memory (server restart = collective amnesia)
- Large files? Theoretically unlimited. Realistically, your patience might run out first.

## Tech Stack

- HTML + vanilla TypeScript
- TailwindCSS
- Bun + Hono backend
- Native WebRTC
- No frameworks, no state management, no PhD required

## Self-Hosting

### STUN Servers

By default, glisse uses Google's public STUN servers for WebRTC NAT traversal. If you're self-hosting and want to use your own STUN servers, set the `STUN_SERVERS` environment variable:

```bash
# Single server
export STUN_SERVERS="stun:stun.yourdomain.com:3478"

# Multiple servers (comma-separated)
export STUN_SERVERS="stun:stun1.yourdomain.com:3478,stun:stun2.yourdomain.com:3478"
```

**Docker:**

```yaml
version: '3'
services:
  glisse:
    build: .
    ports:
      - "3000:3000"
    environment:
      - STUN_SERVERS=stun:stun.yourdomain.com:3478
```

**Note on TURN servers:** For networks behind restrictive NAT/firewalls, you might need TURN servers (relay servers). This isn't implemented yet, but STUN works fine for most cases (~80% of connections).

## License

MIT. Do whatever. Free as in freedom, free as in beer 🍺.
