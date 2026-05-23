import { useState } from "react";
import { gql } from "@apollo/client";

import { useQuery } from "@apollo/client";
import { onGraphQLError } from "utils/GQLClient";
import { FCWithFragments } from "types";
import { ProjectAnalyticTicketButtons } from "./ProjectAnalyticTickets";
import { usePageTitle } from "hooks/usePageTitle";
import { Tab, Tabs } from "components/fields/Tab";
import { QueryProjectArgs } from "types/graphql";
import { ProjectNextPeriod } from "./ProjectNextPeriod";
import { ProjectPreviousPeriod } from "./ProjectPreviousPeriod";
import { LoadingState } from "components/views/LoadingState";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  projectId: number;
}

const ProjectAnalyticView: FCWithFragments<Props> = (props) => {
  usePageTitle("Project Analytic View");
  const dispatch = useAppDispatch();

  const { projectId } = props;
  const [section, setSection] = useState<"previous" | "future">("future");

  const { data, loading } = useQuery<
    QueryReturnValue["project"],
    QueryProjectArgs
  >(GET_PROJECT_QUERY, {
    variables: { id: projectId },
    onError: onGraphQLError({ title: "Could not retrieve project" }),
  });

  if (loading) {
    return <LoadingState title="Analytic loading..." />;
  }

  const project = data?.project;

  return (
    <div>
      <ProjectAnalyticTicketButtons
        onEditTicket={(ticketId) => dispatch(showTicketEditModal(ticketId))}
        projectId={projectId}
      />

      <Tabs className="mt-4" layoutId="project-analytics">
        <Tab
          onClick={() => setSection("previous")}
          active={section === "previous"}
        >
          Recent Progress
        </Tab>
        <Tab onClick={() => setSection("future")} active={section === "future"}>
          Upcoming Work
        </Tab>
      </Tabs>

      {section === "future" ? (
        <div className="mt-4">
          <ProjectNextPeriod
            onEditTicket={(ticketId) => dispatch(showTicketEditModal(ticketId))}
            projectId={projectId}
            duration={project?.duration || 14}
          />
        </div>
      ) : (
        <div className="mt-4">
          <ProjectPreviousPeriod
            onEditTicket={(ticketId) => dispatch(showTicketEditModal(ticketId))}
            projectId={projectId}
            duration={project?.duration || 14}
          />
        </div>
      )}
    </div>
  );
};

ProjectAnalyticView.fragments = {
  ProjectAnalyticViewFragment: gql`
    fragment ProjectAnalyticViewFragment on Project {
      id
      checklist {
        label
        checked
      }
      name
      updatedAt
      owner {
        id
        name
        avatarUrl
      }
    }
  `,
};

const GET_PROJECT_QUERY = gql`
  query getProjectForAnalyticView($id: Int!) {
    project(id: $id) {
      id
      ...ProjectAnalyticViewFragment
    }
  }
  ${ProjectAnalyticView.fragments.ProjectAnalyticViewFragment}
`;

export default ProjectAnalyticView;
