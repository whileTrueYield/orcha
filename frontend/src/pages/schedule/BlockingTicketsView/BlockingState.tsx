import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { useState } from "react";
import {
  MutationSkipTicketWorkflowStateArgs,
  MutationUpdateTicketStatusArgs,
  RoleStatus,
  TicketStatus,
  TicketWorkflowState,
} from "types/graphql";
import { CalendarIcon, FastForwardIcon } from "@heroicons/react/outline";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { Button } from "components/fields/Button";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";
import { TicketChangeAssigneeModal } from "pages/ticket/TicketView/TicketActivity/TicketChangeAssigneeAndStartModal";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Menu } from "@headlessui/react";
import { Avatar } from "components/views/Avatar";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  tws: TicketWorkflowState;
}

export const BlockingState: FCWithFragments<Props> = (props) => {
  const { tws } = props;
  const dispatch = useAppDispatch();
  const [showChangeAssigneeModal, setChangeAssigneeModal] = useState(false);
  const [showUnscheduleModal, setUnscheduleModal] = useState(false);
  const [showSkipWorkflowStepModal, setSkipWorkflowStepModal] = useState(false);

  const [updateTicketStatus] = useBlockingMutation<
    MutationReturnValue["updateTicketStatus"],
    MutationUpdateTicketStatusArgs
  >(UPDATE_TICKET_STATUS_MUTATION, {
    onError: onGraphQLError({ title: "Could not unschedule ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been unscheduled",
    }),
  });

  const [skipTicketWorkflowState] = useBlockingMutation<
    MutationReturnValue["skipTicketWorkflowState"],
    MutationSkipTicketWorkflowStateArgs
  >(SKIP_WORKFLOW_STATE_MUTATION, {
    onError: onGraphQLError({ title: "Could not skip workflow step" }),
    onCompleted: onMutationComplete({
      title: "Workflow step skipped",
    }),
  });

  const menuOptions: PopMenuOption[] = [
    {
      type: "info",
      component: (
        <div className="border-b border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <span className="font-medium">Warning: </span>the following actions
          may be used to resolve your schedule issues but could lead to new
          ones.
        </div>
      ),
    },
    {
      type: "button",
      onClick: () => setUnscheduleModal(true),
      label: "Unschedule Ticket",
      icon: (className) => <CalendarIcon className={className} />,
    },
    {
      type: "button",
      onClick: () => setSkipWorkflowStepModal(true),
      label: "Skip " + tws.name,
      icon: (className) => <FastForwardIcon className={className} />,
    },
  ];

  const userStatus = (status: RoleStatus) => {
    switch (status) {
      case RoleStatus.Accepted:
        return (
          <span className="inline-block rounded border border-sky-200 bg-sky-50 px-1 py-px text-xs font-semibold text-sky-600">
            Active User
          </span>
        );
      case RoleStatus.Invited:
        return (
          <span className="inline-block rounded border border-gray-200 bg-gray-50 px-1 py-px text-xs font-semibold text-gray-600">
            Invited User
          </span>
        );
      case RoleStatus.Rejected:
        return (
          <span className="inline-block rounded border border-orange-200 bg-orange-50 px-1 py-px text-xs font-semibold text-orange-600">
            Invite Rejected
          </span>
        );
      case RoleStatus.Deactivated:
      default:
        return (
          <span className="inline-block rounded border border-red-200 bg-red-50 px-1 py-px text-xs font-semibold text-red-600">
            Deactivated User
          </span>
        );
    }
  };

  const onUnscheduleTicket = () => {
    updateTicketStatus({
      variables: { ticketId: tws.ticket.id, status: TicketStatus.Unscheduled },
    });
  };

  const onSkipWorkflowState = () => {
    skipTicketWorkflowState({
      variables: { id: tws.id },
    });
  };

  // we will always have a assignee but to appease the TS linter and just in case it's
  // right to panic
  if (tws.assignee) {
    return (
      <div className="flex min-w-0 flex-col items-center gap-y-4 gap-x-4 py-5 px-6 sm:flex-row">
        <TicketChangeAssigneeModal
          onClose={() => setChangeAssigneeModal(false)}
          visible={showChangeAssigneeModal}
          ticketWorkflowState={tws}
          ticket={tws.ticket}
          cta="Change Assignee"
        />
        <WarningConfirm
          onClose={() => setUnscheduleModal(false)}
          cta="Unschedule Ticket"
          description="Unscheduling this ticket would resolve the conflict but might also break a feature by removing an important work dependency"
          onConfirm={() => onUnscheduleTicket()}
          title="Unschedule Ticket"
          visible={showUnscheduleModal}
        />
        <WarningConfirm
          onClose={() => setSkipWorkflowStepModal(false)}
          cta={`Skip ${tws.name}`}
          description="Note that skipping a workflow state is not without risk, as it can impact the quality and prevent the proper execution of this task."
          onConfirm={() => onSkipWorkflowState()}
          title="Skip Workflow Step"
          visible={showSkipWorkflowStepModal}
        />
        <Avatar
          className="hidden h-12 w-12 flex-none rounded-full bg-gray-50 sm:block"
          src={tws.assignee.avatarUrl}
          alt=""
        />
        <div className="w-full min-w-0 flex-1 sm:w-auto">
          <div className="flex flex-row justify-start gap-x-4">
            <div className="mt-1 flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900">
              <p className="whitespace-nowrap">{tws.assignee.name}</p>
              {userStatus(tws.assignee.status)}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
            <p className="whitespace-nowrap">{tws.name}</p>
            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
              <circle cx={1} cy={1} r={1} />
            </svg>
            <TicketIdTag
              localId={tws.ticket.localId}
              productCode={tws.ticket.product?.code}
              className="text-xs"
            />
            <p className="truncate">{tws.ticket.title}</p>
          </div>
        </div>
        <div className="flex flex-none items-center gap-x-4">
          <Button
            type="button"
            btnType="secondaryWhite"
            onClick={() => dispatch(showTicketEditModal(tws.ticket.id))}
          >
            View Ticket<span className="sr-only">, {tws.ticket.title}</span>
          </Button>
          <div className="flex flex-row">
            <Button
              type="button"
              btnGroup="start"
              onClick={() => setChangeAssigneeModal(true)}
            >
              Change Assignee
            </Button>
            <PopMenu size="large" direction="bottom-left" options={menuOptions}>
              <Button
                block
                btnType="white"
                btnGroup="end"
                btnClassName="!px-1 py-2"
                asElement={(className) => (
                  <Menu.Button className={className}>
                    <ChevronDownIcon className="h-5 w-5 shrink-0" />
                  </Menu.Button>
                )}
              />
            </PopMenu>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

BlockingState.fragments = {
  BlockingStateFragment: gql`
    fragment BlockingStateFragment on TicketWorkflowState {
      id
      name
      isActive
      estimateMinimum
      estimateMostLikely
      estimateMaximum
      assignee {
        id
        status
        name
        avatarUrl
      }
      ticket {
        id
        localId
        title
        status
        workflow {
          id
          name
        }
        product {
          id
          code
        }
      }
    }
  `,
};

const UPDATE_TICKET_STATUS_MUTATION = gql`
  mutation UpdateTicketStatusForBlockingTicket(
    $ticketId: Int!
    $status: TicketStatus!
    $note: String
  ) {
    updateTicketStatus(ticketId: $ticketId, status: $status, note: $note) {
      id
      ticketWorkflowStates {
        id
        ...BlockingStateFragment
      }
    }
  }
  ${BlockingState.fragments.BlockingStateFragment}
`;

const SKIP_WORKFLOW_STATE_MUTATION = gql`
  mutation skipTicketWorkflowState($id: Int!) {
    skipTicketWorkflowState(id: $id) {
      id
      isActive
    }
  }
`;
