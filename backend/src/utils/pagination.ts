import { InputType, Field, ObjectType, Int } from "type-graphql";

@ObjectType({ isAbstract: true })
export class PageInfo {
  @Field((_type) => Boolean)
  hasNextPage: boolean;

  @Field((_type) => Boolean)
  hasPreviousPage: boolean;

  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pageCount: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int, { nullable: true })
  endCursor: number | null;
}

@ObjectType({ isAbstract: true })
export class PaginatedNodes {
  @Field(() => Int)
  totalCount: number;

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@InputType()
export class FilterOption {
  @Field({ nullable: true })
  first?: number;

  @Field({ nullable: true })
  last?: number;

  @Field({ nullable: true })
  offset?: number;
}

// const MinItemPerPage = 1;
// const DefaultItemPerPage = 10;
// const MaxItemPerPage = 50;

interface PaginateNodeArgs<T> {
  pageSize: number;
  offset: number;
  nodes: T[];
  count: number;
}

export const paginateNodes = <T extends { id: number }>(
  args: PaginateNodeArgs<T>
) => {
  const { pageSize, offset, nodes, count } = args;

  const hasNextPage = nodes.length == pageSize;
  const hasPreviousPage = offset > 0;
  return {
    nodes,
    totalCount: count,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      pageNumber: Math.floor(offset / pageSize),
      pageSize: pageSize,
      pageCount: Math.ceil(count / pageSize),
      endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : null,
    },
  };
};

// Commonly used arguments for get pages found
// in repository. This is defined here because it
// is expected to define the interface of all the
// get many API (get questions, get comments....)
// and should remain constant and familiar
// across the board
export interface GetPageArgsFor<T> {
  first?: number;
  last?: number;
  offset?: number;
  sort?: keyof T;
  search?: string;
  cursor?: number;
}
