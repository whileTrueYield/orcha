import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Todo } from "@generated/type-graphql";

@ObjectType()
export class PaginatedTodos extends PaginatedNodes {
  @Field(() => [Todo])
  nodes: Todo[];
}
