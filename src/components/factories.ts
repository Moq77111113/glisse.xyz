import type { FileInfo } from "~/webrtc";
import type {
  FileDirection,
  FileItemState,
  GlisseFileItem,
} from "./file-item/file-item";
import type { GlisseMessage, MessageType } from "./message/message";

export function createMessage(type: MessageType, text: string): GlisseMessage {
  const element = document.createElement("glisse-message");
  element.setAttribute("type", type);
  element.setAttribute("text", text);
  return element;
}

function createFileItem(
  fileId: string,
  name: string,
  size: number,
  direction: FileDirection,
  state: FileItemState = "active",
  progress: number = 0,
): GlisseFileItem {
  const element = document.createElement("glisse-file-item");
  element.setAttribute("file-id", fileId);
  element.setAttribute("name", name);
  element.setAttribute("size", size.toString());
  element.setAttribute("direction", direction);
  element.setAttribute("state", state);
  element.setAttribute("progress", progress.toString());
  return element;
}

export function createPendingFileItem(file: File): GlisseFileItem {
  return createFileItem("pending", file.name, file.size, "send", "pending", 0);
}

export function createActiveFileItem(
  info: FileInfo,
  direction: FileDirection,
): GlisseFileItem {
  return createFileItem(info.id, info.name, info.size, direction, "active", 0);
}
