import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Product, ModelStage as ModelStageEnum } from "@generated/type-graphql";
import { ModelStage } from "@prisma/client";

@ObjectType()
export class PaginatedProducts extends PaginatedNodes {
  @Field(() => [Product])
  nodes: Product[];
}

@ObjectType()
export class MiniProduct {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => ModelStageEnum)
  stage: ModelStage;
}
