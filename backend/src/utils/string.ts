// https://developer.mozilla.org/en-US/docs/Web/API/btoa
// convert a Unicode string to a string in which

import { filter, trim, uniq } from "lodash";

// each 16-bit unit occupies only one byte
export function toBinary(content: string) {
  const codeUnits = new Uint16Array(content.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = content.charCodeAt(i);
  }
  const charCodes = new Uint8Array(codeUnits.buffer);
  let result = "";
  for (let i = 0; i < charCodes.byteLength; i++) {
    result += String.fromCharCode(charCodes[i]);
  }
  return result;
}

export function fromBinary(binary: string) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const charCodes = new Uint16Array(bytes.buffer);
  let result = "";
  for (let i = 0; i < charCodes.length; i++) {
    result += String.fromCharCode(charCodes[i]);
  }
  return result;
}

export function commaSeparatedValues(value?: string | null): string[] {
  if (value) {
    const strValues = value.split(",");
    return uniq(filter(strValues.map(trim)));
  }

  return [];
}
