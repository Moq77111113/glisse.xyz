export function DropZone({ onDrop }: { onDrop: (file: File) => void }) {
    
  return (
    <div
      class="flex-1 min-h-125 border-2 border-dashed rounded-lg flex items-center justify-center"
      onDrop={(e: DragEvent) => {
        e.preventDefault()
        for ( const file of Array.from(e.dataTransfer?.files || []) ) {
          onDrop(file)
        }
        }}
      onDragOver={(e: Event) => e.preventDefault()}
    >
      <p>Drop files here</p>
    </div>
  )
}
