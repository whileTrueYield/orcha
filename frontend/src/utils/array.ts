import { get } from "lodash";

export function withoutAt(array: any[], position: number) {
  if (position >= array.length) {
    return array;
  }

  const newArray = [...array];
  newArray.splice(position, 1);
  return newArray;
}

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
): T | undefined {
  const index = attribute ? indexOfBy(arr, item, attribute) : arr.indexOf(item);

  if (index > -1) {
    return arr[index + 1];
  }
}

/**
 * Find the element preceding the element provided
 * @param arr
 * @param item
 * @param idMethod
 */
export function beforeItem<T extends {}>(
  arr: T[],
  item: T,
  attribute?: keyof T
): T | undefined {
  const index = attribute ? indexOfBy(arr, item, attribute) : arr.indexOf(item);

  if (index > 0) {
    return arr[index - 1];
  }
}

/**
 * Return a new array where itemA and itemB positions are swapped
 *
 * @param arr Array containing the items to swap
 * @param itemA Item of array to be swapped
 * @param itemB Second item of array to be swapped
 * @returns
 */
export function swapItems<T>(arr: T[], itemA: T, itemB: T, key?: keyof T): T[] {
  const swappedArr: T[] = [];

  const isEqual = (itemA: T, itemB: T) => {
    if (key) {
      return itemA[key] === itemB[key];
    }

    return itemA === itemB;
  };

  for (const row of arr) {
    if (isEqual(row, itemA)) {
      swappedArr.push(itemB);
    } else if (isEqual(row, itemB)) {
      swappedArr.push(itemA);
    } else {
      swappedArr.push(row);
    }
  }

  return swappedArr;
}
