const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
];

function parseStunServers(env: string | undefined): string[] {
  if (!env) return DEFAULT_STUN_SERVERS;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

export const config = {
  stunServers: parseStunServers(process.env.STUN_SERVERS),
};
