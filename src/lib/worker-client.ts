import type { ImageFormat } from './image';
import type { ColorRemoval, RgbColor, VectorizePreset } from './svg';

interface WorkerResponse {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** Talks to a single dedicated Worker that does all the heavy image/vectorize/rasterize work off the main thread. */
export function createImageWorkerClient() {
  const worker = new Worker(new URL('../workers/image-worker.ts', import.meta.url), { type: 'module' });
  let nextId = 0;
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, ok, result, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (ok) entry.resolve(result);
    else entry.reject(new Error(error));
  };

  function call<T>(message: Record<string, unknown>): Promise<T> {
    const id = nextId++;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      worker.postMessage({ id, ...message });
    });
  }

  return {
    convert: (file: File, format: ImageFormat, quality: number, maxWidth?: number, maxHeight?: number) =>
      call<Blob>({ type: 'convert', file, format, quality, maxWidth, maxHeight }),
    vectorize: (file: File, preset: VectorizePreset, removal?: ColorRemoval) =>
      call<string>({ type: 'vectorize', file, preset, removal }),
    rasterize: (svgText: string, mimeType: 'image/png' | 'image/jpeg') =>
      call<Blob>({ type: 'rasterize', svgText, mimeType }),
    samplePixel: (file: File, x: number, y: number) => call<RgbColor>({ type: 'samplePixel', file, x, y }),
    terminate: () => worker.terminate(),
  };
}
