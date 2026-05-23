import { Field, Int, ObjectType } from "type-graphql";

/**
 *
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
export function setToRecords<A extends { id: number }>(objects: Array<A>) {
  return { set: objects.map(({ id }) => ({ id })) };
}

/**
 *
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

@ObjectType()
export class BatchPayload {
  @Field((_type) => Int)
  count: number;
}
