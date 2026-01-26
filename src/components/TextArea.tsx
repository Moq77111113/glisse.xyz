export function TextArea({ onSend }: { onSend: (text: string) => void }) {
  return (
    <textarea
      class="flex-1 min-h-125 bg-card border border-border rounded-lg p-4 text-foreground resize-none"
      placeholder="Type here..."
      onInput={(e) => onSend((e.target as HTMLTextAreaElement).value)}
    />
  )
}
