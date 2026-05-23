import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { Comment, CommentReply } from "@generated/type-graphql";

@ObjectType()
export class PaginatedComments extends PaginatedNodes {
  @Field(() => [Comment])
  nodes: Comment[];
}

@ObjectType()
export class PaginatedCommentReplies extends PaginatedNodes {
  @Field(() => [CommentReply])
  nodes: CommentReply[];
}
