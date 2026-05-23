import { gql, useMutation, useQuery } from "@apollo/client";
import { Dialog } from "@headlessui/react";
import { TagIcon } from "@heroicons/react/outline";
import { Modal, ModalProps } from "components/modals/Modal";
import {
  find,
  intersectionBy,
  map,
  orderBy,
  reduce,
  reject,
  uniqBy,
} from "lodash";
import {
  MiniTag,
  MutationBatchUpdateTicketTagsArgs,
  QueryBatchGetTicketTagsArgs,
  Tag,
  Ticket,
} from "types/graphql";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { getColor } from "config";
import { Tag as TagElement } from "components/tags/Tag";
import { useState } from "react";
import { Label } from "components/fields/Label";
import { TagInput } from "../TicketView/TagInput";
import { Button } from "components/fields/Button";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { plural } from "utils/string";
import { RefreshIcon } from "@heroicons/react/solid";

interface Props extends ModalProps {
  ticketIds: number[];
}

interface BatchOperation {
  add: Array<Tag | MiniTag>;
  remove: Array<Tag | MiniTag>;
}

const initialOperation: BatchOperation = {
  add: [],
  remove: [],
};

export const TicketBatchEditTagsModal: React.FC<Props> = (props) => {
  const { ticketIds } = props;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [operations, setOperations] =
    useState<BatchOperation>(initialOperation);

  useQuery<QueryReturnValue["batchGetTicketTags"], QueryBatchGetTicketTagsArgs>(
    GET_BATCH_TICKET_TAGS,
    {
      variables: { ticketIds },
      onCompleted: ({ batchGetTicketTags }) => {
        setTickets(batchGetTicketTags);
        setOperations(initialOperation);
      },
    }
  );

  const [batchUpdateTicketTags] = useMutation<
    MutationReturnValue["batchUpdateTicketTags"],
    MutationBatchUpdateTicketTagsArgs
  >(UPDATE_BATCH_TICKET_TAGS, {
    refetchQueries: ["getExplorerForTicketListing", "GetTicketsForSearch"],
  });

  const addTag = (tag: MiniTag | Tag) => {
    setOperations({
      ...operations,
      add: uniqBy([...operations.add, tag], "id"),
    });
  };

  const removeTag = (tag: MiniTag | Tag, removeAll?: boolean) => {
    // if we added that tag, we will only delete the operation
    if (!removeAll && find(operations.add, { id: tag.id })) {
      setOperations({
        ...operations,
        add: reject(operations.add, { id: tag.id }),
      });
    } else {
      setOperations({
        remove: uniqBy([...operations.remove, tag], "id"),
        add: reject(operations.add, { id: tag.id }),
      });
    }
  };

  const allTags = uniqBy(
    [
      ...reduce(
        tickets,
        (acc: Array<Tag | MiniTag>, ticket) => [...acc, ...ticket.tags],
        []
      ),
      ...operations.add,
    ],
    "id"
  );

  const allAndRemovedTags = orderBy(
    allTags.filter((tag) => {
      if (find(operations.add, { id: tag.id })) {
        return true;
      }
      if (find(operations.remove, { id: tag.id })) {
        return false;
      }
      return true;
    }),
    "name"
  );

  const commonTags = reduce(
    tickets,
    (acc: Array<Tag | MiniTag>, ticket) =>
      intersectionBy(acc, ticket.tags, "id"),
    allAndRemovedTags
  );

  const commonAndAddedTags = orderBy(
    uniqBy([...commonTags, ...operations.add], "id"),
    "name"
  );

  const applyChanges = () => {
    batchUpdateTicketTags({
      variables: {
        ticketIds,
        addTagIds: map(operations.add, "id"),
        removeTagIds: map(operations.remove, "id"),
      },
      onCompleted: onMutationComplete({
        title: "Update done",
        subTitle: plural("{} ticket updated", "{} tickets updated", ticketIds),
        callback: props.onClose,
      }),
      onError: onGraphQLError({ title: "Could not update tags" }),
    });
  };

  return (
    <Modal {...props} large>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
          <TagIcon className="h-6 w-6 text-brand-600" />
        </div>
        <div className="mt-3sm:mt-0 flex-1 sm:ml-4">
          <Dialog.Title
            as="h3"
            className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
          >
            Batch Edit Tags
          </Dialog.Title>
          <p className="mt-4 text-sm text-gray-600">
            You can batch edit the tags associated with the tickets you have
            selected.
          </p>
          <p className="mt-2 hidden text-sm text-gray-600 sm:block">
            The <strong>All Tags</strong> section displays all the tags accross
            all the tickets, allowing you to remove any unwanted ones.
          </p>
          <p className="mt-2 hidden text-sm text-gray-600 sm:block">
            The <strong>Common Tags</strong> section displays only the tags
            common to all the tickets you have selected, allowing you to add new
            tags too all the tickets.
          </p>

          <div className="mt-4">
            <Label className="mb-1">Remove unwanted tags</Label>
            <div className="min-h-[38px] rounded-md border border-gray-300 pb-2 pl-2 shadow-sm">
              {allAndRemovedTags.map((tag) => {
                const colorSet = getColor(tag.color);

                return (
                  <TagElement
                    large
                    key={tag.id}
                    onDelete={() => removeTag(tag, true)}
                    className={`mr-2 mt-2 ${colorSet.textColor} ${colorSet.bgColor} shadow-sm sm:mt-1.5`}
                  >
                    {tag.name}
                  </TagElement>
                );
              })}
            </div>
          </div>
          <div className="mt-4">
            <Label className="mb-1">Add tags to all tickets</Label>
            <TagInput
              tags={commonAndAddedTags}
              onAddTag={addTag}
              label="Common Tags"
              onRemoveTag={removeTag}
            />
          </div>
          <div className="mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row">
            <Button
              onClick={() => setOperations(initialOperation)}
              type="button"
              btnType="secondaryWhite"
              tabIndex={5}
              fullInMobile
            >
              <RefreshIcon className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
            <div className="mt-3 space-y-3 sm:mt-0 sm:flex sm:flex-row-reverse sm:space-y-0">
              <Button
                type="button"
                onClick={applyChanges}
                btnType="primary"
                tabIndex={4}
                fullInMobile
                disabled={
                  operations.add.length + operations.remove.length === 0
                }
              >
                Apply Changes
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                tabIndex={5}
                className="sm:mr-2"
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const GET_BATCH_TICKET_TAGS = gql`
  query batchGetTicketTags($ticketIds: [Int]!) {
    batchGetTicketTags(ticketIds: $ticketIds) {
      id
      title
      tags {
        id
        name
        color
      }
    }
  }
`;

const UPDATE_BATCH_TICKET_TAGS = gql`
  mutation batchUpdateTicketTags(
    $ticketIds: [Int]!
    $addTagIds: [Int]!
    $removeTagIds: [Int]!
  ) {
    batchUpdateTicketTags(
      ticketIds: $ticketIds
      addTagIds: $addTagIds
      removeTagIds: $removeTagIds
    ) {
      id
      tags {
        id
        name
        color
      }
    }
  }
`;
