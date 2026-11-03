// Content images live next to their Markdown files (src/content/<collection>/.../images/) and the CMS writes
// "./images/<file>" into the front matter. This module turns that string into Astro image metadata, so pages
// get resized WebP versions via <Image>, and a reference to a missing file fails the build.
import type { ImageMetadata } from 'astro';
import path from 'node:path';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF}',
  { eager: true },
);

export type ContentImage = {
  /** For <Image src={...}>. */
  meta: ImageMetadata;
  /** Absolute file path (for sharp, e.g. link preview images). */
  fsPath: string;
};

/** Width for the <Image> fallback src: the largest wanted width, never wider than the original. */
export const capWidth = (meta: ImageMetadata, max: number) => Math.min(meta.width, max);

/**
 * Resolve an image reference from a content entry.
 * @param entryFile entry.filePath, e.g. "src/content/news/de/2026-05-31-gurtelprufung-2026.md"
 * @param ref the front matter value, e.g. "./images/img_4031.jpg"
 */
export function resolveImage(entryFile: string | undefined, ref: string | undefined): ContentImage | undefined {
  if (!ref || !entryFile || ref.includes('placeholder')) return undefined;
  if (ref.startsWith('/') || /^https?:/.test(ref)) {
    throw new Error(`${entryFile}: image "${ref}" must be a path next to the entry like ./images/photo.jpg (upload it via the CMS).`);
  }
  const key = path.posix.normalize('/' + path.posix.join(path.posix.dirname(entryFile.replaceAll('\\', '/')), ref));
  const mod = files[key] ?? files[key.normalize('NFC')] ?? files[key.normalize('NFD')];
  if (!mod) throw new Error(`${entryFile}: image "${ref}" not found (looked for ${key}).`);
  return { meta: mod.default, fsPath: path.join(process.cwd(), key) };
}
