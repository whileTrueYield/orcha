import { Field, Int, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Documentation } from "@generated/type-graphql";

@ObjectType()
export class PaginatedDocumentations extends PaginatedNodes {
  @Field(() => [Documentation])
  nodes: Documentation[];
}

@ObjectType()
export class MiniDocumentationPage {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  position: number;

  @Field(() => Int, { nullable: true })
  parentId: number | null;

  @Field()
  title: string;
}
