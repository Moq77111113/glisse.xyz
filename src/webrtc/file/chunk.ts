export async function* chunkFile(
  file: File,
  chunkSize: number
): AsyncGenerator<ArrayBuffer> {
  let offset = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + chunkSize);
    yield await slice.arrayBuffer();
    offset += chunkSize;
  }
}