import React, { useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { Panel, PanelBody } from "components/views/Panel";
import gql from "graphql-tag";
import { FCWithFragments } from "types";
import {
  ScheduleConfig,
  MutationUpdateScheduleConfigArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { ScheduleFilter, ScheduleConfigForm } from "./ScheduleConfigForm";
import { map, orderBy } from "lodash";
import { useBlockingMutation } from "utils/graphql";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { usePageTitle } from "hooks/usePageTitle";
import { MenuIcon } from "@heroicons/react/outline";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";
import { QueryReturnValue } from "types/queryTypes";

interface Props {}

interface ScheduleConfigs {
  id: number;
  filter: ScheduleFilter;
}

export const ScheduleConfigView: FCWithFragments<Props> = (props) => {
  usePageTitle("Scheduler Config");
  const [scheduleConfigs, _setScheduleConfigs] = useState<ScheduleConfigs[]>(
    []
  );
  const [lastId, setLastId] = useState(0);
  const [draggedItem, setDraggedItem] = useState<ScheduleConfigs | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const parent = useRef<HTMLUListElement>(null);

  const setScheduleConfigs = (
    scheduleConfigs: ScheduleConfigs[],
    dirty: boolean = true
  ) => {
    _setScheduleConfigs(scheduleConfigs);
    activateNavConfirmation(dirty);
  };

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  const createId = (): number => {
    setLastId(lastId + 1);
    return lastId;
  };

  const { data } = useQuery<QueryReturnValue["scheduleConfigs"]>(
    GET_SCHEDULE_CONFIG_QUERY,
    {
      fetchPolicy: "cache-and-network",
      onError: onGraphQLError({ title: "Could not retrieve priority filters" }),
      onCompleted: ({ scheduleConfigs }) => {
        const sortedConfigs: ScheduleConfig[] = orderBy(
          scheduleConfigs,
          "priority"
        );
        setScheduleConfigs(
          sortedConfigs.map(
            ({ products, workflows, tickets, tags, id, projects }) => ({
              id,
              filter: {
                recordSets: {
                  projects: projects.map((e) => ({ id: e.id, label: e.name })),
                  products: products.map((e) => ({ id: e.id, label: e.name })),
                  workflows: workflows.map((e) => ({
                    id: e.id,
                    label: e.name,
                  })),
                  tickets: tickets.map((e) => ({
                    id: e.id,
                    label: e.title,
                  })),
                  tags: tags.map((e) => ({ id: e.id, label: e.name })),
                },
                dates: {},
                flags: {},
                valueSets: {},
              },
            })
          ),
          false
        );
      },
    }
  );

  const onReset = () => {
    const scheduleConfigs = data?.scheduleConfigs || [];
    setScheduleConfigs(
      scheduleConfigs.map(
        ({ products, workflows, tickets, tags, priority, id, projects }) => ({
          priority,
          id,

          filter: {
            recordSets: {
              tickets: tickets.map((e) => ({ id: e.id, label: e.title })),
              projects: projects.map((e) => ({ id: e.id, label: e.name })),
              products: products.map((e) => ({ id: e.id, label: e.name })),
              workflows: workflows.map((e) => ({ id: e.id, label: e.name })),
              tags: tags.map((e) => ({ id: e.id, label: e.name })),
            },
            dates: {},
            flags: {},
            valueSets: {},
          },
        })
      ),
      false
    );
  };

  const moveUp = (scheduleConfig: ScheduleConfigs, index: number) => {
    if (index + 1 < scheduleConfigs.length) {
      scheduleConfigs[index] = scheduleConfigs[index + 1];
      scheduleConfigs[index + 1] = scheduleConfig;
      setScheduleConfigs([...scheduleConfigs]);
    }
  };

  const moveDown = (scheduleConfig: ScheduleConfigs, index: number) => {
    if (index > 0) {
      scheduleConfigs[index] = scheduleConfigs[index - 1];
      scheduleConfigs[index - 1] = scheduleConfig;
      setScheduleConfigs([...scheduleConfigs]);
    }
  };

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedItem(scheduleConfigs[index]);
    event.dataTransfer.effectAllowed = "move";
    if (event.currentTarget.parentNode) {
      event.dataTransfer.setData(
        "text/html",
        event.currentTarget.parentNode.parentNode as any
      );
      event.dataTransfer.setDragImage(
        event.currentTarget.parentNode.parentNode as any,
        20,
        20
      );
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();

    if (isMoving) {
      return;
    }

    if (!draggedItem) {
      return;
    }

    const draggedOverItem = scheduleConfigs[index];

    // if the item is dragged over itself, ignore
    if (draggedItem === draggedOverItem) {
      return;
    }

    let items = scheduleConfigs.filter((item) => item !== draggedItem);

    // add the dragged item after the dragged over item
    items.splice(index, 0, draggedItem);

    setScheduleConfigs(items);
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 250);
  };

  const onDragEnd = () => setDraggedItem(null);

  const [updateScheduleConfig] = useBlockingMutation<
    { updateScheduleConfig: ScheduleConfig[] },
    MutationUpdateScheduleConfigArgs
  >(MUTATION_UPDATE_SCHEDULE_PRIORITY, {
    onCompleted: onMutationComplete({
      title: "Schedule Priority updated",
      callback: () => activateNavConfirmation(false),
    }),
    onError: onGraphQLError({
      title: "Schedule priority update failed",
    }),
  });

  const onSave = () => {
    updateScheduleConfig({
      variables: {
        input: {
          configs: map(scheduleConfigs, (p, index) => ({
            priority: index + 1,
            projectIds: map(p.filter.recordSets.projects, "id"),
            productIds: map(p.filter.recordSets.products, "id"),
            workflowIds: map(p.filter.recordSets.workflows, "id"),
            tagIds: map(p.filter.recordSets.tags, "id"),
            paths: map(p.filter.valueSets.paths, "value"),
            ticketIds: map(p.filter.recordSets.tickets, "id"),
          })),
        },
      },
    });
  };

  return (
    <div className="flex flex-col px-2 pb-6 sm:px-0">
      <WarningConfirm
        title="Discard Schedule Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to your schedule. Once discarded the changes are permanently lost"
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />

      <Panel>
        <PanelBody>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Scheduler Priority Setup
          </h3>
          <p className="py-4 text-sm text-gray-600">
            Here you may prioritize body of work using filters. The top elements
            have a higher priority than the lower ones. What is not prioritized
            will have the lowest priority. The scheduler will take in
            consideration your priorities as it organizes your team.
          </p>
          <ul ref={parent}>
            {scheduleConfigs.map((scheduleConfig, index) => (
              <li
                key={scheduleConfig.id}
                onDragOver={(event) => onDragOver(event, index)}
                className="my-4"
              >
                <div
                  className={`flex flex-row space-x-2 rounded-lg border p-4 pl-2 sm:pl-4 ${
                    draggedItem === scheduleConfig
                      ? "border-brand-400 bg-brand-200"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex-0 flex flex-col items-center justify-around">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveDown(scheduleConfig, index)}
                        className="rounded-md p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring sm:p-1 sm:px-1.5"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                    )}
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                      title="move priority"
                      className="hidden cursor-move rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring sm:block"
                    >
                      <MenuIcon className="h-5 w-5" />
                    </div>
                    {index + 1 < scheduleConfigs.length && (
                      <button
                        type="button"
                        onClick={() => moveUp(scheduleConfig, index)}
                        className="rounded-md p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring sm:p-1 sm:px-1.5"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <ScheduleConfigForm
                    onDelete={() => {
                      scheduleConfigs.splice(index, 1);
                      setScheduleConfigs([...scheduleConfigs]);
                    }}
                    filter={scheduleConfig.filter}
                    onChange={(filter) => {
                      scheduleConfigs.splice(index, 1, {
                        ...scheduleConfig,
                        filter,
                      });

                      setScheduleConfigs([...scheduleConfigs]);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="py-4">
            <button
              type="button"
              onClick={() =>
                setScheduleConfigs([
                  ...scheduleConfigs,
                  {
                    id: createId(),
                    filter: {
                      recordSets: {
                        projects: [],
                        products: [],
                        workflows: [],
                        tickets: [],
                        tags: [],
                      },
                      dates: {},
                      flags: {},
                      valueSets: {},
                    },
                  },
                ])
              }
              className="w-full rounded-lg border-2 border-dashed p-4 text-center text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              Click to add a new Schedule Priority
            </button>
          </div>
          <div className="mt-4 flex flex-row justify-between space-x-2">
            <Button onClick={onReset} type="button" btnType="secondaryWhite">
              Reset
            </Button>
            <Button type="button" btnType="primary" onClick={onSave}>
              Apply Priority
            </Button>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
};

ScheduleConfigView.fragments = {
  ScheduleConfigFragment: gql`
    fragment ScheduleConfigFragment on ScheduleConfig {
      id
      priority
      products {
        id
        name
        code
      }

      projects {
        id
        name
        parentId
      }

      tags {
        id
        name
      }

      workflows {
        id
        name
      }

      tickets {
        id
        title
      }
    }
  `,
};

const GET_SCHEDULE_CONFIG_QUERY = gql`
  query GetScheduleConfigs {
    scheduleConfigs {
      ...ScheduleConfigFragment
    }
  }
  ${ScheduleConfigView.fragments.ScheduleConfigFragment}
`;

const MUTATION_UPDATE_SCHEDULE_PRIORITY = gql`
  mutation UpdateScheduleConfig($input: UpdateScheduleConfigs!) {
    updateScheduleConfig(input: $input) {
      ...ScheduleConfigFragment
    }
  }
  ${ScheduleConfigView.fragments.ScheduleConfigFragment}
`;
