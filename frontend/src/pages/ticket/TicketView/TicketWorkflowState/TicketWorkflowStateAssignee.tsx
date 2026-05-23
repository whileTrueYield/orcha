import { FormCheckboxGroup } from "components/fields/Checkbox";
import { RoleSelect } from "components/fields/RoleSelect";
import { ExclamationIcon } from "@heroicons/react/solid";
import React, { useEffect, useState } from "react";
import { MiniRole, Ticket, TicketWorkflowState } from "types/graphql";
import { useFormContext } from "react-hook-form";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { ClockIcon } from "@heroicons/react/outline";
import { TicketEstimateModal } from "./TicketEstimateModal";
import { every } from "lodash";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { convertToMiniRole } from "components/fields/convertToMini";

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticket: Ticket;
  index: number;
}

export const TicketWorkflowStateAssignee: FCWithFragments<Props> = (props) => {
  const { ticketWorkflowState, index, ticket } = props;
  const [assignee, setAssignee] = useState(
    convertToMiniRole(ticketWorkflowState.assignee) || null
  );
  const formContext = useFormContext();
  const { setValue, watch } = formContext;
  const isActive = watch(`ticketWorkflowStates.${index}.isActive`);
  const [isEstimateModalVisible, setEstimateModalVisible] = useState(false);

  useEffect(() => {
    formContext.register(`ticketWorkflowStates.${index}.assigneeId`);
  }, [formContext, index]);

  const onAssigneeChange = (assignee: MiniRole | null) => {
    setAssignee(assignee);
    setValue(`ticketWorkflowStates.${index}.assigneeId`, assignee?.id || null);
  };

  const isEstimated = every([
    ticketWorkflowState.estimateMinimum,
    ticketWorkflowState.estimateMostLikely,
    ticketWorkflowState.estimateMaximum,
  ]);

  return (
    <div
      key={`ticket-workflow-state-${ticketWorkflowState.id}`}
      className="flex flex-row rounded-md p-2 text-left hover:bg-gray-100"
    >
      <TicketEstimateModal
        ticket={ticket}
        visible={isEstimateModalVisible}
        ticketWorkflowState={ticketWorkflowState}
        onClose={() => setEstimateModalVisible(false)}
      />
      <FormCheckboxGroup
        id={`ticket-ws-${ticketWorkflowState.id}`}
        name={`ticketWorkflowStates.${index}.isActive`}
        className="mr-2"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Label htmlFor={`ticket-ws-${ticketWorkflowState.id}`} className="mb-1">
          {ticketWorkflowState.name}
        </Label>
        {isActive ? (
          <div className="flex flex-row space-x-2">
            <RoleSelect
              tabIndex={2}
              onChange={onAssigneeChange}
              value={assignee}
              className="flex-1"
              includeMe
              showDeleteButton
            />
            <Button
              type="button"
              btnType={isEstimated ? "success" : "white"}
              disabled={!ticketWorkflowState.assigneeId}
              onClick={() => setEstimateModalVisible(true)}
            >
              <ClockIcon className="-mx-2 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Estimate</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-row items-center justify-center rounded-md border border-yellow-300 bg-yellow-50 py-2 text-center sm:text-sm sm:leading-5">
            <ExclamationIcon className="mr-1 h-5 w-5 text-yellow-400" />
            <span className="whitespace-nowrap text-yellow-700">
              skip this step
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

TicketWorkflowStateAssignee.fragments = {
  TicketWorkflowStateAssigneeDetails: gql`
    fragment TicketWorkflowStateAssigneeDetails on TicketWorkflowState {
      id
      isActive
      name
      assigneeId
      assignee {
        id
        name
      }
      estimateMinimum
      estimateMostLikely
      estimateMaximum
    }
  `,
};
