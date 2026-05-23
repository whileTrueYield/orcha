import React, { FC, useMemo } from "react";
import {
  CustomMultiSelectGroup,
  RenderButtonParams,
} from "./CustomMultiSelectGroup";
import { useWatch } from "react-hook-form";
import { ConnectForm, FormContextType } from "../fields/ConnectForm";
import { map, without } from "lodash";
import { GroupTag } from "components/tags/GroupTag";
import { PlusIcon } from "@heroicons/react/solid";

export interface SelectGroupTagsModuleProps {
  label: string;
  name: string;
  description?: string;
  subtags: any[];
  getLabel: (tag: any) => string;
  getGroupLabel: (tag: any) => string;
  actionBgColor?: string;
  bgColor?: string;
  className?: string;
  groupBgColor?: string;
  round?: boolean;
  large?: boolean;
}

interface ElementProps extends SelectGroupTagsModuleProps {
  formContext: FormContextType;
}

const SelectGroupTagsModuleElement: FC<ElementProps> = (props) => {
  const {
    label,
    name,
    formContext,
    subtags,
    description,
    getLabel,
    getGroupLabel,
    bgColor,
    className,
    groupBgColor,
    actionBgColor,
    round,
    large,
  } = props;
  const { control, setValue } = formContext;
  const value = useWatch({ control, name }) || [];

  const options = useMemo(
    () =>
      map(subtags, (subtag) => ({
        value: subtag,
        label: getLabel(subtag),
        description: getGroupLabel(subtag),
      })),
    [subtags, getLabel, getGroupLabel]
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
      <button
        type="button"
        className="focus:ring-blue rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none"
        onClick={() => setOpen(!isOpen)}
      >
        <PlusIcon className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );

  const renderTag = (subTag: any, position: number) => {
    return (
      <div
        className="inline-flex flex-row"
        key={`tag-${getLabel(subTag)}-${getGroupLabel(subTag)}`}
      >
        <GroupTag
          large={large !== undefined ? large : true}
          round={round !== undefined ? round : false}
          className={className ? className : "mr-2 mt-2 text-gray-700"}
          groupBgColor={groupBgColor ? groupBgColor : "bg-gray-200"}
          bgColor={bgColor ? bgColor : "bg-gray-100"}
          actionBgColor={actionBgColor ? actionBgColor : "hover:bg-gray-300"}
          onDelete={() => removeTag(position)}
          label={getLabel(subTag)}
          groupLabel={getGroupLabel(subTag)}
        />
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

export const SelectGroupTagsModule: React.FC<SelectGroupTagsModuleProps> = (
  props
) => (
  <ConnectForm>
    {(formContext) => (
      <SelectGroupTagsModuleElement {...props} {...formContext} />
    )}
  </ConnectForm>
);
