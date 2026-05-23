import { BinaryFileData } from "@excalidraw/excalidraw/types/types";

const ImageTypes = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/x-icon",
];

export async function urltoDataUrl(
  url: string
): Promise<BinaryFileData | null> {
  try {
    const response = await fetch(url);
    const imageData = await response.blob();
    const mimeType = response.headers.get("Content-Type");

    if (mimeType && ImageTypes.indexOf(mimeType.toLowerCase()) > -1) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageData);
        reader.onload = function () {
          resolve({
            id: url as BinaryFileData["id"],
            dataURL: reader.result as BinaryFileData["dataURL"],
            created: 1644915140367,
            lastRetrieved: 1644915140367,
            // mimetype should be good if it matches ImageTypes above
            mimeType: mimeType.toLowerCase() as any,
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
