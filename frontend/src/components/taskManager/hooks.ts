import {
  DocumentNode,
  gql,
  useLazyQuery,
  useMutation,
  useQuery,
  Reference,
} from "@apollo/client";
import { debounce } from "lodash";
import { GET_TICKET_NOTE } from "pages/ticket/TicketView/TicketNote";
import { useCallback, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  MutationBlockTicketArgs,
  MutationCloseLastScheduleItemArgs,
  MutationCloseScheduleItemArgs,
  MutationCreateScheduleItemArgs,
  MutationUnblockTicketArgs,
} from "types/graphql";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { onGraphQLError, GQLClient } from "utils/GQLClient";

interface NotificationUrl {
  targetId: number;
  target: string;
  notificaitonId: number;
  isRead: boolean;
}
/**
 * Refresh the queries of the page when it becomes visible
 * again as opposed to "focused".
 *
 * You can change the delay but it's set to a default of
 * one minute.
 *
 * This means, if the page has not been visible
 * for a whole minute and becomes visible again (aka. tab changes),
 * it then gets refreshed.
 *
 * Note that the debounce is triggered at the beginning (leading)
 * instead of the end(trailing) such as the refresh happens
 * instantly when the tab is activated
 * @param queries The GraphQL query to be refreshed
 * @param delay The time required since we left the page
 */
export function useRefetchOnVisible(
  queries: DocumentNode[],
  delay: number = 60 * 1000, // 1 minute
) {
  useEffect(() => {
    const onFocus = debounce(
      () => {
        if (document.visibilityState === "visible") {
          GQLClient.refetchQueries({
            include: queries,
          });
        }
      },
      delay,
      { leading: true, trailing: false },
    );

    document.addEventListener("visibilitychange", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onFocus);
    };
  });
}

export function useNotificationUrl(): NotificationUrl | null {
  const history = useHistory();

  // Notification Handling:
  // When we land on the ticket comment page, we want to only
  // display the comment and reply linked to the notification
  const urlSearchParams = new URLSearchParams(history.location.search);
  const urlParams = Object.fromEntries(urlSearchParams.entries());

  if (urlParams.notificationId) {
    return {
      notificaitonId: parseInt(urlParams.notificationId, 10),
      targetId: parseInt(urlParams.targetId, 10),
      target: urlParams.target,
      isRead: urlParams.isRead === "true",
    };
  }

  return null;
}

export function useDebounceFn<T extends any[]>(
  fn: (...a: T) => any,
  delay: number,
): (...a: T) => void {
  const debounce = useRef<any>();

  return useCallback(
    (...a: T) => {
      clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        fn(...a);
      }, delay);
    },
    [fn, debounce, delay],
  );
}

export const useGetUpcomingTickets = () => {
  return useQuery<QueryReturnValue["myNextTickets"]>(GET_UPCOMING_ITEMS, {
    fetchPolicy: "cache-and-network",
    // since this query is triggered independently of a user action
    // we do not display a popup notification here, but log the error
    // in the console instead
    onError: (error) => {
      console.warn("Could not retrieve upcoming tickets", error);
    },
  });
};

export const useGetUnfinishedItems = () => {
  return useQuery<QueryReturnValue["myUnfinishedScheduleItems"]>(
    GET_UNFINISHED_ITEMS,
    {
      fetchPolicy: "cache-and-network",
      // since this query is triggered independently of a user action
      // we do not display a popup notification here, but log the error
      // in the console instead
      onError: (error) => {
        console.warn("Could not retrieve unfinished tickets", error);
      },
    },
  );
};

export const useGetOpenItems = () => {
  return useQuery<QueryReturnValue["myOpenScheduleItems"]>(
    GET_OPEN_SCHEDULE_ITEMS,
    {
      fetchPolicy: "cache-and-network",
      // since this query is triggered independently of a user action
      // we do not display a popup notification here, but log the error
      // in the console instead
      onError: (error) => {
        console.warn("Could not retrieve active ticket", error);
      },
    },
  );
};

export const useLazyGetOpenItems = () => {
  return useLazyQuery<QueryReturnValue["myOpenScheduleItems"]>(
    GET_OPEN_SCHEDULE_ITEMS,
    {
      fetchPolicy: "cache-and-network",
      onError: onGraphQLError({ title: "Could not retrieve active task" }),
    },
  );
};

/**
 * Start working on a given task (a specific ticket workflow state)
 *
 * @param onCompleted
 * @returns
 */
