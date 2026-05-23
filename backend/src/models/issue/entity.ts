import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Issue } from "@generated/type-graphql";

@ObjectType()
export class PaginatedIssues extends PaginatedNodes {
  @Field(() => [Issue])
  nodes: Issue[];
}

@ObjectType()
export class IssueContext {
  @Field(() => String, { nullable: true })
  deviceName?: string;

  @Field(() => String, { nullable: true })
  deviceType?: string;

  @Field(() => String, { nullable: true })
  os?: string;

  @Field(() => String, { nullable: true })
  osVersion?: string;

  @Field(() => String, { nullable: true })
  browser?: string;

  @Field(() => String, { nullable: true })
  engine?: string;
}
