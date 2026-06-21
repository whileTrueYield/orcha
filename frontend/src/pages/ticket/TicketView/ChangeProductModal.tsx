/**
 * ChangeProductModal — move a published ticket to another product (issue #116,
 * Phase 2 of ADR 0010).
 *
 * The stable Ticket.id never changes, so REST/MCP/FK references survive a move;
 * only the per-product localId (and the human-facing "CODE-localId" reference)
 * is reassigned. Picking a destination product re-validates the workflow against
 * it: the workflow picker offers only workflows valid for the chosen product and
 * defaults to the current one when it is still valid — keeping that selection is
 * a pure product move that preserves the plan, while picking a different workflow
 * resets it (and, for a ticket with logged work, supersedes instead of rewriting).
 *
 * One action, the right outcome chosen for the user (the backend stays the
 * authoritative gate):
 *   - same workflow kept           → in-place move, plan preserved
 *   - workflow changes, no work    → in-place move, plan reset + re-estimation
 *   - workflow changes, has work   → supersede into the destination product
 */

import React, { useState } from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import { Button } from "components/fields/Button";
import { SwitchHorizontalIcon } from "@heroicons/react/outline";
import { ProductSelect } from "components/fields/ProductSelect";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { MiniProduct, MiniWorkflow } from "types/graphql";
import cn from "classnames";

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

  // Switching the destination invalidates the previous workflow choice; clearing
  // it lets the (remounted) workflow picker re-default to the current workflow
  // when that workflow is valid for the newly chosen product.
  const onSelectProduct = (next?: MiniProduct) => {
    setProduct(next);
    setWorkflow(undefined);
  };

  const isProductMove = !!product && product.id !== currentProductId;
  const canConfirm = isProductMove && !!workflow;

  // A workflow change on a worked ticket cannot be rewritten in place — it
  // supersedes. Same workflow, or any change with no logged work, stays in place.
  const willSupersede =
    canConfirm && hasLoggedWork && workflow!.id !== currentWorkflowId;
  const willResetPlan =
    canConfirm && !willSupersede && workflow!.id !== currentWorkflowId;

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
          <div
            className={cn(
              "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
              willSupersede ? "bg-orange-100" : "bg-brand-100",
            )}
          >
            <SwitchHorizontalIcon
              className={cn(
                "h-6 w-6",
                willSupersede ? "text-orange-600" : "text-brand-600",
              )}
            />
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
                {willSupersede ? (
                  <>
                    {" "}
                    Because {ticketReference} has logged work and the workflow
                    changes, confirming will{" "}
                    <span className="font-medium">close</span> it (its logged
                    work is kept) and{" "}
                    <span className="font-medium">create a new ticket</span> in
                    the chosen product.
                  </>
                ) : willResetPlan ? (
                  <>
                    {" "}
                    The chosen workflow differs, so the plan is reset and
                    re-enters estimation.
                  </>
                ) : (
                  <>
                    {" "}
                    Keeping the current workflow preserves the plan and
                    estimates.
                  </>
                )}
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
            {isProductMove ? (
              <div className="mt-4">
                <ProductWorkflowSelect
                  key={product!.id}
                  label="Workflow"
                  productId={product!.id}
                  defaultId={currentWorkflowId}
                  value={workflow}
                  onChange={setWorkflow}
                  placeholder="Select a workflow"
                />
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
