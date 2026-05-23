import { ClassType, Field, ObjectType, Int } from "type-graphql";

@ObjectType({ isAbstract: true })
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pageCount: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  endCursor: number;
}

// adds password property with validation to the base, extended class
export default function withPagination<TClassType extends ClassType>(
  BaseClass: TClassType
) {
  @ObjectType({ isAbstract: true })
  class PaginationTrait extends BaseClass {
    @Field(() => Int)
    totalCount: number;

    @Field(() => PageInfo)
    pageInfo: PageInfo;
  }

  return PaginationTrait;
}
