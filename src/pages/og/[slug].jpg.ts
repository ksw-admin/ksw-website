// Link preview images (WhatsApp, Facebook, Signal, LinkedIn, X): 1200x630 JPEG, small enough for WhatsApp (< 300 KB).
// /og/default.jpg for normal pages, /og/<post slug>.jpg for every post with its own page and a photo.
import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { getPosts } from '../../lib/posts';
import { getHome, homeImage } from '../../lib/home';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
// Normal pages use the home page group photo (home.json › photo).
const DEFAULT_IMAGE = homeImage(getHome('de').photo).fsPath;

export const getStaticPaths = (async () => {
  const posts = (await getPosts('de')).filter((p) => p.hasPage && p.image);
  return [
    { params: { slug: 'default' }, props: { src: DEFAULT_IMAGE } },
    ...posts.map((p) => ({ params: { slug: p.slug }, props: { src: p.image!.fsPath } })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const file = props.src;
  // Whole photo, centred on a blurred, darkened copy of itself. Cropping cut off faces on tall group photos.
  const src = sharp(file).rotate(); // respect phone EXIF orientation
  const [background, photo] = await Promise.all([
    src.clone().resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).blur(28).modulate({ brightness: 0.55 }).toBuffer(),
    src.clone().resize(OG_WIDTH, OG_HEIGHT, { fit: 'inside' }).toBuffer(),
  ]);
  const jpg = await sharp(background)
    .composite([{ input: photo, gravity: 'centre' }])
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
