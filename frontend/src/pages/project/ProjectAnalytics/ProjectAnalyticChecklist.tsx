import { useEffect, useMemo, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInputGroup } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { debounce, filter, indexOf, map, without } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { FCWithFragments } from "types";
import {
  ChecklistItem,
  Project,
  MutationSetProjectChecklistArgs,
} from "types/graphql";
import * as yup from "yup";
import { onGraphQLError } from "utils/GQLClient";
import { ProjectAnalyticChecklistItem } from "./ProjectAnalyticChecklistItem";
import { PlusIcon } from "@heroicons/react/solid";
import { Panel } from "components/views/Panel";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
  project: Project;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: yup.string().required().max(128).label("Checklist Item"),
  });
type FormSchema = yup.InferType<typeof schema>;

export const ProjectAnalyticChecklist: FCWithFragments<Props> = (props) => {
  const { className, project } = props;
  const { checklist } = project;

  // we want to maintain the items in a local state but we also want to
  // flush it when the checklist itself changes
  const [items, setItems] = useState(checklist);
  useEffect(() => setItems(checklist), [checklist]);

  const [isFormVisible, setFormVisible] = useState<boolean>(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  /**
   * Remove artefacts from items like __ITEM_TYPE__ by returning
   * known values only.
   * @param item ChecklistItem
   */
  const marshalItem = (item: ChecklistItem): ChecklistItem => ({
    label: item.label,
    checked: item.checked,
  });

  const editItem = (label: string, index: number) => {
    const itemsCopy = [...items];
    itemsCopy[index] = { ...items[index], label };
    const itemList = map([...itemsCopy], marshalItem);
    setProjectChecklist({
      variables: { projectId: project.id, input: itemList },
    });

    // optimistic update
    setItems(itemList);
  };

  const addItem = (item: ChecklistItem) => {
    const itemList = map([...items, item], marshalItem);

    setProjectChecklist({
      variables: { projectId: project.id, input: itemList },
    });

    // optimistic update
    setItems(itemList);
  };

  const removeItem = (item: ChecklistItem) => {
    const itemList = map(without(items, item), marshalItem);

    setProjectChecklist({
      variables: { projectId: project.id, input: itemList },
    });

    // optimistic update
    setItems(itemList);
  };

  const toggleItem = (item: ChecklistItem) => {
    const updatedItem = marshalItem(item);
    const itemList = map(items, marshalItem);
    const position = indexOf(items, item);

    if (item.checked === true) {
      updatedItem.checked = false;
    } else if (item.checked === false) {
      updatedItem.checked = null;
    } else {
      updatedItem.checked = true;
    }

    itemList.splice(position, 1, updatedItem);

    setProjectChecklist({
      variables: {
        projectId: project.id,
        input: itemList,
      },
    });

    // optimistic update
    setItems(itemList);
  };

  const [_setProjectChecklist] = useMutation<
    MutationReturnValue["setProjectChecklist"],
    MutationSetProjectChecklistArgs
  >(MUTATE_SET_CHECKLIST_ON_PROJECTANALYTIC, {
    onError: onGraphQLError({
      title: "Could not update checklist",
      callback: () => setItems(checklist), // rollback the changes
    }),
  });

  // we update the state optimistically which forces a react re-render
  // this allow us to maintain the debounce callback across the different
  // re-render since useMutation will return the same reference every time
  const setProjectChecklist = useMemo(
    () => debounce(_setProjectChecklist, 1000),
    [_setProjectChecklist]
  );
  // const setProjectChecklist = useDebouncedFunction(_setProjectChecklist, 1000);

  const onSubmit = (data: FormSchema) => {
    formMethods.reset();
    addItem({ label: data.name, checked: null });
  };

  const renderForm = () => (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <FormInputGroup
          className="mt-2 w-full"
          name="name"
          placeholder="Checklist item..."
          autoFocus
          onKeyUp={(evt) => evt.key === "Escape" && setFormVisible(false)}
        >
          <Button type="submit" btnType="gray" btnGroup="end">
            Add
          </Button>
        </FormInputGroup>
      </form>
    </FormProvider>
  );

  const renderNoItems = () => (
    <div className="p-2">
      <div
        className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-1 text-lg text-gray-500 hover:bg-gray-50 hover:text-gray-600"
        onClick={() => setFormVisible(true)}
      >
        No checklist items
        <div className="text-center text-sm text-gray-500">
          Click to create one
        </div>
      </div>
    </div>
  );

  const renderFormButton = () => (
    <Button
      onClick={() => setFormVisible(true)}
      block
      btnType="secondaryWhite"
      type="button"
      className="mt-2"
    >
      <PlusIcon className="mr-1 h-4 w-4" />
      Add checklist item
    </Button>
  );

  if (items.length === 0) {
    return (
      <div className={className}>
        <h2 className="mb-2 text-lg text-gray-800">Project Checklist</h2>
        <Panel className="p-4">
          {isFormVisible ? renderForm() : renderNoItems()}
        </Panel>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-2 flex flex-row justify-between">
        <div className="text-lg text-gray-800">Project Checklist</div>
        <div className="text-base text-gray-500">
          {filter(checklist, "checked").length} / {checklist.length} done
        </div>
      </h2>
      <Panel className="p-4">
        {map(items, (item, index) => (
          <ProjectAnalyticChecklistItem
            checklistItem={item}
            key={index}
            onEdit={(label) => editItem(label, index)}
            onRemove={removeItem}
            onToggle={toggleItem}
          />
        ))}
        {isFormVisible ? renderForm() : renderFormButton()}
      </Panel>
    </div>
  );
};

ProjectAnalyticChecklist.fragments = {
  ProjectAnalyticChecklistFragment: gql`
    fragment ProjectAnalyticChecklistFragment on Project {
      id
      checklist {
        label
        checked
      }
    }
  `,
};

const MUTATE_SET_CHECKLIST_ON_PROJECTANALYTIC = gql`
  mutation SetProjectAnalyticChecklist(
    $projectId: Int!
    $input: [UpdateProjectChecklistInput]!
  ) {
    setProjectChecklist(projectId: $projectId, input: $input) {
      id
      ...ProjectAnalyticChecklistFragment
    }
  }
  ${ProjectAnalyticChecklist.fragments.ProjectAnalyticChecklistFragment}
`;
