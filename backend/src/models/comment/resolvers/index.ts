import { CreateCommentResolver } from "./createComment.resolver";
import { UpdateCommentResolver } from "./updateComment.resolver";
import { CommentReplyResolver } from "./commentReply.resolver";
import { CommentResolver } from "./comment.resolver";
import { CommentsResolver } from "./comments.resolver";
import { DeleteCommentResolver } from "./deleteComment.resolver";
import { CommentRepliesResolver } from "./commentReplies.resolver";

export default [
  CreateCommentResolver,
  UpdateCommentResolver,
  CommentResolver,
  CommentReplyResolver,
  CommentsResolver,
  DeleteCommentResolver,
  CommentRepliesResolver,
];
