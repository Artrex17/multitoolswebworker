// @ts-nocheck -- worker global scope (`self`, `postMessage`) conflicts with the project's DOM lib types.
import { convertImage } from '../lib/image';
import { rasterToSvg, svgToRaster } from '../lib/svg';

self.onmessage = async (event) => {
  const msg = event.data;
  try {
    let result;
    if (msg.type === 'convert') {
      const bitmap = await createImageBitmap(msg.file);
      result = await convertImage(bitmap, msg.format, msg.quality, msg.maxWidth, msg.maxHeight);
    } else if (msg.type === 'vectorize') {
      const bitmap = await createImageBitmap(msg.file);
      result = await rasterToSvg(bitmap, msg.preset, msg.removal);
    } else if (msg.type === 'rasterize') {
      result = await svgToRaster(msg.svgText, msg.mimeType);
    } else if (msg.type === 'samplePixel') {
      const bitmap = await createImageBitmap(msg.file);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const [r, g, b] = ctx.getImageData(msg.x, msg.y, 1, 1).data;
      result = { r, g, b };
    }
    self.postMessage({ id: msg.id, ok: true, result });
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
