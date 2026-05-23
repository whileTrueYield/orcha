import React, { useEffect } from "react";
import cn from "classnames";
import { useState } from "react";
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/react/solid";
import { TicketChecklistForm } from "./TicketChecklistForm";

interface Props {
  checklistId: number;
  label: string;
  checked?: boolean | null;
  onEdit: (value: string) => void;
  onRemove: () => void;
  onToggle: () => void;
}

export const TicketChecklistItem: React.FC<Props> = (props) => {
  const { label, checked, onToggle, onEdit, onRemove, checklistId } = props;
  const [editMode, setEditMode] = useState(false);

  useEffect(() => setEditMode(false), [checklistId, label]);

  const onSubmit = (label: string) => {
    setEditMode(false);
    onEdit(label);
  };

  const className = cn(
    "relative text-sm group flex flex-row justify-start items-center rounded-lg py-1 transition duration-200",
    {
      "text-red-600": checked === false,
      "text-gray-700": checked === null,
      "line-through text-gray-500": checked === true,
    }
  );

  const renderChecked = () => {
    const className = cn(
      "transition duration-150 border text-white w-4 h-4 rounded-full mr-1.5 p-px cursor-pointer shadow-sm",
      {
        "border-green-400 bg-green-400 flex items-center justify-center":
          checked,
        "border-gray-300 bg-white": checked === null,
        "border-red-400 bg-red-400 flex items-center justify-center":
          checked === false,
      }
    );

    return (
      <div onClick={() => onToggle()} className={className}>
        {checked === null ? (
          <span className="inline-block h-4 w-4" />
        ) : checked ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <XIcon className="h-4 w-4" />
        )}
      </div>
    );
  };

  if (editMode) {
    return (
      <TicketChecklistForm
        label={label}
        onSubmit={onSubmit}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setEditMode(true)}
      className={className}
      title="Double click to edit"
    >
      <div className="flex flex-row items-start">
        <div
          className="flex-0 my-0.5"
          onDoubleClick={(event) => event.stopPropagation()}
        >
          {renderChecked()}
        </div>
        <div className="group-hover:mr-6">{label}</div>
      </div>
      <div className="relative h-5 w-8">
        <button
          className="absolute top-0 right-6 mr-1 translate-x-9 transform rounded p-0.5 opacity-0 duration-200 hover:bg-gray-300 hover:bg-opacity-50 group-hover:translate-x-0 group-hover:opacity-100"
          onClick={() => setEditMode(true)}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          className="absolute top-0 right-0 mr-1 translate-x-3 transform rounded p-0.5 opacity-0 duration-150 hover:bg-gray-300 hover:bg-opacity-50 group-hover:translate-x-0 group-hover:opacity-100"
          onClick={() => onRemove()}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
