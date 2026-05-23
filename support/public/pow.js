async function computeProofOfWork(hash, difficulty) {
  let count = 0;
  const requirement = "0".repeat(difficulty);

  while (true) {
    const solution = await sha256(hash + count);

    if (solution.startsWith(requirement)) {
      return count.toString();
    } else {
      count += 1;
    }
  }
}

onmessage = async function (e) {
  const [hash, difficulty] = e.data.split(":");
  const proof = await computeProofOfWork(hash, parseInt(difficulty));
  postMessage(proof);
};

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
