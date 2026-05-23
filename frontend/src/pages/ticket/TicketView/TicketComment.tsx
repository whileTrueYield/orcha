import { useMemo, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { CommentReplyFormModule } from "components/Comment/CommentReplyForm";
import { CommentModule } from "components/Comment/CommentModule";
import { find, map, sortBy, uniqBy } from "lodash";
import { FCWithFragments } from "types";
import {
  MutationAcceptReplyArgs,
  MutationDeleteCommentArgs,
  MutationDeleteReplyArgs,
  MutationUpdateCommentArgs,
  MutationUpdateReplyArgs,
  Comment,
  CommentReply,
  Role,
  QueryRepliesArgs,
  NotificationTarget,
} from "types/graphql";
import { CommentReplyModule } from "components/Comment/CommentReplyModule";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { plural } from "utils/string";
import { useBlockingMutation } from "utils/graphql";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { useNotificationUrl } from "components/taskManager/hooks";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { Avatar } from "components/views/Avatar";

interface Props {
  comment: Comment;
  currentRole: Role;
  ticketId: number;
  onDelete?: () => void;
}

export const TicketComment: FCWithFragments<Props> = (props) => {
  const { comment, currentRole } = props;
  const [allReplies, setAllReplies] = useState<CommentReply[]>([]);

  const notificationUrl = useNotificationUrl();
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<null | number>(null);
  const [showDeleteComment, setShowDeleteComment] = useState(false);
  const currentAuthor = {
    name: currentRole.name,
    avatarUrl: currentRole.avatarUrl!,
    title: currentRole.title,
  };

  const replies = sortBy(
    uniqBy([...allReplies, ...comment.replies], "id"),
    "id"
  );

  // if the current view displays a notification (using the notification URL)
  // we'll store the Reply ID on highlightReplyId
  const highlightReply = useMemo(
    () =>
      notificationUrl &&
      notificationUrl.target === NotificationTarget.Reply &&
      !!find(replies, { id: notificationUrl.targetId }),
    [notificationUrl, replies]
  );

  const [getAllReplies] = useLazyQuery<
    QueryReturnValue["replies"],
    QueryRepliesArgs
  >(QUERY_GET_ALL_REPLIES);

  const [deleteReply] = useBlockingMutation<
    MutationReturnValue["deleteReply"],
    MutationDeleteReplyArgs
  >(MUTATE_DELETE_REPLY, {
    onError: onGraphQLError({ title: "Could not delete reply" }),
    onCompleted: onMutationComplete({
      title: "Reply Deleted",
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      cache.evict({
        id: `CommentReply:${data.deleteReply}`,
      });
    },
  });

  const [updateReply] = useBlockingMutation<
    { updateReply: Comment },
    MutationUpdateReplyArgs
  >(MUTATE_UPDATE_REPLY, {
    onError: onGraphQLError({ title: "Could not update reply" }),
    onCompleted: onMutationComplete({
      title: "Reply Updated",
    }),
  });

  const [acceptReply] = useBlockingMutation<
    { acceptReply: Comment },
    MutationAcceptReplyArgs
  >(MUTATE_ACCEPT_REPLY, {
    onError: onGraphQLError({ title: "Could not accept reply" }),
    onCompleted: onMutationComplete({
      title: "Reply Accepted",
      callback: ({ acceptReply }) => {
        setShowAll(false);
      },
    }),
  });

  const [deleteComment] = useBlockingMutation<
    { delereReply: Comment },
    MutationDeleteCommentArgs
  >(MUTATE_DELETE_COMMENT, {
    onError: onGraphQLError({ title: "Could not delete comment" }),
    onCompleted: onMutationComplete({
      title: "Comment Deleted",
      callback: props.onDelete,
    }),
  });

  const [updateComment] = useBlockingMutation<
    { updateComment: Comment },
    MutationUpdateCommentArgs
  >(MUTATE_UPDATE_COMMENT, {
    onError: onGraphQLError({ title: "Could not update comment" }),
    onCompleted: onMutationComplete({
      title: "Comment Updated",
    }),
  });

  const showAllReplies = () => {
    getAllReplies({
      variables: { commentId: comment.id },
      onCompleted: ({ replies }) => {
        setAllReplies(replies);
        setShowAll(true);
      },
    });
  };

  const renderReply = (reply: CommentReply) => {
    const replyAuthor = {
      name: reply.author.name,
      avatarUrl: reply.author.avatarUrl!,
      title: reply.author.title,
    };
    const replyId = reply.id;

    return (
      <CommentReplyModule
        key={`reply-${replyId}`}
        replyId={replyId}
        className="mt-4"
        author={replyAuthor}
        updatedAt={reply.updatedAt}
        createdAt={reply.createdAt}
        content={reply.body!}
        acceptedAnswer={reply.id === comment.acceptedReplyId}
        onChange={(content) =>
          updateReply({
            variables: { commentReplyId: replyId, input: { body: content } },
          })
        }
        onDelete={() => setDeleteReplyId(replyId)}
        onAccept={() => {
          acceptReply({ variables: { commentReplyId: replyId } });
        }}
      />
    );
  };

  const commentAuthor = {
    name: comment.author.name,
    avatarUrl: comment.author.avatarUrl!,
    title: comment.author.title,
  };

  const renderReplyButton = () => {
    return (
      <div className="flex w-full flex-row space-x-2 px-4">
        <Avatar
          src={currentAuthor.avatarUrl}
          name={currentAuthor.name}
          className="h-9 w-9 shrink-0 rounded border-2 border-white shadow-sm"
        />
        <div
          onClick={() => setShowForm(true)}
          role="button"
          className="h-10 flex-1 cursor-text rounded-lg border bg-white p-2 text-sm text-gray-400"
        >
          Leave a reply...
        </div>
      </div>
    );
  };

  const commentId = comment.id;

  const renderReplies = () => {
    const acceptedReply = comment.acceptedReply;

    if (highlightReply) {
      return map(replies, renderReply);
    } else if (acceptedReply) {
      return showAll ? map(replies, renderReply) : renderReply(acceptedReply);
    } else {
      return map(replies, renderReply);
    }
  };

  const renderShowAllRepliesButton = () => {
    const acceptedReply = comment.acceptedReply;
    let message = "";

    if (acceptedReply && !showAll) {
      message = "showing accepted answer only, ";
    } else if (comment.replyCount > 0 && replies.length < comment.replyCount) {
      message = `showing last ${plural("{} reply", "{} replies", replies)}, `;
    }

    if (message) {
      return (
        <button
          type="button"
          onClick={() => showAllReplies()}
          className="my-2 w-full rounded-lg bg-gray-200 p-2 text-center text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700 md:bg-transparent"
        >
          <span className="hidden sm:inline">{message}</span>
          <span className="font-medium">click here to display all replies</span>
        </button>
      );
    }
  };

  return (
    <div>
      <DangerConfirm
        visible={!!deleteReplyId}
        onClose={() => setDeleteReplyId(null)}
        cta="Delete Reply"
        title="Delete Reply?"
        description="Are you sure you want to delete this reply? This cannot be undone."
        onConfirm={() =>
          deleteReplyId &&
          deleteReply({ variables: { commentReplyId: deleteReplyId } })
        }
      />
      <DangerConfirm
        visible={showDeleteComment}
        onClose={() => setShowDeleteComment(false)}
        cta="Delete Comment"
        title="Delete Comment?"
        description="Are you sure you want to delete this comment and all its replies? This cannot be undone."
        onConfirm={() => deleteComment({ variables: { commentId } })}
      />
      <CommentModule
        key={`comment-${comment.id}`}
        className="my-4"
        commentId={comment.id}
        author={commentAuthor}
        createdAt={comment.createdAt}
        updatedAt={comment.updatedAt}
        content={comment.body!}
        hasReplies={replies.length > 0}
        onReply={() => setShowForm(true)}
        onChange={(content) =>
          updateComment({
            variables: { commentId, input: { body: content } },
          })
        }
        onDelete={() => setShowDeleteComment(true)}
      >
        {!showAll && renderShowAllRepliesButton()}
        {renderReplies()}
        <div className="mt-4">
          {showForm ? (
            <CommentReplyFormModule
              commentId={comment.id}
              author={currentAuthor}
              role={currentRole}
              visible={showForm}
              onHide={() => setShowForm(false)}
            />
          ) : (
            renderReplyButton()
          )}
        </div>
      </CommentModule>
    </div>
  );
};

TicketComment.fragments = {
  TicketCommentFragment: gql`
    fragment TicketCommentFragment on Comment {
      id
      createdAt
      updatedAt
      body
      acceptedReplyId
      acceptedReply {
        ...CommentReplyModuleFragment
        ...CommentReplyFormModuleFragment
      }
      replyCount
      author {
        id
        title
        name
        title
        avatarUrl
      }
      replies {
        ...CommentReplyModuleFragment
        ...CommentReplyFormModuleFragment
      }
    }

    ${CommentReplyModule.fragments.CommentReplyModuleFragment}
    ${CommentReplyFormModule.fragments.CommentReplyFormModuleFragment}
  `,
};

const MUTATE_DELETE_REPLY = gql`
  mutation DeleteReply($commentReplyId: Int!) {
    deleteReply(commentReplyId: $commentReplyId)
  }
`;

const MUTATE_UPDATE_REPLY = gql`
  mutation UpdateReply($commentReplyId: Int!, $input: UpdateReplyInput!) {
    updateReply(commentReplyId: $commentReplyId, input: $input) {
      id
      ...CommentReplyModuleFragment
      ...CommentReplyFormModuleFragment
    }
  }
  ${CommentReplyModule.fragments.CommentReplyModuleFragment}
  ${CommentReplyFormModule.fragments.CommentReplyFormModuleFragment}
`;

const MUTATE_ACCEPT_REPLY = gql`
  mutation acceptReply($commentReplyId: Int!) {
    acceptReply(commentReplyId: $commentReplyId) {
      id
      acceptedReplyId
      acceptedReply {
        ...CommentReplyModuleFragment
        ...CommentReplyFormModuleFragment
      }
    }
  }
  ${CommentReplyModule.fragments.CommentReplyModuleFragment}
  ${CommentReplyFormModule.fragments.CommentReplyFormModuleFragment}
`;

const MUTATE_DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: Int!) {
    deleteComment(commentId: $commentId)
  }
`;

const MUTATE_UPDATE_COMMENT = gql`
  mutation UpdateComment($commentId: Int!, $input: UpdateCommentInput!) {
    updateComment(commentId: $commentId, input: $input) {
      ...TicketCommentFragment
    }
  }
  ${TicketComment.fragments.TicketCommentFragment}
`;

const QUERY_GET_ALL_REPLIES = gql`
  query replies($commentId: Int!) {
    replies(commentId: $commentId) {
      id
      ...CommentReplyModuleFragment
      ...CommentReplyFormModuleFragment
    }
  }
  ${CommentReplyModule.fragments.CommentReplyModuleFragment}
  ${CommentReplyFormModule.fragments.CommentReplyFormModuleFragment}
`;
