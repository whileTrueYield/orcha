import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Note } from "@generated/type-graphql";

@ObjectType()
export class PaginatedNotes extends PaginatedNodes {
  @Field(() => [Note])
  nodes: Note[];
}
