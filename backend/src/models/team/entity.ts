import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Team } from "@generated/type-graphql";

@ObjectType()
export class PaginatedTeams extends PaginatedNodes {
  @Field(() => [Team])
  nodes: Team[];
}
