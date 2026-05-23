import { Field, ObjectType, ID } from "type-graphql";

@ObjectType()
export class SearchResult {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  meta: string;
}
