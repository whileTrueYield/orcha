import React from "react";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { gql } from "@apollo/client";
import { MutationDeleteTeamArgs } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { ExclamationIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";

const DELETE_TEAM_MUTATION = gql`
  mutation DeleteTeam($teamId: Int!) {
    deleteTeam(teamId: $teamId)
  }
`;

interface Props extends ModalProps {
  teamId: number;
}

export const TeamDeleteModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  const [deleteTeam] = useBlockingMutation<
    { deleteTeam: boolean },
    MutationDeleteTeamArgs
  >(DELETE_TEAM_MUTATION, {
    onError: onGraphQLError({ title: "Team Deletion failed" }),
    onCompleted: onMutationComplete({
      title: "Team has been deleted",
      callback: () => history.push(urlResolver.team.listing(orgId)),
    }),
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deleteTeam({ variables: { teamId: props.teamId } });
  };

  return (
    <Modal {...props}>
      <form onSubmit={onSubmit}>
        <div className="p-6 sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Delete Team
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                Are you sure you want to delete this team? All tickets under
                this team will be permanantly destroyed. This action cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <Button
            className="sm:ml-3 sm:w-auto"
            fullInMobile
            type="submit"
            tabIndex={3}
            btnType="danger"
          >
            <TrashIcon className="mr-2 h-5 w-5" />
            Delete Team
          </Button>
          <Button
            onClick={props.onClose}
            type="button"
            tabIndex={4}
            btnType="secondaryWhite"
            fullInMobile
            className="mt-3 flex w-full sm:mt-0 sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
