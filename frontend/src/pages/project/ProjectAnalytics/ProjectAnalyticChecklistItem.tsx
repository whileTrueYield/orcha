import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ChecklistItem } from "types/graphql";
import * as yup from "yup";
import cn from "classnames";
import { useState } from "react";
import { FormInputGroup } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/react/solid";

const schema = yup
  .object()
  .noUnknown()
  .shape({
    label: yup.string().max(128).label("Checklist Item"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props {
  checklistItem: ChecklistItem;
  onEdit: (value: string) => void;
  onRemove: (checklistItem: ChecklistItem) => void;
  onToggle: (checklistItem: ChecklistItem) => void;
}

export const ProjectAnalyticChecklistItem: React.FC<Props> = (props) => {
  const { checklistItem, onToggle, onEdit, onRemove } = props;
  const [editMode, setEditMode] = useState(false);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { label: checklistItem.label },
  });

  const onSubmit = (data: FormSchema) => {
    setEditMode(false);
    onEdit(data.label);
  };

  const renderEditForm = () => {
    return (
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <FormInputGroup
            type="text"
            className="my-1 w-full"
            name="label"
            small
            autoFocus
            onKeyUp={(evt) => evt.key === "Escape" && setEditMode(false)}
          >
            <Button
              type="submit"
              btnType="gray"
              btnGroup="end"
              btnSize="xsmall"
            >
              Update
            </Button>
          </FormInputGroup>
        </form>
      </FormProvider>
    );
  };

  const className = cn(
    "relative group mt-1 flex flex-row justify-between items-center text-gray-700 rounded-lg hover:bg-gray-200 p-1",
    { "bg-red-100": checklistItem.checked === false }
  );

  const renderChecked = (item: ChecklistItem) => {
    const className = cn(
      "transition duration-150 border text-white w-5 h-5 rounded-full mr-2 ml-1 cursor-pointer shadow",
      {
        "border-green-400 bg-green-400 flex items-center justify-center":
          item.checked,
        "border-gray-300 bg-white": item.checked === null,
        "border-red-400 bg-red-400 flex items-center justify-center":
          item.checked === false,
      }
    );

    return (
      <div
        onClick={() => onToggle(item)}
        onDoubleClick={(event) => event.stopPropagation()}
        className={className}
      >
        {item.checked ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <XIcon className="h-4 w-4" />
        )}
      </div>
    );
  };

  if (editMode) {
    return renderEditForm();
  }

  const labelClass = cn("group-hover:mr-6", {
    "line-through text-gray-400": checklistItem.checked === true,
    "text-gray-600": checklistItem.checked === null,
    "text-red-700 font-medium": checklistItem.checked === false,
  });

  return (
    <div
      onDoubleClick={() => setEditMode(true)}
      className={className}
      title={checklistItem.label}
    >
      <div className="flex flex-row items-start">
        <div className="flex-0 my-0.5">{renderChecked(checklistItem)}</div>
        <div className={labelClass}>{checklistItem.label}</div>
      </div>
      <div>
        <button
          className="absolute top-1 right-6 mr-1 translate-x-9 transform rounded p-1 opacity-0 duration-200 hover:bg-gray-300 group-hover:translate-x-0 group-hover:opacity-100"
          onClick={() => setEditMode(true)}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          className="absolute top-1 right-0 mr-1 translate-x-3 transform rounded p-1 opacity-0 duration-150 hover:bg-gray-300 group-hover:translate-x-0 group-hover:opacity-100"
          onClick={() => onRemove(checklistItem)}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
