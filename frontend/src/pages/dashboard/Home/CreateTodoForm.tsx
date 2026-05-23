import { PlusIcon } from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

interface Props {
  onCreate: (body: string) => void;
  className?: string;
}

const schema = yup
  .object()
  .noUnknown()
  .shape({
    body: yup.string().max(256).label("Checklist Item"),
  })
  .optional();

type FormSchema = yup.InferType<typeof schema>;

export const CreateTodoForm: React.FC<Props> = (props) => {
  const [showForm, setShowForm] = useState(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormSchema) => {
    formMethods.reset();
    if (data.body) {
      props.onCreate(data.body);
    } else {
      setShowForm(false);
    }
  };

  if (showForm) {
    return (
      <div className={props.className}>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <FormInputGroup
              className="mt-2 w-full"
              name="body"
              placeholder="Task's description"
              autoFocus
              onKeyUp={(evt) => evt.key === "Escape" && setShowForm(false)}
              data-e2e="add-task-input"
            >
              <Button
                data-e2e="add-task-button"
                type="submit"
                btnType="gray"
                btnGroup="end"
              >
                Add
              </Button>
            </FormInputGroup>
          </form>
        </FormProvider>
      </div>
    );
  } else {
    return (
      <div className={props.className}>
        <button
          className="group mt-1 flex w-full items-center justify-center rounded-md border-2 border-dashed p-2 text-sm font-medium text-gray-700 ring-offset-1 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2"
          onClick={() => setShowForm(true)}
          data-e2e="show-add-task-button"
        >
          <PlusIcon className="mr-1 h-4 w-4 text-gray-500" />
          Add task
        </button>
      </div>
    );
  }
};
