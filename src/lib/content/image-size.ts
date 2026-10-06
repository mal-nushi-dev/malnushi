/*
 * The pixel size of a JPEG, read from its frame header. The loader records
 * it on the photograph, so anything that shows or lists one knows its
 * proportions without opening the file.
 */

/** In the frame range (0xC0 to 0xCF) but not frames: tables and a reserved code. */
const notFrames = [0xc4, 0xc8, 0xcc];

export function jpegSize(file: Uint8Array): { width: number; height: number } | undefined {
  if (file[0] !== 0xff || file[1] !== 0xd8) return undefined;
  // Step from segment to segment by each one's length. Searching for the
  // bytes instead would find the frame of a thumbnail inside the EXIF block.
  let at = 2;
  while (at + 4 <= file.length) {
    if (file[at] !== 0xff) return undefined;
    const marker = file[at + 1];
    if (marker === 0xff) {
      // Padding before a marker.
      at += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      // Markers that stand alone, with no length.
      at += 2;
      continue;
    }
    // The image data or the end, with no frame before it.
    if (marker === 0xda || marker === 0xd9) return undefined;
    const length = (file[at + 2] << 8) | file[at + 3];
    if (length < 2) return undefined;
    // Baseline (0xC0), progressive (0xC2) and the rarer encodings alike.
    if (marker >= 0xc0 && marker <= 0xcf && !notFrames.includes(marker)) {
      if (at + 9 > file.length) return undefined;
      const height = (file[at + 5] << 8) | file[at + 6];
      const width = (file[at + 7] << 8) | file[at + 8];
      return width > 0 && height > 0 ? { width, height } : undefined;
    }
    at += 2 + length;
  }
  return undefined;
}
