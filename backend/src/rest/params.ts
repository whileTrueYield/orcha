/**
 * Query-string coercion helpers for the REST routes.
 *
 * Express (via `qs`) parses a query string into a loose `ParsedQs` where a
 * value is `string | string[] | ParsedQs | undefined` depending on how many
 * times a key appeared. These helpers normalise that into the predictable
 * scalars and arrays the GraphQL operation variables expect — so a route reads
 * `intParam(req.query.project)` and gets `number | undefined`, never a surprise
 * array or nested object.
 *
 * Returning `undefined` for absent/blank values matters: GraphQL treats an
 * omitted variable as "no filter", which is exactly what we want.
 *
 * Exports: stringParam, intParam, stringList, intList.
 */

import { ParsedQs } from "qs";

type QueryValue = ParsedQs[string];

export function stringParam(value: QueryValue): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return undefined;
}

export function intParam(value: QueryValue): number | undefined {
  const str = stringParam(value);
  if (str === undefined) {
    return undefined;
  }
  const parsed = parseInt(str, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Normalise a repeatable param (`?stage=A&stage=B` → ["A","B"], `?stage=A` →
// ["A"]) into a string array, or undefined when absent.
export function stringList(value: QueryValue): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value : [value];
  const strings = raw.filter((v): v is string => typeof v === "string");
  return strings.length > 0 ? strings : undefined;
}

export function intList(value: QueryValue): number[] | undefined {
  const strings = stringList(value);
  if (strings === undefined) {
    return undefined;
  }
  const ints = strings
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
  return ints.length > 0 ? ints : undefined;
}
