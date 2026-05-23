import React, { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import { gql, useQuery } from "@apollo/client";
import { QueryProjectedWorkflowDistributionArgs } from "types/graphql";
import { EmptyState } from "components/views/EmtpyState";
import { map } from "lodash";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  projectId: number;
  startDate: Date;
  stopDate: Date;
}

interface Datum {
  children?: Datum[];
  label: string;
  value?: number;
  color?: string;
}

export const ProjectedWorkflowDistribution: React.FC<Props> = (props) => {
  const { projectId, startDate, stopDate } = props;

  const { data, error } = useQuery<
    QueryReturnValue["projectedWorkflowDistribution"],
    QueryProjectedWorkflowDistributionArgs
  >(QUERY_GET_PROJECTED_WORKFLOW_DISTRIBUTION, {
    variables: {
      projectId,
      startDate,
      stopDate,
    },
  });

  const projectedWorkflowDistribution = data?.projectedWorkflowDistribution;

  const datum = useMemo(
    () =>
      map(
        projectedWorkflowDistribution,
        (dist): Datum => ({
          label: dist.workflow.name,
          value: dist.hours,
        })
      ),
    [projectedWorkflowDistribution]
  );

  if (error) {
    return <EmptyState title="Error" subTitle={error?.message} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="no tickets"
        subTitle="No expected deliveries for this period"
      />
    );
  }

  return (
    <div>
      <span className="text-lg text-gray-800">
        Projected Workflow Distribution
      </span>
      <div className="h-84">
        <ResponsivePie
          data={datum}
          margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
          id="label"
          value="value"
          cornerRadius={10}
          valueFormat={(value: number) => `${Math.round(value)} hrs`}
          borderColor="#f1f5f9"
          innerRadius={0.5}
          activeOuterRadiusOffset={8}
          borderWidth={4}
          colors={[
            "#a855f7",
            "#f59e0b",
            "#14b8a6",
            "#3b82f6",
            "#84cc16",
            "#ef4444",
            "#f43f5e",
          ]}
          enableArcLabels={true}
          arcLinkLabelsTextColor="#475569"
          arcLinkLabelsThickness={2}
          arcLabelsSkipAngle={10}
          theme={{
            labels: {
              text: {
                fontSize: 14,
                fontWeight: 600,
                fill: "white",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

const QUERY_GET_PROJECTED_WORKFLOW_DISTRIBUTION = gql`
  query ProjectedWorkflowDistribution(
    $projectId: Int!
    $startDate: DateTime!
    $stopDate: DateTime!
  ) {
    projectedWorkflowDistribution(
      projectId: $projectId
      startDate: $startDate
      stopDate: $stopDate
    ) {
      workflow {
        id
        name
      }
      hours
    }
  }
`;
