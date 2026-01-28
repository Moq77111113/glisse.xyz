type Role = "initiator" | "responder";

export interface SignallingContext {
  pc: RTCPeerConnection;
  ws: WebSocket;
  role: Role;
  dataChannel?: RTCDataChannel;
  createPc: () => Promise<RTCPeerConnection>;
}
