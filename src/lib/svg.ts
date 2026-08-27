import ImageTracer from 'imagetracerjs';
import { calculateDimensions } from './image';

export type VectorizePreset = 'detailed' | 'smoothed' | 'sharp' | 'posterized2' | 'grayscale';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorRemoval {
  color: RgbColor;
  tolerance: number;
}

/** Caps the working resolution so a large photo doesn't turn into tens of thousands of SVG paths. */
const MAX_TRACE_DIMENSION = 1200;

/** Preset overrides (adapted from imagetracerjs's own presets, with 'detailed' tamed from pathomit:0
 * so real photos don't explode into an unusable number of tiny paths), plus a shared viewBox so the
 * output is a proper scalable vector matching the source's proportions instead of a pixel-locked one. */
const PRESET_OPTIONS: Record<VectorizePreset, Record<string, unknown>> = {
  detailed: { pathomit: 4, roundcoords: 2, ltres: 0.5, qtres: 0.5, numberofcolors: 64 },
  smoothed: { blurradius: 5, blurdelta: 64 },
  sharp: { qtres: 0.01, linefilter: false },
  posterized2: { numberofcolors: 4, blurradius: 5 },
  grayscale: { colorsampling: 0, colorquantcycles: 1, numberofcolors: 7 },
};

/** Makes pixels close to `target` transparent, with a feathered edge instead of a hard cutoff. Mutates `data` in place. */
export function removeColor(data: Uint8ClampedArray, target: RgbColor, tolerance: number): void {
  const feather = Math.max(tolerance * 0.5, 1);
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - target.r;
    const dg = data[i + 1] - target.g;
    const db = data[i + 2] - target.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    if (distance <= tolerance) {
      data[i + 3] = 0;
    } else if (distance <= tolerance + feather) {
      data[i + 3] = Math.round(data[i + 3] * ((distance - tolerance) / feather));
    }
  }
}

/** Vectorizes a raster image into an SVG string, using one of imagetracerjs's built-in tracing presets,
 * with an optional color to cut out (e.g. a white background). Browser-only (needs canvas to read pixel data). */
export async function rasterToSvg(
  bitmap: ImageBitmap,
  preset: VectorizePreset = 'detailed',
  removal?: ColorRemoval
): Promise<string> {
  const { width, height } = calculateDimensions(bitmap.width, bitmap.height, MAX_TRACE_DIMENSION, MAX_TRACE_DIMENSION);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  ctx.drawImage(bitmap, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  if (removal) removeColor(imageData.data, removal.color, removal.tolerance);
  return ImageTracer.imagedataToSVG(imageData, { ...PRESET_OPTIONS[preset], viewbox: true });
}

/** Rasterizes an SVG string to a PNG/JPEG blob. Works on the main thread or in a Worker (no DOM Image needed). */
export async function svgToRaster(svgText: string, mimeType: 'image/png' | 'image/jpeg'): Promise<Blob> {
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
  const bitmap = await createImageBitmap(svgBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: mimeType });
}
