type WebSocketLike = {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  readyState: number;
};

const WS_OPEN = 1;

type PeerId = string;
type RoomCode = string;

interface Peer<T extends WebSocketLike> {
  id: PeerId;
  socket: T;
}

interface Room<T extends WebSocketLike> {
  peers: Map<PeerId, Peer<T>>;
  maxPeers: number;
}

type RoomEvent =
  | { type: "peer-joined"; peerId: PeerId }
  | { type: "peer-left"; peerId: PeerId }
  | { type: "signal"; payload: unknown };

function createRoomManager<T extends WebSocketLike>() {
  const rooms = new Map<RoomCode, Room<T>>();

  function getOrCreateRoom(roomCode: RoomCode): Room<T> {
    let room = rooms.get(roomCode);

    if (!room) {
      room = {
        peers: new Map(),
        maxPeers: 2,
      };
      rooms.set(roomCode, room);
    }

    return room;
  }

  function broadcast(
    room: Room<T>,
    message: RoomEvent,
    excludePeerId?: PeerId,
  ) {
    const serialized = JSON.stringify(message);

    for (const [peerId, peer] of room.peers) {
      if (peerId === excludePeerId) continue;
      if (peer.socket.readyState !== WS_OPEN) continue;

      try {
        peer.socket.send(serialized);
      } catch (err) {
        console.error("Broadcast error:", err);
      }
    }
  }

  function addPeer(
    roomCode: RoomCode,
    socket: T,
  ): { ok: true; peerId: PeerId } | { ok: false; error: string } {
    const room = getOrCreateRoom(roomCode);

    if (room.peers.size >= room.maxPeers) {
      return { ok: false, error: "Room is full" };
    }

    const peerId = crypto.randomUUID();
    room.peers.set(peerId, { id: peerId, socket });

    broadcast(room, { type: "peer-joined", peerId }, peerId);

    return { ok: true, peerId };
  }

  function removePeer(roomCode: RoomCode, peerId: PeerId) {
    const room = rooms.get(roomCode);
    if (!room) return;

    if (!room.peers.delete(peerId)) return;

    broadcast(room, { type: "peer-left", peerId });

    if (room.peers.size === 0) {
      rooms.delete(roomCode);
    }
  }

  function handleMessage(roomCode: RoomCode, fromPeerId: PeerId, raw: string) {
    const room = rooms.get(roomCode);
    if (!room) return;

    let payload: unknown;

    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }

    broadcast(
      room,
      {
        type: "signal",
        payload,
      },
      fromPeerId,
    );
  }

  return {
    addPeer,
    removePeer,
    handleMessage,
  };
}

export const roomManager = createRoomManager<WebSocketLike>();
