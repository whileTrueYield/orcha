import { find, findIndex, without } from "lodash";

interface ProjectBase {
  id: number;
  parentId?: number | null;
}

/**
 * Returns a goal array where every children come just after its parent
 *
 * This is a recursive function that iterates over the goals and
 * pulls a goal out of pool each time it find it's parent
 * or if it's an orphan
 * @param goals
 * @param acc
 * @returns
 */
export function sortProjectsByAncestry<T extends ProjectBase>(
  goals?: T[],
  acc: T[] = []
): T[] {
  if (!goals || goals.length === 0) {
    return acc;
  }

  for (const goal of goals) {
    // indexOf will return -1 when a element cannot be find,
    // so if the goal does not have a parentId attr, we set
    // the parentIndex to -1 (not found)
    const parentIndex = goal.parentId
      ? findIndex(acc, (cursor) => cursor.id === goal.parentId)
      : -1;

    if (parentIndex > -1) {
      // if we have the parent goal present in the accumulator, we
      // can insert the goal right after it
      acc.splice(parentIndex + 1, 0, goal);
      return sortProjectsByAncestry(without(goals, goal), acc);
    } else if (!find(goals, { id: goal.parentId })) {
      // we proceed to insert at the root any goal without
      // a parent. A goal can have a parentId but not have a parent
      // in this context because the parent isn't part of the dataset
      // .ie:
      // you start at project B, which has C and D children
      // because you start at project B, project A is not part of the
      // dataset, even tho project B parentId points to project A ID
      return sortProjectsByAncestry(without(goals, goal), [...acc, goal]);
    }
  }

  return acc;
}
