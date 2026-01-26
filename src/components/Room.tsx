export function Room({ roomCode }: { roomCode: string }) {
  return (
    <div class="min-h-svh flex flex-col p-6 md:p-12">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <a href="/">
            <h1 className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              oop
            </h1>
          </a>
          <h1 class="font-mono text-2xl tracking-[0.3em] text-foreground">
            {roomCode}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="size-2 rounded-full bg-muted-foreground/30"
            data-status-indicator
          />
          <p
            class="font-mono text-xs text-muted-foreground/50 uppercase tracking-[0.15em]"
            data-status-text
          >
            Connecting...
          </p>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div class="space-y-4">
          <p class="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
            Text
          </p>
          <textarea
            data-text-area
            placeholder="Type or paste..."
            class="w-full h-64 lg:h-96 bg-transparent border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div class="space-y-4">
          <p class="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
            Files
          </p>
          <div
            data-drop-zone
            class="h-64 lg:h-96 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <p class="font-mono text-xs text-muted-foreground/50">
              Drop files or click to select
            </p>
          </div>
          <div data-file-list class="space-y-2" />
        </div>
      </div>
    </div>
  );
}
