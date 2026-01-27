export type FileMeta = { id: string; name: string; size: number; blob: Blob };
export type FileInfo = { id: string; name: string; size: number };
export type MessageHandler = (text: string) => void;
export type FileStartHandler = (info: FileInfo) => void;
export type FileProgressHandler = (fileId: string, percent: number) => void;
export type FileCompleteHandler = (fileId: string) => void;
export type FileReceivedHandler = (meta: FileMeta) => void;
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";
export type ConnectionStateHandler = (state: ConnectionState) => void;

function createEventBus<T extends (...args: never[]) => void>() {
  const listeners = new Set<T>()

  return {
    subscribe(handler: T): () => void {
      listeners.add(handler)
      return () => listeners.delete(handler)
    },
    emit(...args: Parameters<T>) {
      listeners.forEach((handler) => handler(...args))
    },
    clear() {
      listeners.clear()
    },
  }
}

export const messageBus = createEventBus<MessageHandler>();
export const fileSendStartBus = createEventBus<FileStartHandler>();
export const fileSendCompleteBus = createEventBus<FileCompleteHandler>();
export const fileReceiveStartBus = createEventBus<FileStartHandler>();
export const fileProgressBus = createEventBus<FileProgressHandler>();
export const fileReceivedBus = createEventBus<FileReceivedHandler>();
export const connectionStateBus = createEventBus<ConnectionStateHandler>();

export function clearAllListeners() {
  messageBus.clear();
  fileSendStartBus.clear();
  fileSendCompleteBus.clear();
  fileReceiveStartBus.clear();
  fileProgressBus.clear();
  fileReceivedBus.clear();
  connectionStateBus.clear();
}
