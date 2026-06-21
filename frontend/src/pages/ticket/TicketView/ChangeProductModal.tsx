/**
 * ChangeProductModal — move a published ticket to another product (issue #116,
 * Phase 2 of ADR 0010).
 *
 * The stable Ticket.id never changes, so REST/MCP/FK references survive a move;
 * only the per-product localId (and the human-facing "CODE-localId" reference)
 * is reassigned. Picking a destination re-validates the workflow against it.
 *
 * The modal's frame (icon, title, lead-in copy) stays fixed — morphing it as the
 * selection changes is disorienting. Instead, every consequence is surfaced as a
 * callout next to the field that triggers it, so the explanation sits where the
 * user is looking:
 *   - destination has no workflow      → blocking error under the product
 *   - destination lacks current flow   → warning under the workflow (plan can't carry)
 *   - chosen workflow differs          → warning under the workflow (reset / supersede)
 *   - current workflow kept            → no callout (plain move, plan preserved)
 *
 * Selection is driven here (not by the picker's own default) so we can apply one
 * policy: prefer the current workflow when the destination offers it, otherwise
 * auto-pick the only workflow when there is exactly one. The backend stays the
 * authoritative gate; this is guidance, not enforcement.
 */

import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Modal, ModalProps } from "components/modals/Modal";
import { Button } from "components/fields/Button";
import { SwitchHorizontalIcon } from "@heroicons/react/outline";
import { ProductSelect } from "components/fields/ProductSelect";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { Alert } from "components/Alert";
import { MiniProduct, MiniWorkflow, QueryMiniWorkflowsArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

// The destination's valid workflows. Shares Apollo's normalized cache cell with
// ProductWorkflowSelect's own fetch (same root field + args), so the picker and
// this modal stay consistent without a second network round-trip.
const GET_DESTINATION_WORKFLOWS = gql`
  query GetDestinationWorkflowsForChangeProduct($productId: Int) {
    miniWorkflows(productId: $productId) {
      id
      name
      stage
    }
  }
`;

interface Props extends ModalProps {
  currentProductId: number;
  currentWorkflowId: number;
  // Human reference to the ticket being moved, e.g. "PRD-42".
  ticketReference: string;
  // Whether the ticket has logged work — decides whether a workflow change
  // supersedes (close + successor) rather than resetting the plan in place.
  hasLoggedWork: boolean;
  // In-place move (member-level): same workflow, or a workflow change with no
  // logged work.
  onChange: (productId: number, workflowId: number) => void;
  // Supersede (ADMIN/OWNER): a workflow change on a ticket with logged work.
  onSupersede: (productId: number, workflowId: number) => void;
}

export const ChangeProductModal: React.FC<Props> = (props) => {
  const {
    currentProductId,
    currentWorkflowId,
    ticketReference,
    hasLoggedWork,
    onChange,
    onSupersede,
    ...modalProps
  } = props;

  const [product, setProduct] = useState<MiniProduct | undefined>();
  const [workflow, setWorkflow] = useState<MiniWorkflow | undefined>();

  const isProductMove = !!product && product.id !== currentProductId;

  // Load the destination's workflows so we can (a) auto-select sensibly and
  // (b) explain when the current workflow can't come along. onCompleted fires
  // per query completion (not per render); the functional update keeps a pick
  // already made — by the user or a prior completion — from being clobbered
  // when cache-and-network resolves a second time.
  const { data: workflowData } = useQuery<
    QueryReturnValue["miniWorkflows"],
    QueryMiniWorkflowsArgs
  >(GET_DESTINATION_WORKFLOWS, {
    skip: !isProductMove,
    fetchPolicy: "cache-and-network",
    variables: { productId: product?.id },
    onCompleted: ({ miniWorkflows }) => {
      setWorkflow((previous) => {
        if (previous) return previous;
        const current = miniWorkflows.find((w) => w.id === currentWorkflowId);
        if (current) return current;
        if (miniWorkflows.length === 1) return miniWorkflows[0];
        return previous;
      });
    },
  });

  // Switching the destination invalidates the previous workflow choice; clearing
  // it lets the auto-select policy (above) run fresh for the new product.
  const onSelectProduct = (next?: MiniProduct) => {
    setProduct(next);
    setWorkflow(undefined);
  };

  // `data` always corresponds to the current variables, so a non-null list means
  // it has loaded for *this* destination (not a stale previous one).
  const workflowsLoaded = isProductMove && workflowData?.miniWorkflows != null;
  const destinationWorkflows = workflowData?.miniWorkflows ?? [];
  const hasNoWorkflow = workflowsLoaded && destinationWorkflows.length === 0;
  const currentWorkflowAvailable = destinationWorkflows.some(
    (w) => w.id === currentWorkflowId,
  );
  const currentWorkflowMissing =
    workflowsLoaded && destinationWorkflows.length > 0 && !currentWorkflowAvailable;

  const workflowChanges = !!workflow && workflow.id !== currentWorkflowId;

  // A workflow change on a worked ticket cannot be rewritten in place — it
  // supersedes. Same workflow, or any change with no logged work, stays in place.
  const willSupersede = isProductMove && hasLoggedWork && workflowChanges;

  const canConfirm = isProductMove && !!workflow && !hasNoWorkflow;

  // Reset vs supersede depends only on whether the ticket has logged work, so the
  // consequence can be stated even before a specific workflow is picked.
  const consequence = hasLoggedWork
    ? `Confirming closes ${ticketReference} (its logged work is kept) and opens a new ticket in ${product?.name}.`
    : "Confirming resets the plan, and the ticket re-enters estimation.";

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConfirm || !props.visible) return;
    if (willSupersede) {
      onSupersede(product!.id, workflow!.id);
    } else {
      onChange(product!.id, workflow!.id);
    }
    props.onClose();
  };

  return (
    <Modal {...modalProps}>
      <form onSubmit={onSubmit} data-e2e="change-product-modal-form">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <SwitchHorizontalIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Change product
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                Move {ticketReference} to another product. It gets a new
                reference there; the old one stops resolving. Comments, watchers
                and dependencies are kept.
              </p>
            </div>
            <div className="mt-4">
              <ProductSelect
                label="Destination product"
                value={product}
                onChange={onSelectProduct}
                placeholder="Select a product"
              />
            </div>
            {hasNoWorkflow ? (
              <Alert
                type="danger"
                title="No workflow available"
                className="mt-3"
              >
                {product!.name} has no published workflow, so {ticketReference}{" "}
                can&apos;t be moved here. Pick another product.
              </Alert>
            ) : null}
            {isProductMove && !hasNoWorkflow ? (
              <div className="mt-4">
                <ProductWorkflowSelect
                  key={product!.id}
                  label="Workflow"
                  productId={product!.id}
                  value={workflow}
                  onChange={setWorkflow}
                  placeholder="Select a workflow"
                />
                {currentWorkflowMissing ? (
                  <Alert
                    type="warning"
                    title="Current workflow isn't available here"
                    className="mt-3"
                  >
                    {product!.name} doesn&apos;t offer {ticketReference}&apos;s
                    current workflow, so its plan can&apos;t be carried over.{" "}
                    {consequence}
                  </Alert>
                ) : workflowChanges ? (
                  <Alert
                    type="warning"
                    title={
                      willSupersede
                        ? "This will supersede the ticket"
                        : "The plan will be reset"
                    }
                    className="mt-3"
                  >
                    {consequence}
                  </Alert>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex-col-reverse sm:mt-4 sm:flex sm:flex-row sm:justify-end">
          <Button
            onClick={props.onClose}
            type="button"
            fullInMobile
            btnType="secondaryWhite"
            className="mb-3 sm:mb-0 sm:mr-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullInMobile
            btnType="primary"
            disabled={!canConfirm}
          >
            {willSupersede ? "Supersede into product" : "Move ticket"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
