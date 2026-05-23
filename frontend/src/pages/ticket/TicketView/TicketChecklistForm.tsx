import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

interface Props {
  className?: string;
  label: string;
  onSubmit: (label: string) => void;
  onCancel: () => void;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    label: yup.string().required().max(128).label("Checklist Item"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const TicketChecklistForm: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { label: props.label },
  });

  const onSubmit = (data: FormSchema) => {
    props.onSubmit(data.label);
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <FormInputGroup
          type="text"
          className="my-1 w-full"
          name="label"
          small
          autoFocus
          onKeyUp={(evt) => evt.key === "Escape" && props.onCancel()}
        >
          <Button type="submit" btnType="gray" btnGroup="end" btnSize="small">
            Update
          </Button>
        </FormInputGroup>
      </form>
    </FormProvider>
  );
};
