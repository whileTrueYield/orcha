import { Fragment, useState } from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import {
  TicketWorkflowState,
  MutationEstimateTicketWorkflowStateArgs,
  Ticket,
} from "types/graphql";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { ClockIcon } from "@heroicons/react/solid";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { TimeField } from "./TimeField";
import { filter, isEmpty, sortBy } from "lodash";
import { FormError } from "components/fields/FieldError";
import { timeFormater } from "./timeParser";
import { FormCheckboxGroup } from "components/fields/Checkbox";
import { Dialog } from "@headlessui/react";
import { GroupTag } from "components/tags/GroupTag";
import { urlResolver } from "utils/navigation";
import { Link, useParams } from "react-router-dom";
import { useBlockingMutation } from "utils/graphql";

interface Props extends ModalProps {
  ticketWorkflowState: TicketWorkflowState;
  ticket: Ticket;
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

export const EstimateStateModal: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const { ticketWorkflowState, ticket, ...modalProps } = props;
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      minimum: ticketWorkflowState.estimateMinimum || 0,
      mostLikely: ticketWorkflowState.estimateMostLikely || 0,
      maximum: ticketWorkflowState.estimateMaximum || 0,
      fractionable: false,
    },
  });

  const [estimateTicket] = useBlockingMutation<
    { estimateTicketWorkflowState: TicketWorkflowState },
    MutationEstimateTicketWorkflowStateArgs
  >(ESTIMATE_TICKET, {
    onError: onGraphQLError({ title: "Ticket assignment failed" }),
    onCompleted: onMutationComplete({
      title: "Ticket assignment done",
      callback: () => {
        formMethods.reset({
          minimum: 0,
          mostLikely: 0,
          maximum: 0,
          fractionable: false,
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

  const position = ticketWorkflowState.position;
  const renderMap = () => {
    const renderItem = (index: number) => {
      if (index === position) {
        return (
          <div className="relative" key={index}>
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-pink-600 bg-pink-100">
              <span className="h-3 w-3 rounded-full bg-pink-600" />
            </div>
            <div className="absolute inset-0.5 animate-ping-slow rounded-full bg-pink-600 " />
          </div>
        );
      } else {
        return (
          <div
            key={index}
            className="h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100"
          ></div>
        );
      }
    };

    const elts = filter(sortBy(ticket.ticketWorkflowStates, "position"), {
      isActive: true,
    }).map((tws, index) => {
      if (index === 0) {
        return renderItem(tws.position);
      } else {
        return (
          <Fragment key={tws.position}>
            <div className="h-0.5 w-full max-w-[4rem] bg-gray-300" />
            {renderItem(tws.position)}
          </Fragment>
        );
      }
    });

    return (
      <div className="mb-2 mt-4 rounded-lg text-center">
        <span className="mx-auto rounded bg-pink-600 px-2 py-0.5 font-bold text-pink-50">
          {ticketWorkflowState.name}
        </span>
        <div className="mx-4 mt-4 flex flex-row items-center justify-center">
          {elts}
        </div>
      </div>
    );
  };

  return (
    <Modal {...modalProps} large initialFocusSelector="#est-minimum">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <ClockIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 min-w-0 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Estimate State
            </Dialog.Title>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <GroupTag
                  label={`${ticket.localId}`}
                  groupLabel={ticket.product?.code}
                  large
                  bgColor="bg-brand-100 text-brand-800"
                  groupBgColor="bg-brand-300 text-brand-900"
                  className="mr-2"
                />
                <span className="text-lg font-semibold text-gray-700">
                  {ticket.title}
                </span>
              </div>
            </div>
            {renderMap()}
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
                      tabIndex={11}
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
                  className="mb-2 mt-2 sm:mb-0 sm:mt-0"
                  tabIndex={13}
                  label="Allow interruptions"
                  description="Task may be interrupted and resumed at a later time."
                  name="fractionable"
                  id="estimate-fractionable"
                />
              </div>
              <div className=" mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row">
                <div className="mb-4 sm:mb-0">
                  <Button
                    btnType="secondaryWhite"
                    tabIndex={16}
                    type="button"
                    fullInMobile
                    asElement={(className) => (
                      <Link
                        to={urlResolver.ticket.view(orgId, ticket.id)}
                        className={className}
                      >
                        Open Ticket
                      </Link>
                    )}
                  />
                </div>
                <div className="flex flex-row">
                  <Button
                    onClick={props.onClose}
                    fullInMobile
                    type="button"
                    btnType="secondaryWhite"
                    tabIndex={15}
                    className="mr-3 sm:mr-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    tabIndex={14}
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

EstimateStateModal.fragments = {
  EstimateStateModalFragment: gql`
    fragment EstimateStateModalFragment on TicketWorkflowState {
      id
      isActive
      estimateMinimum
      estimateMostLikely
      estimateMaximum
      fractionable
      position
    }
  `,
};

const ESTIMATE_TICKET = gql`
  mutation StandaloneEstimateTicketWorkflowState(
    $ticketId: Int!
    $input: EstimateTicketWorkflowStateInput!
  ) {
    estimateTicketWorkflowState(ticketId: $ticketId, input: $input) {
      id
      ...EstimateStateModalFragment
    }
  }
  ${EstimateStateModal.fragments.EstimateStateModalFragment}
`;