export const useStartTask = (onCompleted?: () => void) => {
  return useMutation<
    MutationReturnValue["createScheduleItem"],
    MutationCreateScheduleItemArgs
  >(START_TASK_MUTATION, {
    onCompleted,
    onError: onGraphQLError({ title: "Could not start task" }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }
      const scheduleItem = data.createScheduleItem;

      cache.modify({
        fields: {
          myOpenScheduleItems() {
            // When we "start" working on a task we can add it to the
            // list of open schedule item. In reality, when you start working
            // on a task, the backend will mark any open task you own as stopped
            // so we can safely just replace the array by the last started element
            const newScheduleItem = cache.writeFragment({
              data: scheduleItem,
              fragment: fragments.scheduleItemDetails,
            });
            return [newScheduleItem];
          },
          myUnfinishedScheduleItems(unfinishedItems = [], { readField }) {
            // When we "start" working on a task we will remove it from
            // the list of unfinished items (if found)
            return unfinishedItems.filter(
              (obj: Reference) => scheduleItem.id !== readField("id", obj),
            );
          },
        },
      });
    },
  });
};

/**
 * Block a given state
 * @param onCompleted optional, called when mutation completes
 */

export const useBlockState = (onCompleted?: () => void) => {
  return useMutation<
    MutationReturnValue["blockTicket"],
    MutationBlockTicketArgs
  >(BLOCK_TICKET_WORKFLOW_STATE, {
    onCompleted,
    onError: onGraphQLError({ title: "Could not block ticket" }),
    refetchQueries: [
      "lastTicketWorkflowStateNote",
      "GetSingleTicket",
      "HookMyOpenScheduleItems",
      "HookMyUnfinishedScheduleItems",
    ],
  });
};

/**
 * Unblock a given state
 * @param onCompleted optional, called when mutation completes
 */

export const useUnblockState = (onCompleted?: () => void) => {
  return useMutation<
    MutationReturnValue["unblockTicket"],
    MutationUnblockTicketArgs
  >(UNBLOCK_TICKET_WORKFLOW_STATE, {
    onCompleted,
    onError: onGraphQLError({ title: "Could not unblock ticket" }),
    refetchQueries: [
      "lastTicketWorkflowStateNote",
      "GetSingleTicket",
      "HookMyOpenScheduleItems",
      "HookMyUnfinishedScheduleItems",
    ],
  });
};

/**
 * Stop a specific running schedule item task
 * @param onCompleted optional, called when mutation completes
 * @returns
 */
export const useStopTask = (onCompleted?: () => void) => {
  return useMutation<
    MutationReturnValue["closeScheduleItem"],
    MutationCloseScheduleItemArgs
  >(STOP_TASK_MUTATION, {
    onCompleted,
    refetchQueries: [GET_TICKET_NOTE],
    onError: onGraphQLError({ title: "Could not stop task" }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      const scheduleItem = data.closeScheduleItem;

      cache.modify({
        fields: {
          myOpenScheduleItems(scheduleItems = [], { readField }) {
            // When we "stop" at task, even if it's someone else's task,
            // we try to remove it from the list of open schedule item.
            // an open schedule item is a schedule item without an end time
            // which means an actively worked on item
            return scheduleItems.filter(
              (obj: Reference) => scheduleItem.id !== readField("id", obj),
            );
          },
          myUnfinishedScheduleItems(unfinishedItems = [], { readField }) {
            // When we "stop" at task but didn't not mark it as done
            // (meaning we're pausing it) we'll add the schedule item to the
            // list of unfinished schedule items.
            // If we "stop" a task by marking it as done, we'll
            // remove it from our unfinished schedule items list.
            return scheduleItem.done
              ? unfinishedItems.filter(
                  (obj: Reference) => scheduleItem.id !== readField("id", obj),
                )
              : [scheduleItem, ...unfinishedItems];
          },
        },
      });
    },
  });
};

/**
 * Stop the last task that is open on a given ticket
 * there is no side effect if the there is no active task
 * @param onCompleted optional, called when mutation completes
 * @returns
 */
export const useStopLastTask = (onCompleted?: () => void) => {
  return useMutation<
    MutationReturnValue["closeLastScheduleItem"],
    MutationCloseLastScheduleItemArgs
  >(STOP_LAST_TASK_MUTATION, {
    onCompleted,
    refetchQueries: [GET_TICKET_NOTE],
    onError: onGraphQLError({ title: "Could not stop task" }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      const scheduleItem = data.closeLastScheduleItem;

      cache.modify({
        fields: {
          myOpenScheduleItems(scheduleItems = [], { readField }) {
            // When we "stop" a task, even if it's someone else's task,
            // we try to remove it from the list of open schedule item.
            // an open schedule item is a schedule item without an end time
            // which means an actively worked on item
            return scheduleItems.filter(
              (obj: Reference) => scheduleItem.id !== readField("id", obj),
            );
          },
          myUnfinishedScheduleItems(unfinishedItems = [], { readField }) {
            // When we "stop" a task but didn't mark it as done
            // (meaning we're pausing it) we'll add the schedule item to the
            // list of unfinished schedule items.
            // If we "stop" a task by marking it as done, we'll
            // remove it from our unfinished schedule items list.
            return scheduleItem.done
              ? unfinishedItems.filter(
                  (obj: Reference) => scheduleItem.id !== readField("id", obj),
                )
              : [scheduleItem, ...unfinishedItems];
          },
        },
      });
    },
  });
};

