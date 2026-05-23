import React, { useState } from "react";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { Todo } from "types/graphql";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { PencilIcon, XIcon } from "@heroicons/react/outline";
import cn from "classnames";

interface Props {
  todo: Todo;
  onCheck: (todo: Todo, checked: boolean) => void;
  onUpdate: (todo: Todo, body: string) => void;
  onDelete: (todo: Todo) => void;
}

const schema = yup
  .object()
  .noUnknown()
  .shape({
    body: yup.string().max(256).label("Checklist Item"),
  })
  .optional();

type FormSchema = yup.InferType<typeof schema>;

export const TodoRow: FCWithFragments<Props> = (props) => {
  const { todo, onUpdate, onCheck, onDelete } = props;
  const [editMode, setEditMode] = useState(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { body: todo.body },
  });

  const body = formMethods.watch("body");

  const onSubmit = (data: FormSchema) => {
    setEditMode(false);
    if (data.body) {
      onUpdate(todo, data.body);
    } else {
      onDelete(todo);
    }
  };

  const renderEditForm = () => {
    return (
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="ml-9">
          <FormInputGroup
            type="text"
            name="body"
            autoFocus
            onKeyUp={(evt) => evt.key === "Escape" && setEditMode(false)}
          >
            <Button
              type="submit"
              btnType={body ? "gray" : "danger"}
              btnGroup="end"
            >
              {body ? "Update" : "Delete"}
            </Button>
          </FormInputGroup>
        </form>
      </FormProvider>
    );
  };

  if (editMode) {
    return renderEditForm();
  }

  const bodyClass = cn("text-base font-medium", {
    "line-through text-gray-400": todo.checked,
    "text-gray-600": !todo.checked,
  });

  return (
    <div
      onDoubleClick={() => setEditMode(true)}
      className="group relative flex items-center rounded-lg px-4 py-2 transition-colors hover:bg-gray-100"
    >
      <div
        className="flex h-5 items-center"
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          data-e2e="task-checkbox"
          onChange={(event) => onCheck(todo, event?.currentTarget.checked)}
          className="h-5 w-5 rounded-full border-gray-300 p-1 text-green-500 focus:ring-green-500"
          checked={todo.checked}
        />
      </div>
      <div className="ml-3">
        <div className={bodyClass} data-e2e="task-body">
          {todo.body}
        </div>
      </div>
      <div>
        <button
          className="absolute top-1.5 right-9 mr-1 hidden transform rounded p-1 shadow backdrop-blur hover:bg-gray-300 group-hover:block"
          onClick={() => setEditMode(true)}
        >
          <PencilIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button
          className="absolute top-1.5 right-1 mr-1 hidden rounded p-1 shadow backdrop-blur hover:bg-gray-300 group-hover:block"
          onClick={() => onDelete(todo)}
        >
          <XIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

TodoRow.fragments = {
  todoRowFragment: gql`
    fragment todoRowFragment on Todo {
      id
      body
      checked
    }
  `,
};
