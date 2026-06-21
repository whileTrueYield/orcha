// Encryption-at-rest primitive for secrets Orcha must store reversibly — the
// first such primitive in the codebase. It exists because some secrets (e.g. a
// GitHub Repository link's webhook HMAC secret) must be recovered in full to be
// used, so hashing is not an option; they are encrypted instead.
//
// Public API:
//   - encryptSecret(plaintext): pack a UTF-8 string into an opaque base64 blob
//   - decryptSecret(blob): recover the plaintext, rejecting any tampered blob
//   - parseEncryptionKey(raw): validate/parse the 32-byte AES-256 key (exported
//     mainly so its failure modes are unit-testable)
//
// Built deliberately generic (not tied to GitHub) because the planned GitHub
// App phase will reuse it for installation tokens. See ADR 0011.

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { config } from "../config";

const KEY_LENGTH = 32; // AES-256
const IV_LENGTH = 12; // GCM standard nonce length
const TAG_LENGTH = 16; // GCM authentication tag length

// Leading byte of every blob. AES-GCM is fixed, but the version lets us evolve
// the format — notably to prefix a key version once key rotation lands (rotation
// itself is deferred; see ADR 0011).
const FORMAT_VERSION = 1;

// The key is supplied as base64 and must decode to exactly 32 bytes. We crash
// early and clearly rather than limp along with a malformed key, because a
// silently-wrong key would only surface as undecryptable data later.
export function parseEncryptionKey(raw: string | undefined): Buffer {
  if (!raw) {
    throw new Error(
      "ORCHA_ENCRYPTION_KEY env variable is undefined — a 32-byte base64 key is required for encryption at rest"
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `ORCHA_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (got ${key.length}); supply a 32-byte key as base64`
    );
  }

  return key;
}

// Parsed once, at module load, so a misconfigured key crashes the process at
// boot rather than at first encrypt/decrypt.
const activeKey = parseEncryptionKey(config.encryptionKey);

// Pack a plaintext secret into an opaque base64 blob laid out as
// [version:1][iv:12][authTag:16][ciphertext:N]. A fresh random IV per call means
// the same input never produces the same blob twice.
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", activeKey, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const blob = Buffer.concat([
    Buffer.from([FORMAT_VERSION]),
    iv,
    cipher.getAuthTag(),
    ciphertext,
  ]);
  return blob.toString("base64");
}

// Recover the plaintext, letting GCM's auth tag reject any tampered blob: a
// flipped byte makes `decipher.final()` throw rather than return corrupted data.
export function decryptSecret(blob: string): string {
  const bytes = Buffer.from(blob, "base64");

  const version = bytes[0];
  if (version !== FORMAT_VERSION) {
    throw new Error(
      `Unsupported encryption blob version ${version}; expected ${FORMAT_VERSION}`
    );
  }

  const iv = bytes.subarray(1, 1 + IV_LENGTH);
  const tag = bytes.subarray(1 + IV_LENGTH, 1 + IV_LENGTH + TAG_LENGTH);
  const ciphertext = bytes.subarray(1 + IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv("aes-256-gcm", activeKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8"
  );
}
