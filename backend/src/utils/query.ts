/**
 * Prisma query helpers for relation field operations.
 *
 * Exports: setToRecords, connectToRecords, BatchPayload.
 */

/**
 * Helper function to be used in a prisma query to associate
 * a relation field with a set of objects using their primary key
 *
 * ```
 * prisma.reportingQuery.create({
 *   data: {
 *     byProducts: setToRecords(products)
 *   }
 * });
 * ```
 */
export function setToRecords<A extends { id: number }>(objects: Array<A>) {
  return { set: objects.map(({ id }) => ({ id })) };
}

/**
 * Helper function to be used in a prisma query to associate
 * a relation field with a set of objects using their primary key
 *
 * ```
 * prisma.reportingQuery.create({
 *   data: {
 *     byProducts: connectToRecords(products)
 *   }
 * });
 * ```
 */
export function connectToRecords<A extends { id: number }>(objects: Array<A>) {
  if (objects.length) {
    return { connect: objects.map(({ id }) => ({ id })) };
  } else return {};
}

// TODO: BatchPayload was a TypeGraphQL @ObjectType. If needed as a Pothos
// output type, define it on the builder in schema/. For now it's a plain
// interface used by resolver return types.
export interface BatchPayload {
  count: number;
}
