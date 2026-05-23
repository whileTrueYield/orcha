import React, { FC, useMemo } from "react";
import {
  CustomMultiSelectGroup,
  RenderButtonParams,
} from "./CustomMultiSelectGroup";
import { useWatch } from "react-hook-form";
import { ConnectForm, FormContextType } from "../fields/ConnectForm";
import { map, without } from "lodash";
import { Avatar } from "../views/Avatar";
import { PlusIcon } from "@heroicons/react/solid";
import { XIcon } from "@heroicons/react/outline";

export interface SelectAssigneesModuleProps {
  name: string;
  description?: string;
  users: any[];
}

interface ElementProps extends SelectAssigneesModuleProps {
  formContext: FormContextType;
}

const SelectAssigneesModuleElement: FC<ElementProps> = (props) => {
  const { name, formContext, users, description } = props;
  const { control, setValue } = formContext;
  const value = useWatch({ control, name }) || [];

  const options = useMemo(
    () =>
      map(users, (user) => ({
        value: user,
        label: user.name,
        description: user.teams.join(","),
      })),
    [users]
  );

  const removeAssignee = (position: number) => {
    setValue(name, without(value, value[position]));
  };

  const renderButton = ({ setOpen, isOpen }: RenderButtonParams) => (
    <div className="flex flex-row justify-between">
      <div className="text-lg">
        Assignees
        <span className="ml-2 font-normal text-gray-500">({value.length})</span>
      </div>
      <button
        type="button"
        className="focus:ring-blue rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none"
        onClick={() => setOpen(!isOpen)}
        aria-label="Add assignee"
      >
        <PlusIcon aria-hidden="true" className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );

  const renderAssignee = (assignee: any, position: number) => {
    return (
      <div
        key={assignee.id}
        className="group my-1 flex flex-row items-center rounded-lg px-2 py-1 text-gray-700 transition duration-100 hover:bg-gray-100"
      >
        <Avatar
          src={assignee.avatarUrl}
          className="flex-0 mr-2 h-8 w-8 rounded-md border border-white bg-gray-200 shadow"
          name={assignee.name}
        />
        <span className="block flex-1 truncate">{assignee.name}</span>
        <button
          type="button"
          className="flex-0 hidden rounded p-1 leading-4 text-gray-700 opacity-0 transition duration-100 hover:bg-gray-200 group-hover:opacity-100 sm:inline-block"
          onClick={() => removeAssignee(position)}
          aria-label={`Remove assignee ${assignee.name}`}
          arial-hidden="true"
        >
          <XIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex-0 rounded p-1 leading-4 text-gray-700 hover:bg-gray-200 sm:hidden"
          onClick={() => removeAssignee(position)}
          aria-label={`Remove assignee ${assignee.name}`}
          arial-hidden="false"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const renderDescription = () => {
    if (description) {
      return (
        <div className="mt-2 ml-1 text-sm text-gray-500">{description}</div>
      );
    }

    return null;
  };

  return (
    <div>
      <CustomMultiSelectGroup
        renderButton={renderButton}
        name={name}
        options={options}
      />
      {map(value, renderAssignee)}
      {renderDescription()}
    </div>
  );
};

export const SelectAssigneesModule: React.FC<SelectAssigneesModuleProps> = (
  props
) => (
  <ConnectForm>
    {(formContext) => (
      <SelectAssigneesModuleElement {...props} {...formContext} />
    )}
  </ConnectForm>
);
