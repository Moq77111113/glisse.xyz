function detectMobile(): boolean {
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints ?? 0) > 1
  );
}

function openFilePicker(onFiles: (files: FileList) => void): void {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.onchange = () => input.files && onFiles(input.files);
  input.click();
}

export function setupFilePicker(
  zone: Element,
  onFiles: (files: FileList) => void,
): void {
  const isMobile = detectMobile();

  const zoneParagraph = zone.querySelector("p");
  if (zoneParagraph) {
    zoneParagraph.textContent = isMobile
      ? "Tap to select files"
      : "Drop files or click to select";
  }

  zone.addEventListener("click", () => openFilePicker(onFiles));
  zone.addEventListener("touchend", (e) => {
    e.preventDefault();
    openFilePicker(onFiles);
  });

  if (!isMobile) {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("border-primary", "bg-primary/5");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("border-primary", "bg-primary/5");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("border-primary", "bg-primary/5");
      const dt = e as DragEvent;
      if (dt.dataTransfer?.files) onFiles(dt.dataTransfer.files);
    });
  }
}
