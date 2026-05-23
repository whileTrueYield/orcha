import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Skill } from "@generated/type-graphql";

@ObjectType()
export class PaginatedSkills extends PaginatedNodes {
  @Field(() => [Skill])
  nodes: Skill[];
}
