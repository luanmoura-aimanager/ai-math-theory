// Plain <img> — next/image requires explicit width/height, which SVGs don't always have
export function Figure({
  src,
  caption,
  alt,
}: {
  src: string;
  caption: string;
  alt: string;
}) {
  return (
    <figure className="mdx-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="mdx-figure__img" />
      <figcaption className="mdx-figure__caption">{caption}</figcaption>
    </figure>
  );
}
