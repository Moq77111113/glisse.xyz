import { DurableObject } from "cloudflare:workers";

interface Env {
  ROOM: DurableObjectNamespace;
}

export class Room extends DurableObject {
  private peers: Map<WebSocket, { id: string }> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    this.ctx.blockConcurrencyWhile(async () => {});
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");

    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    if (this.peers.size >= 2) {
      return new Response("Room is full", { status: 409 });
    }

    const { 0: client, 1: server } = new WebSocketPair();

    this.ctx.acceptWebSocket(server);

    const peerId = crypto.randomUUID();
    this.peers.set(server, { id: peerId });

    this.broadcastToPeers(
      {
        type: "peer-joined",
        peerId,
      },
      server,
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = typeof message === "string" ? JSON.parse(message) : null;

      if (!data) {
        console.error("Received non-JSON message");
        return;
      }

      this.broadcastToPeers(data, ws);
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    const peer = this.peers.get(ws);

    if (peer) {
      this.peers.delete(ws);

      this.broadcastToPeers(
        {
          type: "peer-left",
          peerId: peer.id,
        },
        ws,
      );
    }
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket error:", error);

    const peer = this.peers.get(ws);
    if (peer) {
      this.peers.delete(ws);
    }
  }

  private broadcastToPeers(message: any, excludeWs?: WebSocket) {
    const messageStr = JSON.stringify(message);

    for (const [peerWs] of this.peers) {
      if (peerWs !== excludeWs) {
        try {
          peerWs.send(messageStr);
        } catch (error) {
          console.error("Error sending to peer:", error);
        }
      }
    }
  }
}
