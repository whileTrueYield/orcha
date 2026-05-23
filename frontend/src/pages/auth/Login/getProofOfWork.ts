import { gql } from "@apollo/client";
import { GQLClient } from "utils/GQLClient";

export const getProofOfWork = (): Promise<[string, string]> =>
  new Promise(async (resolve) => {
    const results = await GQLClient.query<{ pof: string }>({
      query: GET_POW,
      fetchPolicy: "network-only",
    });

    if (results.data?.pof) {
      const proofWorker = new Worker("/pow.js");
      const hash = results.data.pof;

      proofWorker.postMessage(hash);

      proofWorker.onmessage = function (message) {
        const proof = message.data;
        resolve([proof, hash]);
        proofWorker.terminate();
      };
    }
  });

const GET_POW = gql`
  query getProofOfWork {
    pof
  }
`;
