import { gql } from "@apollo/client";
import { Button } from "components/fields/Button";
import { ProductSelect } from "components/fields/ProductSelect";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { useState } from "react";
import { FCWithFragments } from "types";
import {
  MiniWorkflow,
  ModelStage,
  MutationUpdateTicketArgs,
  MutationUpdateTicketStageArgs,
  MiniProduct,
  Ticket,
} from "types/graphql";
import { TicketStageProgress, TicketStep } from "./TicketStageProgress";
import cn from "classnames";
import { ExclamationIcon, CheckCircleIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/solid";
import {
  convertToMiniProduct,
  convertToMiniWorkflow,
} from "components/fields/convertToMini";

interface Props {
  ticket: Ticket;
  steps: TicketStep[];
  updateTicket: (input: { variables: MutationUpdateTicketArgs }) => void;
  updateTicketStage: (input: {
    variables: MutationUpdateTicketStageArgs;
  }) => void;
}

export const DraftTicketStage: FCWithFragments<Props> = (props) => {
  const { ticket, steps, updateTicket, updateTicketStage } = props;

  const [product, setProduct] = useState<MiniProduct | undefined>(
    convertToMiniProduct(ticket.product) || undefined
  );
  const [workflow, setWorkflow] = useState<MiniWorkflow | undefined>(
    convertToMiniWorkflow(ticket.workflow) || undefined
  );

  const onPublishTicket = () => {
    updateTicketStage({
      variables: { ticketId: ticket.id, stage: ModelStage.Published },
    });
  };

  const onProductChange = (product?: MiniProduct) => {
    setProduct(product);
    onWorkflowChange();

    updateTicket({
      variables: {
        ticketId: ticket.id,
        input: {
          productId: product ? product.id : null,
          workflowId: null,
        },
      },
    });
  };

  const onWorkflowChange = (workflow?: MiniWorkflow) => {
    setWorkflow(workflow);
    updateTicket({
      variables: {
        ticketId: ticket.id,
        input: {
          productId: product ? product.id : null,
          workflowId: workflow ? workflow.id : null,
        },
      },
    });
  };

  const isReady = Boolean(
    ticket.product &&
      ticket.product.stage === ModelStage.Published &&
      ticket.workflow &&
      ticket.workflow.stage === ModelStage.Published
  );

  const renderStageInfo = () => {
    if (isReady) {
      return (
        <div className="rounded-lg rounded-t-none border-t border-green-100 bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Ready to publish
              </h3>
              <div className="mt-2 flex-col sm:flex">
                <p className="text-sm text-green-700">
                  You can publish this ticket. Published ticket can be assigned
                  and scheduled.
                </p>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    btnType="success"
                    onClick={onPublishTicket}
                  >
                    Publish Ticket
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="rounded-lg rounded-t-none border-t border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Cannot Publish Ticket Yet
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please assign a product and workflow to publish the ticket
                </p>
                <div className="mt-3 flex justify-end">
                  <Button type="button" btnType="success" disabled>
                    Publish Ticket
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const className = cn("rounded-lg shadow bg-white");

  return (
    <div className={className}>
      <div className="mt-4 flex flex-col space-y-4 p-4">
        <div className="text-center text-lg font-medium text-gray-700">
          Draft Ticket
        </div>
        <TicketStageProgress steps={steps} />
        <p className="font-base text-sm text-gray-600">
          Your draft tickets are only visible to you. Assign a product and
          workflow to the ticket and publish it to make it visible to others
        </p>
        <ProductSelect
          label="Product"
          tabIndex={1}
          value={product}
          onChange={onProductChange}
          includeDraft
        />

        {product ? (
          <>
            <ProductWorkflowSelect
              tabIndex={2}
              label="Workflow"
              productId={product.id}
              value={workflow}
              onChange={onWorkflowChange}
            />
          </>
        ) : null}
      </div>
      <div>{renderStageInfo()}</div>
    </div>
  );
};

DraftTicketStage.fragments = {
  draftTicketStageFragment: gql`
    fragment draftTicketStageFragment on Ticket {
      id
      product {
        id
        name
        code
        stage
      }
      workflow {
        id
        name
        stage
      }
    }
  `,
};
