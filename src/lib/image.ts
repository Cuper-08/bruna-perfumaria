// Supabase Storage image transformation helper
// Converts /storage/v1/object/public/... → /storage/v1/render/image/public/... with resize + quality

const STORAGE_OBJECT_PATH = '/storage/v1/object/public/';
const STORAGE_RENDER_PATH = '/storage/v1/render/image/public/';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 20-100
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transform a Supabase Storage URL to use on-the-fly image resizing.
 * Returns the original URL untouched if it's not a Supabase Storage object URL.
 */
export function optimizedImage(url: string | null | undefined, opts: ImageOptions = {}): string {
  if (!url) return '/placeholder.svg';
  if (!url.includes(STORAGE_OBJECT_PATH)) return url;

  const transformed = url.replace(STORAGE_OBJECT_PATH, STORAGE_RENDER_PATH);
  const params = new URLSearchParams();
  if (opts.width) params.set('width', String(opts.width));
  if (opts.height) params.set('height', String(opts.height));
  params.set('quality', String(opts.quality ?? 70));
  if (opts.resize) params.set('resize', opts.resize);

  return `${transformed}?${params.toString()}`;
}

/**
 * Build a srcset string for responsive images at 1x, 2x, 3x density.
 */
export function srcSet(url: string | null | undefined, baseWidth: number, opts: Omit<ImageOptions, 'width'> = {}): string {
  if (!url || !url.includes(STORAGE_OBJECT_PATH)) return '';
  return [1, 2].map(d => `${optimizedImage(url, { ...opts, width: baseWidth * d })} ${d}x`).join(', ');
}
