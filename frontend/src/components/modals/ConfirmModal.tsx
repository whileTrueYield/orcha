import React, { useRef } from "react";

import { Modal, ModalProps } from "./Modal";
import { Button } from "../fields/Button";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";

interface Props extends ModalProps {
  onConfirm: () => void;
  cta: string;
  title: string;
  description: string;
  visible: boolean;
  icon?: JSX.Element;
}

export const ConfirmModal: React.FC<Props> = (props) => {
  const { onConfirm, title, description, cta, icon, ...modalProps } = props;
  const submitRef = useRef<HTMLButtonElement>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (props.visible) {
      event.preventDefault();
      props.onConfirm();
      props.onClose();
    }
  };

  const modalIcon = icon || (
    <QuestionMarkCircleIcon className="h-6 w-6 text-brand-600" />
  );

  return (
    <Modal {...modalProps} initialFocus={submitRef}>
      <form onSubmit={onSubmit} data-e2e="confirm-modal-form">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            {modalIcon}
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
          <Button type="submit" ref={submitRef} fullInMobile btnType="primary">
            {cta}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
