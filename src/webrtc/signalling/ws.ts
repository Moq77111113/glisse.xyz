type WsConnectionArgs = {
  roomId: string;
  signallingServerUrl: string;
  protocol?: "ws" | "wss";
};
export function createWsConnection(args: WsConnectionArgs): WebSocket {
  const { roomId, signallingServerUrl, protocol = "wss" } = args;
  const url = new URL(signallingServerUrl);
  url.protocol = protocol;
  url.pathname = `/ws/${roomId}`;
  return new WebSocket(url);
}
