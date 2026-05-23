import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Notification } from "@generated/type-graphql";

@ObjectType()
export class PaginatedNotifications extends PaginatedNodes {
  @Field(() => [Notification])
  nodes: Notification[];
}