const fragments = {
  ticketDetails: gql`
    fragment HookTicketDetails on Ticket {
      id
      title
      product {
        id
        name
        code
      }
    }
  `,

  workflowStateDetails: gql`
    fragment HookWorkflowStateDetails on TicketWorkflowState {
      id
      name
      isBlocked
    }
  `,

  scheduleItemDetails: gql`
    fragment HookScheduleItemDetails on ScheduleItem {
      id
      startedAt
      stoppedAt
      done
      nextTicketWorkflowState {
        id
        isBlocked
        name
      }
      ticketId

      ticket {
        id
        localId
        title
        status
        closedAt
        closingNote
        product {
          id
          name
          code
        }
        ticketWorkflowStates {
          id
          position
          name
          isBlocked
          scheduleItems {
            id
            done
            stoppedAt
            startedAt
            ticketWorkflowStateId
            nextTicketWorkflowStateId
            roleId
            role {
              id
              title
              name
              avatarUrl
            }
          }
        }
        workflow {
          id
          name
        }
      }
      ticketWorkflowState {
        id
        name
        isBlocked
      }
    }
  `,
  ticketWithScheduleItemsFragment: gql`
    fragment ticketWithScheduleItemsFragment on Ticket {
      id
      scheduleItems {
        id
        startedAt
        stoppedAt
        ticketWorkflowState {
          id
          name
        }
      }
      lastScheduleItem {
        id
        startedAt
        stoppedAt
        ticketWorkflowState {
          id
          name
        }
      }
    }
  `,
};

export const GET_OPEN_SCHEDULE_ITEMS = gql`
  query HookMyOpenScheduleItems {
    myOpenScheduleItems {
      id
      ...HookScheduleItemDetails
    }
  }
  ${fragments.scheduleItemDetails}
`;

const GET_UPCOMING_ITEMS = gql`
  query HookMyNextTickets {
    myNextTickets {
      ticket {
        id
        localId
        product {
          id
          name
          code
        }
        workflow {
          id
          name
        }
        ...HookTicketDetails
      }
      nextState {
        id
        ...HookWorkflowStateDetails
      }
    }
  }
  ${fragments.ticketDetails}
  ${fragments.workflowStateDetails}
`;

export const GET_UNFINISHED_ITEMS = gql`
  query HookMyUnfinishedScheduleItems {
    myUnfinishedScheduleItems {
      id
      ticket {
        localId
        id
        workflow {
          id
          name
        }
      }
      ...HookScheduleItemDetails
    }
  }
  ${fragments.scheduleItemDetails}
`;

const START_TASK_MUTATION = gql`
  mutation HookStartTask($input: CreateScheduleItemInput!) {
    createScheduleItem(input: $input) {
      id
      ...HookScheduleItemDetails
    }
  }
  ${fragments.scheduleItemDetails}
`;

const STOP_TASK_MUTATION = gql`
  mutation HookStopTask($scheduleItemId: Int!, $input: CloseScheduleItemInput) {
    closeScheduleItem(input: $input, scheduleItemId: $scheduleItemId) {
      id
      ...HookScheduleItemDetails
    }
  }
  ${fragments.scheduleItemDetails}
`;

const STOP_LAST_TASK_MUTATION = gql`
  mutation HookStopLastTask($ticketId: Int!, $input: CloseScheduleItemInput) {
    closeLastScheduleItem(ticketId: $ticketId, input: $input) {
      id
      ...HookScheduleItemDetails
    }
  }
  ${fragments.scheduleItemDetails}
`;

const BLOCK_TICKET_WORKFLOW_STATE = gql`
  mutation blockTicket(
    $ticketId: Int!
    $ticketWorkflowStateId: Int!
    $note: String!
  ) {
    blockTicket(
      ticketId: $ticketId
      ticketWorkflowStateId: $ticketWorkflowStateId
      note: $note
    ) {
      id
      ticketWorkflowStates {
        id
        isBlocked
      }
    }
  }
`;

const UNBLOCK_TICKET_WORKFLOW_STATE = gql`
  mutation unblockTicket(
    $ticketId: Int!
    $ticketWorkflowStateId: Int!
    $note: String!
  ) {
    unblockTicket(
      ticketId: $ticketId
      ticketWorkflowStateId: $ticketWorkflowStateId
      note: $note
    ) {
      id
      ticketWorkflowStates {
        id
        isBlocked
      }
    }
  }
`;
