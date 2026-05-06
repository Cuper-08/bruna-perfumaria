// Supabase Storage image helper.
// NOTE: on-the-fly transform (/storage/v1/render/image/public/) requires Supabase Pro plan
// and returns 403 on free plan. We currently pass the original URL through (it is already
// WebP at upload time). Helpers stay in place so we can flip the flag once on Pro.

const STORAGE_OBJECT_PATH = '/storage/v1/object/public/';
const STORAGE_RENDER_PATH = '/storage/v1/render/image/public/';

const TRANSFORM_ENABLED = false; // set to true when Supabase project is on Pro plan

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

export function optimizedImage(url: string | null | undefined, opts: ImageOptions = {}): string {
  if (!url) return '/placeholder.svg';
  if (!TRANSFORM_ENABLED || !url.includes(STORAGE_OBJECT_PATH)) return url;

  const transformed = url.replace(STORAGE_OBJECT_PATH, STORAGE_RENDER_PATH);
  const params = new URLSearchParams();
  if (opts.width) params.set('width', String(opts.width));
  if (opts.height) params.set('height', String(opts.height));
  params.set('quality', String(opts.quality ?? 70));
  if (opts.resize) params.set('resize', opts.resize);
  return `${transformed}?${params.toString()}`;
}

export function srcSet(url: string | null | undefined, baseWidth: number, opts: Omit<ImageOptions, 'width'> = {}): string {
  if (!TRANSFORM_ENABLED || !url || !url.includes(STORAGE_OBJECT_PATH)) return '';
  return [1, 2].map(d => `${optimizedImage(url, { ...opts, width: baseWidth * d })} ${d}x`).join(', ');
}
