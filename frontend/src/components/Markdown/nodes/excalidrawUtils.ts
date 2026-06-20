/**
 * Helpers for the Excalidraw embed (ported from the old Tiptap Drawing
 * extension; see issue #42).
 *
 * Public API:
 *   - urltoDataUrl(url): fetch an image URL and wrap it as an Excalidraw
 *     BinaryFileData (drawings store image files as CDN URLs, but the canvas
 *     needs them as data URLs)
 *   - resolvablePromise(): a promise that exposes its own resolve/reject —
 *     Excalidraw accepts a promise as `initialData`, and the scene is only
 *     ready once its images have been fetched
 */
import { BinaryFileData } from "@excalidraw/excalidraw/types";

const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/x-icon",
];

export async function urltoDataUrl(
  url: string,
): Promise<BinaryFileData | null> {
  try {
    const response = await fetch(url);
    const imageData = await response.blob();
    const mimeType = response.headers.get("Content-Type");

    if (mimeType && IMAGE_MIME_TYPES.indexOf(mimeType.toLowerCase()) > -1) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageData);
        reader.onload = function () {
          resolve({
            id: url as BinaryFileData["id"],
            dataURL: reader.result as BinaryFileData["dataURL"],
            created: 1644915140367,
            lastRetrieved: 1644915140367,
            // mimetype is safe: it matched IMAGE_MIME_TYPES above
            mimeType: mimeType.toLowerCase() as BinaryFileData["mimeType"],
          });
        };
      });
    }
  } catch {
    console.warn("urltoDataUrl(): could not load image", url);
  }

  return null;
}

export type ResolvablePromise<T> = Promise<T> & {
  resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
  reject: (error: Error) => void;
};

export const resolvablePromise = <T>() => {
  let resolve!: any;
  let reject!: any;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  (promise as any).resolve = resolve;
  (promise as any).reject = reject;
  return promise as ResolvablePromise<T>;
};
