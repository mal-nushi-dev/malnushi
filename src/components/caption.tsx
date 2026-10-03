/**
 * Image caption: mono index in a fixed 48px column, text beside it.
 * Photo caption: index left, EXIF right. Pass only the EXIF fields the
 * photo has, in order (focal length, aperture, shutter, ISO).
 */
export function Caption({
  index,
  children,
  exif,
}: {
  index: string;
  children?: React.ReactNode;
  exif?: string[];
}) {
  if (exif) {
    return (
      <figcaption className="flex items-start justify-between">
        <span className="type-meta text-ink">{index}</span>
        <span className="flex gap-(--space-md) type-meta text-ink-2">
          {exif.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      </figcaption>
    );
  }
  return (
    <figcaption className="flex items-start">
      <span className="w-12 shrink-0 type-meta text-ink">{index}</span>
      <span className="max-w-150 type-small text-ink-2">{children}</span>
    </figcaption>
  );
}
