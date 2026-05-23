import { first, isArray, isString, map, trim, words } from "lodash";

export const copyToClipboard = (str: string) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.display = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

/**
 * Return the appropriate form of a given countable
 * noon based on it's quantity. It will also replace
 * any occurrence of `{}` in the provided form template
 * with its value.
 * @param singular Singular form template
 * @param plural Plural form template
 * @param {quantity} Quantity as an array or number
 * @param zero Optional zero items form template
 */
export const plural = (
  singular: string,
  plural: string,
  quantity?: number | any[],
  zero?: string
) => {
  let form = singular;

  if (isArray(quantity)) {
    quantity = quantity.length;
  }

  if (isNaN(quantity as any)) {
    return form.replace(/{}/g, "");
  }

  if (zero !== undefined && quantity === 0) {
    return zero.replace(/{}/g, quantity.toLocaleString());
  }

  return quantity === 1
    ? singular.replace(/{}/g, quantity.toLocaleString())
    : plural.replace(/{}/g, (quantity as number).toLocaleString());
};

export const isEmptyString = (value: any): boolean =>
  isString(value) ? trim(value).length === 0 : true;

/**
 * Map the IDs from a set of backend records and return
 * them as as set of numbers (using parseInt)
 * @param records A set of record with an id string attribute
 */
export function idsAsNumber(records: { id: number }[]): number[] {
  return map(records, (record) => record.id);
}

export function initials(sentence: string): string {
  return map(words(sentence), (word) => first(word)).join("");
}

export function removeEmptyStrings<T extends {}>(data: T): Partial<T> {
  const value: Partial<T> = {};

  for (const key in data) {
    if (!isEmptyString(data[key])) {
      value[key] = data[key];
    }
  }

  return value;
}

// https://developer.mozilla.org/en-US/docs/Web/API/btoa
// convert a Unicode string to a string in which
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

export const normalizeProjectPath = (path: string): string => {
  const pathFragment = path.split("/");
  return pathFragment
    .map(trim) // remove spaces "foo/ bar  /baz" => "foo/bar/baz"
    .filter((part) => part) // remove empty parts like "/foo/ /bar/"
    .join("/");
};

export const joinPath = (
  pathLeft: string | null | undefined,
  pathRight: string | null | undefined
): string => {
  const pathFragment: string[] = [];
  pathLeft = pathLeft || "";
  pathRight = pathRight || "";

  for (const pathPart of pathLeft.split("/")) {
    const normalizedPathPart = trim(pathPart);
    if (normalizedPathPart) {
      pathFragment.push(normalizedPathPart);
    }
  }

  for (const pathPart of pathRight.split("/")) {
    const normalizedPathPart = trim(pathPart);
    if (normalizedPathPart) {
      pathFragment.push(normalizedPathPart);
    }
  }

  return pathFragment.join("/");
};
