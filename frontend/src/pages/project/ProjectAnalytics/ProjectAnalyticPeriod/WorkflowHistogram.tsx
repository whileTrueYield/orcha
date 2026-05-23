import { gql, useQuery } from "@apollo/client";
import { EmptyState } from "components/views/EmtpyState";
import { ResponsiveAreaBump } from "@nivo/bump";
import React, { useRef } from "react";
import { QueryTicketStatusHistogramArgs } from "types/graphql";
import { format, differenceInDays } from "date-fns";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  projectId: number;
  startDate: Date;
  stopDate: Date;
}

export const WorkflowHistogram: React.FC<Props> = (props) => {
  const { projectId, startDate, stopDate } = props;
  const mouseXPosition = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const period = differenceInDays(stopDate, startDate);
  const hiddenTicks = Math.max(1, Math.round(period / 30));

  const { data, error } = useQuery<
    QueryReturnValue["ticketStatusHistogram"],
    QueryTicketStatusHistogramArgs
  >(GET_TICKET_STATUS_HISTOGRAM_QUERY, {
    variables: {
      projectId,
      startDate,
      stopDate,
    },
  });

  if (error) {
    return <EmptyState title="Error" subTitle={error?.message} />;
  }

  const ticketStatusHistogram = data?.ticketStatusHistogram || [];

  const datum = ticketStatusHistogram.map((value) => ({
    id: value.workflow.name,
    data: value.values.map(({ date, value }) => ({
      x: date,
      y: value,
    })),
  }));

  const leftMargin = 100;

  return (
    <div>
      <span className="text-lg text-gray-800">Active tickets</span>
      <div className="relative h-96 w-full" ref={containerRef}>
        <ResponsiveAreaBump
          margin={{ top: 0, right: 100, bottom: 100, left: leftMargin }}
          data={datum}
          spacing={8}
          colors={[
            "#a855f7",
            "#f59e0b",
            "#14b8a6",
            "#3b82f6",
            "#84cc16",
            "#ef4444",
            "#f43f5e",
          ]}
          onMouseMove={(serie, event) =>
            (mouseXPosition.current = event.pageX - leftMargin)
          }
          blendMode="multiply"
          startLabel={(data) => data.id}
          endLabel={(data) => data.id}
          axisTop={null}
          borderWidth={3}
          activeBorderWidth={3}
          tooltip={(data) => {
            let dataSet = data.serie.points[0];
            const { left } = containerRef.current!.getBoundingClientRect();
            for (const point of data.serie.points) {
              if (point.x < mouseXPosition.current - left) {
                dataSet = point;
              }
            }

            return (
              <span className="flex flex-row items-center rounded border-2 border-gray-700 bg-white px-2 py-1 text-sm text-gray-700 shadow-md">
                <span
                  className="mr-1 inline-block h-3 w-3 border-2"
                  style={{
                    backgroundColor: data.serie.color,
                    borderColor: data.serie.borderColor,
                  }}
                ></span>
                {data.serie.id}: {dataSet?.data.y} tickets on{" "}
                {format(new Date(dataSet?.data.x), "LLL d")}
              </span>
            );
          }}
          enableGridX={false}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 66,
            legend: "",
            legendPosition: "middle",
            legendOffset: 32,
            format: (value) => {
              if (
                differenceInDays(new Date(value), startDate) % hiddenTicks ===
                0
              ) {
                return format(new Date(value), "LLL d");
              }
              return "";
            },
          }}
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

const GET_TICKET_STATUS_HISTOGRAM_QUERY = gql`
  query TicketStatusHistogram(
    $projectId: Int!
    $startDate: DateTime!
    $stopDate: DateTime!
  ) {
    ticketStatusHistogram(
      projectId: $projectId
      startDate: $startDate
      stopDate: $stopDate
    ) {
      workflow {
        id
        name
      }
      values {
        date
        value
      }
    }
  }
`;
