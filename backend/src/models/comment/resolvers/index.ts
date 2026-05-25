/**
 * Side-effect barrel for Comment resolvers.
 *
 * Importing this module registers all Comment and CommentReply query
 * and mutation fields on the Pothos builder. No exports — purely
 * side-effect imports.
 */

import "./comment.resolver";
import "./commentReply.resolver";
import "./commentReplies.resolver";
import "./comments.resolver";
import "./createComment.resolver";
import "./updateComment.resolver";
import "./deleteComment.resolver";
