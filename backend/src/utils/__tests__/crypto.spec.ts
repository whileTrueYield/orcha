import expect from "expect";
import { decryptSecret, encryptSecret, parseEncryptionKey } from "../crypto";

// A valid key is exactly 32 bytes (AES-256) supplied as base64.
const validKeyBase64 = Buffer.alloc(32, 7).toString("base64");

describe("parseEncryptionKey", () => {
  it("throws a clear error when the key is missing", () => {
    expect(() => parseEncryptionKey(undefined)).toThrow(/ORCHA_ENCRYPTION_KEY/);
  });

  it("throws a clear error when the key is empty", () => {
    expect(() => parseEncryptionKey("")).toThrow(/ORCHA_ENCRYPTION_KEY/);
  });

  it("throws when the key does not decode to 32 bytes", () => {
    const shortKey = Buffer.alloc(16, 7).toString("base64");
    expect(() => parseEncryptionKey(shortKey)).toThrow(/32 bytes/);
  });

  it("returns a 32-byte buffer for a valid base64 key", () => {
    const key = parseEncryptionKey(validKeyBase64);
    expect(Buffer.isBuffer(key)).toBe(true);
    expect(key.length).toBe(32);
  });
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a secret back to the original plaintext", () => {
    const secret = "gho_a-github-webhook-secret-with-ünicode-✓";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it("round-trips an empty string", () => {
    expect(decryptSecret(encryptSecret(""))).toBe("");
  });

  it("produces a different blob each call for the same input (random nonce)", () => {
    const secret = "same-input-every-time";
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret));
  });

  it("rejects a tampered blob rather than returning corrupted plaintext", () => {
    const blob = encryptSecret("authentic-secret");
    const bytes = Buffer.from(blob, "base64");
    // Flip a bit in the final byte (ciphertext) so the GCM auth tag no longer matches.
    bytes[bytes.length - 1] ^= 0x01;
    const tampered = bytes.toString("base64");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("rejects a blob with an unknown format version", () => {
    const bytes = Buffer.from(encryptSecret("secret"), "base64");
    bytes[0] = 0xff; // first byte is the format/version prefix
    expect(() => decryptSecret(bytes.toString("base64"))).toThrow(/version/i);
  });
});
