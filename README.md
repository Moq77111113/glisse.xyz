# Glisse


![Glisse demo](./demo.gif)

**The shortest path between two devices.**

Send files and text directly from one browser to another.  
No cloud. No accounts. No sync rituals. No files taking a gap year in five data centers.

If your file goes through a server, it’s already too late.

## What is Glisse?

Glisse is a tiny web app for sharing files and text **directly** between two devices.  
Browser to browser. Peer to peer. No middlemen with trust issues.

No installs. No sign-ups. No storage. Nothing to configure.  
Open a page, get a code, and glide your files across.

It does exactly what you expect.  
And nothing you don’t.


## Magic in 4 Characters

1. Open a browser  
2. Get a 4-character code  
3. Share it  
4. Drop files or paste text  

Done.

That’s not the “quick start”.  
That *is* the product.


## How It Works (No Marketing Fog)

- Uses **WebRTC** for direct browser-to-browser connections  
- The server only handles **signaling** and **reconnection**  
- Your files **never touch the server**  
- Once connected, everything is fully **peer-to-peer**  
- Encryption is automatic via **DTLS**, built into your browser  

No plugins. No trackers. No “enterprise-grade” promises.  
Just the shortest possible path between two devices.


## Try It Locally

**Needs:** Bun

```bash
git clone https://github.com/Moq77111113/glisse.xyz.git
cd glisse.xyz
bun install
bun run dev
```

Open `http://localhost:5173` in two tabs. Pretend you have friends. Send something. Watch the magic.

## Production

```bash
bun run build
bun run start
```

A `Dockerfile` is included for people who feel safer when everything runs inside a box.

## MVP Status (Read This)

* **2 people per room** — minimalism, not a bug
* **No fancy error handling** — refresh fixes most things
* **Rooms live in memory** — server restart = collective amnesia
* **Large files** — theoretically unlimited; realistically limited by your patience

This is a tool.
Not a platform. Not a lifestyle.


## Tech Stack

* HTML + vanilla TypeScript
* TailwindCSS
* Bun + Hono (backend)
* Native WebRTC

No frameworks.
No global state.
No PhD required.


## Self-Hosting

### STUN Servers

By default, Glisse uses Google’s public STUN servers for WebRTC NAT traversal.
If you want to use your own, set the `STUN_SERVERS` environment variable:

```bash
# Single server
export STUN_SERVERS="stun:stun.yourdomain.com:3478"

# Multiple servers (comma-separated)
export STUN_SERVERS="stun:stun1.yourdomain.com:3478,stun:stun2.yourdomain.com:3478"
```

### Docker

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

### TURN Servers

For very restrictive networks (angry firewalls, paranoid NATs), TURN servers may be required.
They are **not implemented yet**.

STUN works fine in most cases (~80% of connections).
The other 20% are… special.

## What Glisse Is *Not*

* Not a cloud drive
* Not a collaboration suite
* Not a startup pitch deck
* Not trying to keep your data
* Not interested in your email address

It does one thing.
It does it fast.
Then it gets out of your way.


## License

MIT. Do whatever. Free as in freedom, free as in beer 🍺.
