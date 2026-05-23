import React from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import {
  TicketWorkflowState,
  MutationEstimateTicketWorkflowStateArgs,
  Ticket,
} from "types/graphql";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { ClockIcon } from "@heroicons/react/outline";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { TimeField } from "./TimeField";
import { isEmpty } from "lodash";
import { FormError } from "components/fields/FieldError";
import { timeFormater } from "./timeParser";
import { FormCheckboxGroup } from "components/fields/Checkbox";
import { Dialog } from "@headlessui/react";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { useBlockingMutation } from "utils/graphql";

interface Props extends ModalProps {
  ticket: Ticket;
  ticketWorkflowState?: TicketWorkflowState;
}

const schema = yup
  .object()
  .shape({
    fractionable: yup.boolean(),
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

export const TicketEstimateModal: FCWithFragments<Props> = (props) => {
  const { ticketWorkflowState, ticket, ...modalProps } = props;
  const { orgId } = useParams<{ orgId: string }>();
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      minimum: ticketWorkflowState?.estimateMinimum || 0,
      mostLikely: ticketWorkflowState?.estimateMostLikely || 0,
      maximum: ticketWorkflowState?.estimateMaximum || 0,
      fractionable: ticketWorkflowState?.fractionable,
    },
  });

  const [estimateTicket] = useBlockingMutation<
    { estimateTicketWorkflowState: TicketWorkflowState },
    MutationEstimateTicketWorkflowStateArgs
  >(ESTIMATE_TICKET, {
    onError: onGraphQLError({ title: "Ticket assignment failed" }),
    onCompleted: onMutationComplete({
      title: "Ticket assignment done",
      callback: (data) => {
        formMethods.reset({
          minimum: data.estimateTicketWorkflowState.estimateMinimum || 0,
          mostLikely: data.estimateTicketWorkflowState.estimateMostLikely || 0,
          maximum: data.estimateTicketWorkflowState.estimateMaximum || 0,
          fractionable: data.estimateTicketWorkflowState.fractionable,
        });
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

  const clearEstimates = () => {
    if (ticketWorkflowState) {
      estimateTicket({
        variables: {
          ticketId: ticket.id,
          input: {
            ticketWorkflowStateId: ticketWorkflowState.id,
            minimum: null,
            mostLikely: null,
            maximum: null,
            fractionable: false,
          },
        },
      });
    }
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
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <ClockIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Time Estimate
            </Dialog.Title>
            <div className="mt-4">
              <p className="text-sm leading-5 text-gray-500">
                Please provide your estimate for the
                <strong className="mx-0.5">{ticketWorkflowState.name}</strong>
                workflow step below for{" "}
                <Link
                  to={urlResolver.ticket.view(orgId, ticket.id)}
                  className="text-brand-500 hover:text-brand-600 hover:underline"
                >
                  ticket #{ticket.localId} {ticket.title}
                </Link>
              </p>
            </div>
            <div className="flex flex-col text-left">
              <div className="mt-4 grid grid-cols-3 gap-6">
                <div>
                  <Label className="mb-1" htmlFor="est-minimum">
                    Minimum
                  </Label>
                  <div>
                    <TimeField
                      autoFocus
                      tabIndex={10}
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
                      tabIndex={11}
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
                      tabIndex={12}
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
                  tabIndex={13}
                  description="Task may be interrupted and resumed at a later time."
                  name="fractionable"
                  id="estimate-fractionable"
                />
              </div>
              <div className="mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row">
                <Button
                  onClick={clearEstimates}
                  fullInMobile
                  type="button"
                  btnType="secondaryDanger"
                  tabIndex={17}
                  className="mb-3 sm:mb-0"
                >
                  Clear estimates
                </Button>
                <div className="flex flex-row">
                  <Button
                    onClick={props.onClose}
                    fullInMobile
                    type="button"
                    btnType="secondaryWhite"
                    tabIndex={16}
                    className="mr-3 sm:mr-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    tabIndex={15}
                    btnType="primary"
                    fullInMobile
                    className="sm:ml-3"
                  >
                    Save Estimates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

TicketEstimateModal.fragments = {
  TicketEstimateFragment: gql`
    fragment TicketEstimateFragment on TicketWorkflowState {
      id
      isActive
      estimateMinimum
      estimateMostLikely
      estimateMaximum
      fractionable
      id
      name
      position
    }
  `,
};

const ESTIMATE_TICKET = gql`
  mutation EstimateTicketWorkflowState(
    $ticketId: Int!
    $input: EstimateTicketWorkflowStateInput!
  ) {
    estimateTicketWorkflowState(ticketId: $ticketId, input: $input) {
      id
      ...TicketEstimateFragment
    }
  }
  ${TicketEstimateModal.fragments.TicketEstimateFragment}
`;
