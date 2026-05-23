import { Menu } from "@headlessui/react";
import React, { FC, useMemo } from "react";
import {
  CustomMultiSelectGroup,
  RenderButtonParams,
} from "./CustomMultiSelectGroup";
import { useWatch } from "react-hook-form";
import { ConnectForm, FormContextType } from "../fields/ConnectForm";
import { map, without } from "lodash";
import { Tag } from "../tags/Tag";
import { PlusIcon } from "@heroicons/react/solid";

export interface SelectTagsModuleProps {
  label: string;
  name: string;
  description?: string;
  tags: any[];
  getLabel: (tag: any) => string;
}

interface ElementProps extends SelectTagsModuleProps {
  formContext: FormContextType;
}

const SelectTagsModuleElement: FC<ElementProps> = (props) => {
  const { name, formContext, tags, description, label, getLabel } = props;
  const { control, setValue } = formContext;
  const value = useWatch({ control, name }) || [];

  const options = useMemo(
    () =>
      map(tags, (tag) => ({
        value: tag,
        label: getLabel(tag),
      })),
    [tags, getLabel]
  );

  const removeTag = (position: number) => {
    setValue(name, without(value, value[position]));
  };

  const renderButton = ({ setOpen, isOpen }: RenderButtonParams) => (
    <div className="flex flex-row justify-between">
      <div className="text-lg">
        {label}
        <span className="ml-2 font-normal text-gray-500">({value.length})</span>
      </div>
      <Menu.Button
        className="focus:ring-blue rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none"
        onClick={() => setOpen(!isOpen)}
      >
        <PlusIcon className="h-5 w-5 text-gray-700" />
      </Menu.Button>
    </div>
  );

  const renderTag = (tag: any, position: number) => {
    return (
      <div className="inline-flex flex-row" key={getLabel(tag)}>
        <Tag
          large
          className="mr-2 mt-2 bg-gray-100 text-gray-700"
          actionBgColor="hover:bg-gray-300"
          onDelete={() => removeTag(position)}
        >
          {getLabel(tag)}
        </Tag>
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
      {map(value, renderTag)}
      {renderDescription()}
    </div>
  );
};

export const SelectTagsModule: React.FC<SelectTagsModuleProps> = (props) => (
  <ConnectForm>
    {(formContext) => <SelectTagsModuleElement {...props} {...formContext} />}
  </ConnectForm>
);
