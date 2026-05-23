import React, { useState } from "react";
import { gql } from "@apollo/client";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { FCWithFragments } from "types";
import { MiniProject, MutationUpdateTicketArgs, Ticket } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { convertToMiniProject } from "components/fields/convertToMini";
import { ConfirmModal } from "components/modals/ConfirmModal";

interface Props {
  ticket: Ticket;
  className?: string;
  readOnly?: boolean;
}

export const TicketProject: FCWithFragments<Props> = (props) => {
  const [newProject, setNewProject] = useState<MiniProject>();
  const { ticket } = props;

  const setProject = (projectId: number) => {
    updateTicket({
      variables: {
        input: {
          projectId,
        },
        ticketId: ticket.id,
      },
    });
  };

  const [updateTicket] = useBlockingMutation<
    { updateTicket: Ticket },
    MutationUpdateTicketArgs
  >(MUTATE_UPDATE_TICKET_PATH, {
    onError: onGraphQLError({
      title: "Could not update path",
    }),
    onCompleted: onMutationComplete({
      title: "Ticket's path has been updated",
    }),
  });

  // FIXME: the onChange should not need to handle the case when the project is null
  return (
    <div className={props.className}>
      <ConfirmModal
        title="Change ticket project?"
        description={`Please confirm you want to move this ticket to the project "${newProject?.name}" ?`}
        visible={!!newProject}
        onClose={() => setNewProject(undefined)}
        onConfirm={() => newProject && setProject(newProject.id)}
        cta="Move Ticket"
      />

      <ProjectSelect
        showExploreLink
        value={convertToMiniProject(ticket.project)}
        label="Folder"
        onChange={setNewProject}
        labelClassname="text-lg text-gray-700 mb-1"
      />
    </div>
  );
};

TicketProject.fragments = {
  TicketProjectFragment: gql`
    fragment TicketProjectFragment on Ticket {
      id
      project {
        id
        name
        parentId
      }
    }
  `,
};

const MUTATE_UPDATE_TICKET_PATH = gql`
  mutation UpdateTicketPath($input: UpdateTicketInput!, $ticketId: Int!) {
    updateTicket(input: $input, ticketId: $ticketId) {
      ...TicketProjectFragment
    }
  }
  ${TicketProject.fragments.TicketProjectFragment}
`;
