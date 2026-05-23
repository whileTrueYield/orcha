export const getProofOfWork = (): Promise<[string, string]> =>
  new Promise(async (resolve) => {
    const response = await fetch(import.meta.env.VITE_API_URI + "/pow", {
      method: "GET",
    });
    const { hash } = (await response.json()) as { hash: string };

    if (hash) {
      const proofWorker = new Worker("/pow.js");
      proofWorker.postMessage(hash);
      proofWorker.onmessage = function (message) {
        const proof = message.data;
        resolve([proof, hash]);
        proofWorker.terminate();
      };
    }
  });
