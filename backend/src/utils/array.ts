import { get } from "lodash";

export function indexOfBy<T extends {}>(
  arr: T[],
  item: T,
  attribute: keyof T
): number {
  for (let pos = 0; pos < arr.length; pos++) {
    if (get(arr[pos], attribute) === get(item, attribute)) {
      return pos;
    }
  }
  return -1;
}

/**
 * Find the element following the element provided
 * @param arr
 * @param item
 * @param idMethod
 */
export function afterItem<T extends {}>(
  arr: T[],
  item: T,
  attribute?: keyof T
): T | void {
  const index = attribute ? indexOfBy(arr, item, attribute) : arr.indexOf(item);

  if (index > -1) {
    return arr[index + 1];
  }
}
