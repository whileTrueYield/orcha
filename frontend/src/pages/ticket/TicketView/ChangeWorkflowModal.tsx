/**
 * ChangeWorkflowModal — pick a new workflow for a published ticket and confirm
 * the plan reset (issue #109, ADR 0010).
 *
 * Changing a published ticket's workflow when it has no logged work resets its
 * plan in place: the old stages are deactivated and fresh ones are created for
 * the chosen workflow, so the ticket re-enters estimation. The ticket keeps its
 * identity. This modal surfaces that as one light confirmation — there is no
 * history to lose in this path, so a warning/danger treatment would overstate it.
 *
 * The picker is scoped to `productId`, so it only offers workflows valid for the
 * ticket's product (the same set the backend validates against).
 */

import React, { useState } from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import { Button } from "components/fields/Button";
import { RefreshIcon } from "@heroicons/react/outline";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { MiniWorkflow } from "types/graphql";

interface Props extends ModalProps {
  productId: number;
  currentWorkflowId: number;
  onConfirm: (workflowId: number) => void;
}

export const ChangeWorkflowModal: React.FC<Props> = (props) => {
  const { productId, currentWorkflowId, onConfirm, ...modalProps } = props;
  const [workflow, setWorkflow] = useState<MiniWorkflow | undefined>();

  // Block confirming a no-op: the same workflow would be rejected by the
  // backend anyway, so don't offer it.
  const canConfirm = !!workflow && workflow.id !== currentWorkflowId;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canConfirm && props.visible) {
      onConfirm(workflow!.id);
      props.onClose();
    }
  };

  return (
    <Modal {...modalProps}>
      <form onSubmit={onSubmit} data-e2e="change-workflow-modal-form">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <RefreshIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Change workflow
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                Pick a new workflow for this ticket. Its stages will be reset:
                current estimates are cleared and you&apos;ll re-estimate the new
                stages. The ticket&apos;s comments, watchers and dependencies are
                kept.
              </p>
            </div>
            <div className="mt-4">
              <ProductWorkflowSelect
                label="Workflow"
                productId={productId}
                value={workflow}
                onChange={setWorkflow}
                placeholder="Select a workflow"
              />
            </div>
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
            Change workflow
          </Button>
        </div>
      </form>
    </Modal>
  );
};
