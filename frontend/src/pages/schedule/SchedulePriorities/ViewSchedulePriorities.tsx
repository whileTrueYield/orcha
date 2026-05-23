import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Panel, PanelBody } from "components/views/Panel";
import gql from "graphql-tag";
import { FCWithFragments, ScheduleConfigs } from "types";
import { ScheduleConfig } from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { orderBy } from "lodash";
import { usePageTitle } from "hooks/usePageTitle";
import { ScheduleConfigForm } from "./ScheduleConfigForm";
import { useSelector } from "react-redux";
import { getSchedulePriorities } from "reducers/selector";
import { QueryReturnValue } from "types/queryTypes";

export const ViewSchedulePriorities: FCWithFragments = () => {
  usePageTitle("Schedule - Priorities");

  const schedulePriorities = useSelector(getSchedulePriorities);

  const [currentScheduleConfigs, setCurrentScheduleConfigs] = useState<
    ScheduleConfigs[]
  >([]);

  useQuery<QueryReturnValue["scheduleConfigs"]>(GET_SCHEDULE_CONFIG_QUERY, {
    fetchPolicy: "cache-and-network",
    onError: onGraphQLError({ title: "Could not retrieve priority filters" }),
    onCompleted: ({ scheduleConfigs }) => {
      const sortedConfigs: ScheduleConfig[] = orderBy(
        scheduleConfigs,
        "priority",
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
          }),
        ),
      );
    },
  });

  const scheduleConfigs = schedulePriorities
    ? schedulePriorities
    : currentScheduleConfigs;

  return (
    <div className="px-2 sm:px-0">
      <Panel>
        <PanelBody>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Scheduler Priorities
          </h3>
          <p className="py-4 text-sm text-gray-600">
            Here you can view the current prioritization for the body of work.
            The top elements have a higher priority than the lower ones. What is
            not prioritized has the lowest priority.
          </p>
          <ul className="space-y-4">
            {scheduleConfigs.map((scheduleConfig, index) => (
              <div
                key={index}
                className="flex flex-row space-x-2 rounded-lg border bg-gray-100 p-4 pl-2 sm:pl-4"
              >
                <div className="flex-0 flex flex-col items-center justify-around space-y-2"></div>

                <ScheduleConfigForm filter={scheduleConfig.filter} />
              </div>
            ))}
          </ul>
        </PanelBody>
      </Panel>
    </div>
  );
};

ViewSchedulePriorities.fragments = {
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
  ${ViewSchedulePriorities.fragments.ScheduleConfigFragment}
`;
