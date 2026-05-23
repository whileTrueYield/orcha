import React, { useRef } from "react";

import { Modal, ModalProps } from "./Modal";
import { ExclamationIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";

interface Props extends ModalProps {
  onConfirm: () => void;
  cta: string;
  title: string;
  description: string;
  visible: boolean;
}

export const DangerConfirm: React.FC<Props> = (props) => {
  const { onConfirm, title, description, cta, ...modalProps } = props;
  const submitRef = useRef<HTMLButtonElement>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (props.visible) {
      event.preventDefault();
      props.onConfirm();
      props.onClose();
    }
  };

  return (
    <Modal {...modalProps} initialFocus={submitRef}>
      <form onSubmit={onSubmit} data-e2e="danger-modal-form">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              {props.title}
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                {props.description}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex-col-reverse sm:mt-4 sm:flex sm:flex-row sm:justify-end">
          <Button
            onClick={props.onClose}
            type="button"
            fullInMobile
            btnType="secondaryWhite"
            autoFocus
            className="mb-3 sm:mb-0 sm:mr-3"
          >
            Cancel
          </Button>
          <Button type="submit" fullInMobile btnType="danger" ref={submitRef}>
            {cta}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
