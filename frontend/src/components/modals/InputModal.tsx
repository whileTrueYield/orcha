import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";

import { Modal, ModalProps } from "./Modal";
import { Button } from "../fields/Button";
import { PencilIcon } from "@heroicons/react/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { Label } from "components/fields/Label";
import { Input } from "components/fields/Input";
import { FormError } from "components/fields/FieldError";
import { FieldDescription } from "components/fields/FieldDescription";
import { CheckboxGroup } from "components/fields/Checkbox";

const schema = yup
  .object({
    value: yup.string().required().label("This"),
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  onSubmit: (formData: FormSchema) => void;
  title: string;
  description: string;
  visible: boolean;
  label: string;
  placeholder?: string;
  cta?: string;
  value?: string;
  fieldDescription?: string;
  allowBatch?: boolean;
  batch?: boolean;
}

export const InputModal: React.FC<Props> = (props) => {
  const {
    onSubmit,
    title,
    description,
    cta,
    label,
    placeholder,
    value,
    fieldDescription,
    allowBatch,
    batch,
    ...modalProps
  } = props;
  const [batchCreate, setBatchCreate] = useState(batch);
  const valueRef = useRef<HTMLInputElement | null>(null);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { value },
  });

  useEffect(() => {
    if (value) {
      formContext.setValue("value", value);
    }
  }, [formContext, value]);

  const onFormSubmit = (formData: FormSchema) => {
    props.onSubmit(formData);
    formContext.reset();
    if (batchCreate) {
      valueRef.current?.focus();
    } else {
      props.onClose();
    }
  };

  const { ref, ...rest } = formContext.register("value");
  const error = formContext.formState.errors["value"];
  const renderError = () => <FormError className="mt-1" name="value" />;

  const renderDescription = () => (
    <FieldDescription className="mt-1">{fieldDescription}</FieldDescription>
  );

  return (
    <Modal {...modalProps} initialFocus={valueRef}>
      <FormProvider {...formContext}>
        <form
          data-e2e="input-modal-form"
          onSubmit={formContext.handleSubmit(onFormSubmit)}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
              <PencilIcon className="h-6 w-6 text-brand-600" />
            </div>
            <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
                {props.title}
              </h3>
              <div className="mt-2">
                <p className="text-sm leading-5 text-gray-500">
                  {props.description}
                </p>
              </div>
              <div className="mt-4">
                <Label htmlFor="modal-value" className="mb-1">
                  {label}
                </Label>
                <Input
                  {...rest}
                  id="modal-value"
                  error={error}
                  autoFocus
                  placeholder={placeholder}
                  ref={(e) => {
                    ref(e);
                    valueRef.current = e; // you can still assign to ref
                  }}
                />
                {error
                  ? renderError()
                  : fieldDescription
                  ? renderDescription()
                  : null}
              </div>
            </div>
          </div>
          <div className="mt-5 flex-col-reverse sm:mt-4 sm:flex sm:flex-row sm:justify-between">
            {allowBatch ? (
              <div className="flex-0 py-2">
                <CheckboxGroup
                  name="repeat"
                  label="Keep modal open"
                  defaultChecked={batchCreate}
                  onChange={(evt) => setBatchCreate(evt.currentTarget.checked)}
                />
              </div>
            ) : (
              <div />
            )}
            <div>
              <Button
                onClick={props.onClose}
                type="button"
                fullInMobile
                btnType="secondaryWhite"
                className="mb-3 sm:mb-0 sm:mr-3"
              >
                Cancel
              </Button>
              <Button type="submit" fullInMobile btnType="primary">
                {cta ? cta : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
