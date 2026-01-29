import type { GlisseStatusBadge } from "./status-badge/status-badge";
import type { GlisseMessage } from "./message/message";
import type { GlisseFileItem } from "./file-item/file-item";
import type { GlisseFilePicker } from "./file-picker/file-picker";
import type { GlisseChatInput } from "./chat-input/chat-input";
import type { GlisseMessageList } from "./message-list/message-list";
import type { GlisseFileList } from "./file-list/file-list";
import type { GlisseHeader } from "./header/header";
import type { GlisseFooter } from "./footer/footer";
import type { GlisseNoiseCanvas } from "./noise-canvas/noise-canvas";

declare global {
  interface HTMLElementTagNameMap {
    "glisse-status-badge": GlisseStatusBadge;
    "glisse-message": GlisseMessage;
    "glisse-file-item": GlisseFileItem;
    "glisse-file-picker": GlisseFilePicker;
    "glisse-chat-input": GlisseChatInput;
    "glisse-message-list": GlisseMessageList;
    "glisse-file-list": GlisseFileList;
    "glisse-header": GlisseHeader;
    "glisse-footer": GlisseFooter;
    "glisse-noise-canvas": GlisseNoiseCanvas;
  }

  interface HTMLElementEventMap {
    "glisse-files-selected": CustomEvent<{ files: FileList }>;
    "glisse-message-send": CustomEvent<{ text: string }>;
  }
}

export {};
