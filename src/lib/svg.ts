import ImageTracer from 'imagetracerjs';

export type VectorizePreset = 'detailed' | 'smoothed' | 'sharp' | 'posterized2' | 'grayscale';

/** Vectorizes a raster image into an SVG string, using one of imagetracerjs's built-in tracing presets. Browser-only (needs canvas to read pixel data). */
export async function rasterToSvg(bitmap: ImageBitmap, preset: VectorizePreset = 'detailed'): Promise<string> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return ImageTracer.imagedataToSVG(imageData, preset);
}

/** Rasterizes an SVG string to a PNG/JPEG blob. Browser-only (needs Image + canvas). */
export async function svgToRaster(svgText: string, mimeType: 'image/png' | 'image/jpeg'): Promise<Blob> {
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Invalid SVG'));
    });
    img.src = url;
    await loaded;

    const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.drawImage(img, 0, 0);
    return canvas.convertToBlob({ type: mimeType });
  } finally {
    URL.revokeObjectURL(url);
  }
}
