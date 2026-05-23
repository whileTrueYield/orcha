import { reduce, isArray, trim, filter } from "lodash";

function encode(key: string, value: string): string {
  key = trim(key);
  value = trim(value);

  if (key && value) {
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  return "";
}

/**
 * Transform a JSON into URL Query string parameters. This method supports
 * strings and array of string. If given other values, the toString()
 * will be used on the element.
 * @param obj
 */
export function JSONToQuery(obj: {}) {
  if (obj) {
    const params = reduce(
      obj,
      (acc, value: any, key: string) => {
        if (isArray(value)) {
          for (const v of value) {
            acc.push(encode(key, v.toString()));
          }
        } else if (value) {
          acc.push(encode(key, value.toString()));
        }
        return acc;
      },
      [] as string[]
    );
    return filter(params).join("&");
  } else {
    return "";
  }
}

interface ParsedQuery {
  [key: string]: string[];
}

export function parseQuery(search: string): ParsedQuery {
  const hashes = search.slice(search.indexOf("?") + 1).split("&");
  const parsedQuery: ParsedQuery = {};

  for (const hash of hashes) {
    let [key, value] = hash.split("=");
    key = decodeURIComponent(key);
    value = decodeURIComponent(value);

    parsedQuery[key] = [...(parsedQuery[key] || []), value];
  }

  return parsedQuery;
}

/**
 * Return all the values in the URL for a given key as an array of string
 * @param search the URL string
 * @param key the attribute name
 * @param defaultValue an optional default value if we don't find a match
 */
export function getManyFromQuery(
  search: string,
  key: string,
  defaultValue: string[] = []
): string[] | void {
  const parsedQuery = parseQuery(search);
  return key in parsedQuery ? parsedQuery[key] : defaultValue;
}

export function getFirstFromQuery(
  search: string,
  key: string
): string | undefined;
export function getFirstFromQuery<T extends string>(
  search: string,
  key: string,
  defaultValue: T
): T;

/**
 * Return the first value for a given key in the URL
 * @param search the URL string
 * @param key the attribute name
 * @param defaultValue an optional default value if we don't find a match
 */
export function getFirstFromQuery(
  search: string,
  key: string,
  defaultValue?: string
) {
  const parsedQuery = parseQuery(search);
  if (key in parsedQuery) {
    return parsedQuery[key][0];
  }

  return defaultValue;
}
