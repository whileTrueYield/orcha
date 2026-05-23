import { Field, Int, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Tag, PersonalTag } from "@generated/type-graphql";

@ObjectType()
export class PaginatedTags extends PaginatedNodes {
  @Field(() => [Tag])
  nodes: Tag[];
}

@ObjectType()
export class PaginatedPersonalTags extends PaginatedNodes {
  @Field(() => [PersonalTag])
  nodes: PersonalTag[];
}

@ObjectType()
export class MiniTag {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  color: string;
}
