import React, { useEffect, useMemo, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { debounce, findIndex, indexOf, map, sortBy, without } from "lodash";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { FCWithFragments } from "types";
import {
  ChecklistItem,
  MutationSetChecklistArgs,
  TicketWorkflowState,
} from "types/graphql";
import * as yup from "yup";
import { onGraphQLError } from "utils/GQLClient";
import { TicketChecklistItem } from "./TicketChecklistItem";
import {
  ChevronLeftIcon,
  PlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
  ticketWorkflowState?: TicketWorkflowState | null;
  ticketWorkflowStates: TicketWorkflowState[];
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: yup.string().required().max(128).label("Checklist Item"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

const getStateIndex = (
  ticketWorkflowStates: TicketWorkflowState[],
  ticketWorkflowState: TicketWorkflowState
): number => findIndex(ticketWorkflowStates, { id: ticketWorkflowState?.id });

export const TicketChecklists: FCWithFragments<Props> = (props) => {
  const { className } = props;

  const ticketWorkflowStates = useMemo(
    () => sortBy(props.ticketWorkflowStates, "position"),
    [props.ticketWorkflowStates]
  );

  // default to first state if no current workflow state exist
  const ticketWorkflowState = props.ticketWorkflowState
    ? props.ticketWorkflowState
    : ticketWorkflowStates[0];

  // the state index can be change to visit other state checklist
  const [stateIndex, setStateIndex] = useState<number>(
    getStateIndex(ticketWorkflowStates, ticketWorkflowState)
  );

  const currentState = ticketWorkflowStates[stateIndex];
  const { checklist } = currentState;

  // we want to maintain the items in a local state but we also want to
  // flush it when the checklist itself changes
  const [items, setItems] = useState(checklist);
  useEffect(
    () => setItems(currentState ? currentState.checklist : []),
    [currentState, setItems]
  );

  const [isFormVisible, setFormVisible] = useState<boolean>(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });
  const { register, getValues, handleSubmit } = formMethods;

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
    setChecklist({
      variables: {
        ticketWorkflowStateId: currentState.id,
        input: itemList,
      },
    });

    // optimistic update
    setItems(itemList);
  };

  const addItem = (item: ChecklistItem) => {
    const itemList = map([...items, item], marshalItem);

    setChecklist({
      variables: {
        ticketWorkflowStateId: currentState.id,
        input: itemList,
      },
    });

    // optimistic update
    setItems(itemList);
  };

  const removeItem = (item: ChecklistItem) => () => {
    const itemList = map(without(items, item), marshalItem);

    setChecklist({
      variables: {
        ticketWorkflowStateId: currentState.id,
        input: itemList,
      },
    });

    // optimistic update
    setItems(itemList);
  };

  const toggleItem = (item: ChecklistItem) => () => {
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

    setChecklist({
      variables: {
        ticketWorkflowStateId: currentState.id,
        input: itemList,
      },
    });

    // optimistic update
    setItems(itemList);
  };

  const [_setChecklist] = useMutation<
    MutationReturnValue["setChecklist"],
    MutationSetChecklistArgs
  >(MUTATE_SET_CHECKLIST_ON_TICKET, {
    onError: onGraphQLError({
      title: "Could not update checklist",
      callback: () => setItems(checklist), // rollback the changes
    }),
  });

  // we update the state optimistically which forces a react re-render
  // this allows us to maintain the debounce callback across the different
  // re-render since useMutation will return the same reference every time
  const setChecklist = useMemo(
    () => debounce(_setChecklist, 1000),
    [_setChecklist]
  );

  const renderHeader = () => (
    <div className="flex flex-row justify-between space-x-1">
      <div className="flex min-w-0 flex-row items-center space-x-2 text-base text-gray-700">
        <div
          className="flex-1 truncate font-semibold"
          title={currentState.name}
        >
          {stateIndex + 1}. {currentState.name}
        </div>

        {currentState.id === ticketWorkflowState.id ? (
          <span
            className="inline-block h-2 w-2 rounded-full bg-brand-500"
            title="current"
            sr-only="Current Workflow State"
          />
        ) : null}
      </div>
      <div className="shrink-0">
        <Button
          type="button"
          btnType="white"
          btnSize="xsmall"
          btnGroup="start"
          onClick={() =>
            stateIndex > 0 ? setStateIndex(stateIndex - 1) : null
          }
          disabled={stateIndex === 0}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          btnType="white"
          btnSize="xsmall"
          btnGroup="end"
          onClick={() =>
            stateIndex < ticketWorkflowStates.length - 1
              ? setStateIndex(stateIndex + 1)
              : null
          }
          disabled={stateIndex === ticketWorkflowStates.length - 1}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const onSubmit: SubmitHandler<{ name: string }> = (data) => {
    formMethods.reset();
    addItem({ label: data.name, checked: null });
  };

  const renderForm = () => (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          className="mt-2 w-full"
          // name="name"
          placeholder="e.g. Read post-mortem"
          autoFocus
          onKeyUp={(evt) => evt.key === "Escape" && setFormVisible(false)}
          {...register("name", {
            onBlur: (event) => {
              const isEmpty = event.currentTarget.value.trim().length === 0;
              if (isEmpty) {
                setFormVisible(false);
              } else {
                console.log(getValues()["name"]);
              }
            },
          })}
        >
          <Button type="submit" btnType="gray" btnGroup="end">
            Add
          </Button>
        </Input>
      </form>
    </FormProvider>
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

  const renderItemsAndForm = () => {
    if (items.length > 0) {
      return (
        <>
          {map(items, (item, index) => (
            <TicketChecklistItem
              checklistId={currentState.id}
              label={item.label}
              checked={item.checked}
              key={index}
              onEdit={(label) => editItem(label, index)}
              onRemove={removeItem(item)}
              onToggle={toggleItem(item)}
            />
          ))}
          {isFormVisible ? renderForm() : renderFormButton()}
        </>
      );
    } else {
      return isFormVisible ? renderForm() : renderFormButton();
    }
  };

  return (
    <div className={className}>
      {renderHeader()}
      {renderItemsAndForm()}
    </div>
  );
};

TicketChecklists.fragments = {
  TicketWorkflowStateChecklistFragment: gql`
    fragment TicketWorkflowStateChecklistFragment on TicketWorkflowState {
      id
      isActive
      position
      todo
      complete
      checklist {
        label
        checked
      }
    }
  `,
};

TicketChecklists.fragments.TicketChecklistFragment = gql`
  fragment TicketChecklistFragment on Ticket {
    id
    state {
      ...TicketWorkflowStateChecklistFragment
    }
  }
  ${TicketChecklists.fragments.TicketWorkflowStateChecklistFragment}
`;

const MUTATE_SET_CHECKLIST_ON_TICKET = gql`
  mutation SetChecklistOnTicket(
    $ticketWorkflowStateId: Int!
    $input: [UpdateChecklistInput]!
  ) {
    setChecklist(ticketWorkflowStateId: $ticketWorkflowStateId, input: $input) {
      ...TicketWorkflowStateChecklistFragment
    }
  }
  ${TicketChecklists.fragments.TicketWorkflowStateChecklistFragment}
`;
