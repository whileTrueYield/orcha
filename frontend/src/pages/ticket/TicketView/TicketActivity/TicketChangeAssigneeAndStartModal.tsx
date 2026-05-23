import React, { useEffect, useState } from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import {
  TicketWorkflowState,
  MutationEstimateTicketWorkflowStateArgs,
  Ticket,
  MiniRole,
} from "types/graphql";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { UserIcon } from "@heroicons/react/outline";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { isEmpty } from "lodash";
import { FormError } from "components/fields/FieldError";
import { FormCheckboxGroup } from "components/fields/Checkbox";
import { Dialog } from "@headlessui/react";
import { TimeField } from "../TicketWorkflowState/TimeField";
import { timeFormater } from "../TicketWorkflowState/timeParser";
import { useBlockingMutation } from "utils/graphql";
import { RoleSelect } from "components/fields/RoleSelect";

const schema = yup
  .object()
  .shape({
    fractionable: yup.boolean(),
    roleId: yup.number().label("Assignee").required(),
    minimum: yup
      .number()
      .min(1, "Minimum must be greater than 0")
      .label("Minimum"),
    mostLikely: yup
      .number()
      .min(1)
      .label("Most Likely")
      .when("minimum", (minimum, schema) =>
        schema.min(
          minimum + 1,
          `Most likely estimate must be greater than Minimum estimate (${timeFormater(
            minimum
          )})`
        )
      ),
    maximum: yup
      .number()
      .min(1)
      .label("Maximum")
      .when("mostLikely", (mostLikely, schema) =>
        schema.min(
          mostLikely + 1,
          `Maximum estimate must be greater than Most likely (${timeFormater(
            mostLikely
          )})`
        )
      ),
  })
  .noUnknown()
  .defined()
  .required();
type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  ticket: Ticket;
  ticketWorkflowState?: TicketWorkflowState;
  role?: MiniRole;
  onConfirm?: () => void;
  cta: string;
}

export const TicketChangeAssigneeModal: FCWithFragments<Props> = (props) => {
  const { ticketWorkflowState, ticket, role: propsRole, ...modalProps } = props;
  const [role, setRole] = useState<MiniRole | null>(propsRole || null);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      minimum: ticketWorkflowState?.estimateMinimum,
      mostLikely: ticketWorkflowState?.estimateMostLikely,
      maximum: ticketWorkflowState?.estimateMaximum,
      roleId: role ? role.id : null,
      fractionable: false,
    },
  });

  const { register, setValue } = formMethods;

  useEffect(() => {
    register("roleId");
  }, [register]);

  const [estimateTicket] = useBlockingMutation<
    { changeTicketWorkflowStateAssignee: Ticket },
    MutationEstimateTicketWorkflowStateArgs
  >(CHANGE_TICKET_WORKFLOW_STATE_ASSIGNEE_MUTATION, {
    onError: onGraphQLError({ title: "Ticket assignment failed" }),
    onCompleted: onMutationComplete({
      title: "Ticket assignment done",
      callback: (data) => {
        if (props.onConfirm) {
          props.onConfirm();
        }
        props.onClose();
      },
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    if (ticketWorkflowState) {
      estimateTicket({
        variables: {
          ticketId: ticket.id,
          input: {
            ticketWorkflowStateId: ticketWorkflowState.id,
            ...formData,
          },
        },
      });
    }
  };

  const onRoleChange = (role: MiniRole | null) => {
    setRole(role);
    setValue("roleId", role ? role.id : null, {
      shouldValidate: true,
    });
  };

  if (!ticketWorkflowState) {
    return null;
  }

  return (
    <Modal {...modalProps} initialFocusSelector="#est-minimum">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
            <UserIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Change Assignee
            </Dialog.Title>
            <div className="mt-4">
              <p className="text-sm leading-5 text-gray-700">
                <span className="font-medium text-gray-900">
                  {ticketWorkflowState.name}{" "}
                </span>
                is assigned to{" "}
                <span className="font-medium text-gray-900">
                  {ticketWorkflowState.assignee?.name}
                </span>
                .
              </p>
              <p className="mt-2 text-sm leading-5 text-gray-600">
                To change the assignee you are required to provide new time
                estimates
              </p>
            </div>
            <div className="flex flex-col text-left">
              <div className="mt-4 grid grid-cols-3 gap-6">
                <div className="col-span-3">
                  <RoleSelect
                    value={role}
                    label="New Assignee"
                    onChange={onRoleChange}
                    placeholder="Select a new assignee..."
                  />
                  <FormError className="mt-1" name="roleId" />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="est-minimum">
                    Minimum
                  </Label>
                  <div>
                    <TimeField
                      autoFocus
                      name="minimum"
                      id="est-minimum"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1" htmlFor="est-mostLikely">
                    Most Likely
                  </Label>
                  <div>
                    <TimeField
                      name="mostLikely"
                      id="est-mostLikely"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1" htmlFor="est-maximum">
                    Maximum
                  </Label>
                  <div>
                    <TimeField
                      name="maximum"
                      id="est-maximum"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              </div>
              {isEmpty(formMethods.formState.errors) ? null : (
                <FormError
                  className="mt-2"
                  name={Object.keys(formMethods.formState.errors)[0]}
                />
              )}
              <div className="mt-6 hidden">
                <FormCheckboxGroup
                  className="mt-2 mb-2 sm:mb-0 sm:mt-0"
                  label="Allow interruptions"
                  description="When checked, task may be interrupted by others task."
                  name="fractionable"
                  id="estimate-fractionable"
                />
              </div>
              <div className="mt-5 flex flex-col-reverse sm:mt-4 sm:flex-row sm:justify-end">
                <Button
                  onClick={props.onClose}
                  fullInMobile
                  type="button"
                  btnType="secondaryWhite"
                  tabIndex={4}
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  tabIndex={3}
                  btnType="primary"
                  fullInMobile
                  className="sm:ml-3"
                >
                  {props.cta}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

TicketChangeAssigneeModal.fragments = {
  TicketChangeAssigneeModalWorkflowStateFragment: gql`
    fragment TicketChangeAssigneeModalWorkflowStateFragment on TicketWorkflowState {
      id
      assigneeId
      assignee {
        id
        name
        avatarUrl
        title
      }
      id
      name
      position
      isActive
      estimateMinimum
      estimateMostLikely
      estimateMaximum
      fractionable
    }
  `,
};

TicketChangeAssigneeModal.fragments.TicketChangeAssigneeModalFragment = gql`
  fragment TicketChangeAssigneeModalFragment on Ticket {
    id
    ticketWorkflowStates {
      id
      ...TicketChangeAssigneeModalWorkflowStateFragment
    }
  }
  ${TicketChangeAssigneeModal.fragments
    .TicketChangeAssigneeModalWorkflowStateFragment}
`;

const CHANGE_TICKET_WORKFLOW_STATE_ASSIGNEE_MUTATION = gql`
  mutation ChangeTicketWorkflowStateAssignee(
    $ticketId: Int!
    $input: ChangeTicketWorkflowStateInput!
  ) {
    changeTicketWorkflowStateAssignee(ticketId: $ticketId, input: $input) {
      id
      ...TicketChangeAssigneeModalFragment
    }
  }
  ${TicketChangeAssigneeModal.fragments.TicketChangeAssigneeModalFragment}
`;
