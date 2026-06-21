/**
 * SupersedeWorkflowModal — confirm changing the workflow of a ticket that
 * already has logged work (issue #110, ADR 0010).
 *
 * Once real time is logged, a ticket's workflow can no longer be rewritten in
 * place — that would make one ticket misrepresent its own history. Instead the
 * original is closed (its logged work kept as an immutable record) and the work
 * continues on a new linked ticket under the chosen workflow. This is a
 * lifecycle change, not a light plan edit, so the modal spells out the branch:
 * which ticket closes, that its logged work is preserved, and that a successor
 * is created. The picker is scoped to `productId`, offering only workflows valid
 * for the ticket's product (the same set the backend validates against).
 */

import React, { useState } from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import { Button } from "components/fields/Button";
import { SwitchHorizontalIcon } from "@heroicons/react/outline";
import { ProductWorkflowSelect } from "components/fields/ProductWorkflowSelect";
import { MiniWorkflow } from "types/graphql";

interface Props extends ModalProps {
  productId: number;
  currentWorkflowId: number;
  // Human reference to the ticket being superseded, e.g. "TWKS-42".
  ticketReference: string;
  // Elapsed logged work in seconds — surfaced so the user sees exactly what is
  // being preserved on the closed original.
  loggedWorkSeconds: number;
  onConfirm: (workflowId: number) => void;
}

// "1h 47m" / "12m" / "45s" — a compact, honest read of the preserved work.
const formatLoggedWork = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

export const SupersedeWorkflowModal: React.FC<Props> = (props) => {
  const {
    productId,
    currentWorkflowId,
    ticketReference,
    loggedWorkSeconds,
    onConfirm,
    ...modalProps
  } = props;
  const [workflow, setWorkflow] = useState<MiniWorkflow | undefined>();

  // Block confirming a no-op: the same workflow would be rejected by the backend
  // anyway, so don't offer it.
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
      <form onSubmit={onSubmit} data-e2e="supersede-workflow-modal-form">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
            <SwitchHorizontalIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Supersede {ticketReference}?
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                {ticketReference} has{" "}
                <span className="font-medium text-gray-700">
                  {formatLoggedWork(loggedWorkSeconds)}
                </span>{" "}
                of logged work, so its workflow can&apos;t be changed in place.
                Confirming will <span className="font-medium">close</span>{" "}
                {ticketReference} (its logged work is kept as a record) and{" "}
                <span className="font-medium">create a new ticket</span> under
                the chosen workflow, carrying over its details and dependencies.
                The new ticket starts fresh and re-enters estimation.
              </p>
            </div>
            <div className="mt-4">
              <ProductWorkflowSelect
                label="New workflow"
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
            Supersede ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
