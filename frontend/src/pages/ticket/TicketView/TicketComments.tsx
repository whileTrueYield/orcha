import { gql, useQuery } from "@apollo/client";
import { useLocalPagination } from "hooks/useLocalPagination";
import { CommentFormModule } from "components/Comment/CommentForm";
import { Paginator } from "components/views/Paginator";
import { map } from "lodash";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { FCWithFragments } from "types";
import { NotificationTarget, QueryCommentsArgs, Comment } from "types/graphql";
import { TicketComment } from "./TicketComment";
import { useNotificationUrl } from "components/taskManager/hooks";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  ticketId: number;
  className?: string;
}

export const TicketComments: FCWithFragments<Props> = (props) => {
  const me = useSelector(getMe);
  const notificationUrl = useNotificationUrl();
  const currentRole = me!.role!;
  const pagination = useLocalPagination({ pageSize: 5 });
  const { ticketId } = props;
  const currentAuthor = {
    name: currentRole.name,
    avatarUrl: currentRole.avatarUrl!,
    title: currentRole.title,
  };

  const queryVariables: QueryCommentsArgs = {
    last: pagination.pageSize,
    // search: filter, // no filter for now
    offset: pagination.pageSize * pagination.page,
    ticketId,
  };

  // Notification Handling:
  if (notificationUrl) {
    queryVariables.last = 1;
    queryVariables.offset = 0;
    if (notificationUrl.target === NotificationTarget.Reply) {
      queryVariables.replyId = notificationUrl.targetId;
    } else if (notificationUrl.target === NotificationTarget.Comment) {
      queryVariables.commentId = notificationUrl.targetId;
    }
  }

  const { data, loading, refetch } = useQuery<
    QueryReturnValue["comments"],
    QueryCommentsArgs
  >(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: queryVariables,
  });

  const comments = (data?.comments ? data.comments.nodes : []) as Comment[];
  const total = data?.comments ? data.comments.totalCount : 0;

  const renderComment = (comment: Comment) => {
    return (
      <TicketComment
        key={`comment-${comment.id}`}
        currentRole={currentRole}
        comment={comment}
        ticketId={ticketId}
        onDelete={refetch}
      />
    );
  };

  const renderComments = () => {
    return (
      <>
        {map(comments, renderComment)}
        <Paginator
          total={total}
          {...pagination}
          isLoading={loading}
          itemCount={comments.length}
          itemName="comment"
          className="mt-4 flex items-center justify-between px-4 sm:rounded-md sm:px-0"
        />
      </>
    );
  };

  // here we also make sure that we do not display the create new comment form
  // if we are showing a notification target. This is because the notification
  // mode prevent any other comment (like a new comment) from being rendered.
  // without that protection, the UX would feel broken as newly created comments
  // would not appear.
  return (
    <div className={props.className}>
      {notificationUrl ? null : (
        <CommentFormModule
          ticketId={props.ticketId}
          author={currentAuthor}
          onCreate={refetch}
        />
      )}
      {comments.length > 0 ? renderComments() : null}
    </div>
  );
};

TicketComments.fragments = {
  TicketCommentsFragment: gql`
    fragment TicketCommentsFragment on Comment {
      id
      createdAt
      body
      replyCount
      author {
        id
        name
        avatarUrl
      }

      replies {
        id
        body
        createdAt
        author {
          id
          name
          avatarUrl
        }
      }
    }
  `,
};

const GET_COMMENTS = gql`
  query GetComments(
    $ticketId: Int!
    $last: Int!
    $offset: Int
    $replyId: Int
    $commentId: Int
  ) {
    comments(
      ticketId: $ticketId
      last: $last
      offset: $offset
      replyId: $replyId
      commentId: $commentId
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        replyCount
        ...TicketCommentsFragment
        ...TicketCommentFragment
      }
    }
  }
  ${TicketComments.fragments.TicketCommentsFragment}
  ${TicketComment.fragments.TicketCommentFragment}
`;
