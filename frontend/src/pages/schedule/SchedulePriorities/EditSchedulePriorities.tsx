import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Panel, PanelBody } from "components/views/Panel";
import gql from "graphql-tag";
import { FCWithFragments, ScheduleConfigs } from "types";
import { ScheduleConfig } from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { orderBy } from "lodash";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { usePageTitle } from "hooks/usePageTitle";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  RefreshIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { ScheduleConfigForm } from "./ScheduleConfigForm";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { useSelector } from "react-redux";
import { getSchedulePriorities } from "reducers/selector";
import { resetSchedulePriorities, setSchedulePriorities } from "actions";
import { useAppDispatch } from "store";
import { swapItems } from "utils";
import { motion } from "framer-motion";
import { QueryReturnValue } from "types/queryTypes";

export const EditSchedulePriorities: FCWithFragments = () => {
  const dispatch = useAppDispatch();
  usePageTitle("Schedule - Priorities");

  const schedulePriorities = useSelector(getSchedulePriorities);

  const [currentScheduleConfigs, setCurrentScheduleConfigs] = useState<
    ScheduleConfigs[]
  >([]);

  const [isConfirmResetVisible, setConfirmResetVisible] = useState(false);
  const [isConfirmClearVisible, setConfirmClearVisible] = useState(false);

  const [lastId, setLastId] = useState(0);
  const { orgId } = useParams<{ orgId: string }>();

  const createId = (): number => {
    setLastId(lastId + 1);
    return lastId;
  };

  useQuery<QueryReturnValue["scheduleConfigs"]>(GET_SCHEDULE_CONFIG_QUERY, {
    fetchPolicy: "cache-and-network",
    onError: onGraphQLError({ title: "Could not retrieve priority filters" }),
    onCompleted: ({ scheduleConfigs }) => {
      const sortedConfigs: ScheduleConfig[] = orderBy(
        scheduleConfigs,
        "priority"
      );

      setCurrentScheduleConfigs(
        sortedConfigs.map(
          ({ products, workflows, tickets, tags, id, projects }) => ({
            id,
            filter: {
              recordSets: {
                projects: projects.map((e) => ({ id: e.id, label: e.name })),
                products: products.map((e) => ({ id: e.id, label: e.name })),
                workflows: workflows.map((e) => ({ id: e.id, label: e.name })),
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
        )
      );
    },
  });

  const scheduleConfigs = schedulePriorities
    ? schedulePriorities
    : currentScheduleConfigs;

  const moveUp = (index: number) => {
    if (index + 1 < scheduleConfigs.length) {
      dispatch(
        setSchedulePriorities(
          swapItems(
            scheduleConfigs,
            scheduleConfigs[index],
            scheduleConfigs[index + 1]
          )
        )
      );
    }
  };

  const moveDown = (index: number) => {
    if (index > 0) {
      dispatch(
        setSchedulePriorities(
          swapItems(
            scheduleConfigs,
            scheduleConfigs[index],
            scheduleConfigs[index - 1]
          )
        )
      );
    }
  };

  return (
    <div className="px-2 sm:px-0">
      <WarningConfirm
        title={`Undo Priority Changes?`}
        visible={isConfirmResetVisible}
        onClose={() => setConfirmResetVisible(false)}
        cta={`Yes, undo changes`}
        description="Confirm you want to undo Priority all the changes to the priorities. This action cannot be undo Priorityne."
        onConfirm={() => dispatch(resetSchedulePriorities())}
      />

      <WarningConfirm
        title={`Clear All Priorities?`}
        visible={isConfirmClearVisible}
        onClose={() => setConfirmClearVisible(false)}
        cta={`Yes, clear priorities`}
        description="Confirm you want to remove all priorities."
        onConfirm={() => dispatch(setSchedulePriorities([]))}
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
          <ul className="space-y-4">
            {scheduleConfigs.map((scheduleConfig, index) => (
              <motion.li
                key={scheduleConfig.id}
                layoutId={scheduleConfig.id.toString()}
                // onDragOver={(event) =>
                //   draggedItem !== scheduleConfig
                //     && onDragOver(event, index)
                // }
              >
                <div className="flex flex-row space-x-2 rounded-lg border bg-gray-100 p-4 pl-2 sm:pl-4">
                  <div className="flex-0 -my-2 flex flex-col items-center justify-around">
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      className="rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring disabled:bg-transparent disabled:opacity-30 sm:p-1 sm:px-1.5"
                      disabled={index === 0}
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                    <div className="font-semibold text-gray-400">
                      {index + 1}
                    </div>
                    {/* <div
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                      title="move priority"
                      className="hidden cursor-move rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring sm:block"
                    >
                      <MenuIcon className="h-5 w-5" />
                    </div> */}
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      className="rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 focus:bg-gray-300 focus:outline-none focus:ring disabled:bg-transparent disabled:opacity-30 sm:p-1 sm:px-1.5"
                      disabled={index + 1 >= scheduleConfigs.length}
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <ScheduleConfigForm
                    onDelete={() => {
                      scheduleConfigs.splice(index, 1);
                      dispatch(setSchedulePriorities([...scheduleConfigs]));
                    }}
                    filter={scheduleConfig.filter}
                    onChange={(filter) => {
                      scheduleConfigs.splice(index, 1, {
                        ...scheduleConfig,
                        filter,
                      });

                      dispatch(setSchedulePriorities([...scheduleConfigs]));
                    }}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="py-4">
            <button
              type="button"
              onClick={() =>
                dispatch(
                  setSchedulePriorities([
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
                )
              }
              className="w-full rounded-lg border-2 border-dashed p-4 text-center text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              Click to add a new Schedule Priority
            </button>
          </div>
        </PanelBody>
      </Panel>
      <div className="mt-4 hidden flex-row justify-between space-x-2 md:flex">
        <div className="flex flex-row space-x-2">
          <Button
            onClick={() => setConfirmResetVisible(true)}
            type="button"
            btnType="warning"
            disabled={schedulePriorities === null}
          >
            <RefreshIcon className="-ml-0.5 mr-1 h-4 w-4" />
            Undo Priority Changes
          </Button>

          <Button
            onClick={() => setConfirmClearVisible(true)}
            type="button"
            btnType="warning"
            disabled={scheduleConfigs.length === 0}
          >
            <TrashIcon className="-ml-0.5 mr-1 h-4 w-4" />
            Clear Priorities
          </Button>
        </div>
        <div className="flex flex-row space-x-2">
          <Button
            fullInMobile
            asElement={(className) => (
              <Link
                to={urlResolver.schedule.editTickets(orgId)}
                className={className}
              >
                <ChevronLeftIcon className="-ml-0.5 mr-1 h-4 w-4" />
                Tickets
              </Link>
            )}
            type="button"
            btnType="white"
          />
          <Button
            type="button"
            btnType="white"
            asElement={(className) => (
              <Link
                className={className}
                to={urlResolver.schedule.editProjections(orgId)}
              >
                Simulation
                <ChevronRightIcon className="-mr-0.5 ml-1 h-4 w-4" />
              </Link>
            )}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2 md:hidden">
        <Button
          onClick={() => setConfirmResetVisible(true)}
          type="button"
          btnType="warning"
          fullInMobile
          disabled={schedulePriorities === null}
        >
          <RefreshIcon className="-ml-0.5 mr-1 h-4 w-4" />
          Undo Priority Priority Changes
        </Button>

        <Button
          onClick={() => setConfirmClearVisible(true)}
          type="button"
          btnType="warning"
        >
          <TrashIcon className="-ml-0.5 mr-1 h-4 w-4" />
          Clear Priorities
        </Button>

        <Button
          fullInMobile
          asElement={(className) => (
            <Link
              to={urlResolver.schedule.editTickets(orgId)}
              className={className}
            >
              <ChevronLeftIcon className="-ml-0.5 mr-1 h-4 w-4" />
              Tickets
            </Link>
          )}
          type="button"
          btnType="white"
        />

        <Button
          type="button"
          fullInMobile
          btnType="white"
          asElement={(className) => (
            <Link
              className={className}
              to={urlResolver.schedule.editProjections(orgId)}
            >
              Preview
              <ChevronRightIcon className="-mr-0.5 ml-1 h-4 w-4" />
            </Link>
          )}
        />
      </div>
    </div>
  );
};

EditSchedulePriorities.fragments = {
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
  query GetScheduleConfigsForSchedule {
    scheduleConfigs {
      ...ScheduleConfigFragment
    }
  }
  ${EditSchedulePriorities.fragments.ScheduleConfigFragment}
`;
