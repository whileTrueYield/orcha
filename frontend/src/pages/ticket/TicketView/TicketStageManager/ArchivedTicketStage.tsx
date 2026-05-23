import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationUpdateTicketStageArgs,
  Ticket,
} from "types/graphql";
import { TicketStep } from "./TicketStageProgress";
import cn from "classnames";
import { ArchiveIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { WarningConfirm } from "components/modals/WarningConfirm";

interface Props {
  ticket: Ticket;
  steps: TicketStep[];
  updateTicketStage: (input: {
    variables: MutationUpdateTicketStageArgs;
  }) => void;
}

export const ArchivedTicketStage: FCWithFragments<Props> = (props) => {
  const { ticket, updateTicketStage } = props;
  const className = cn("rounded-lg shadow bg-gray-700");
  const [isRepublishWarningModalVisible, setIsRepublishWarningModalVisible] =
    useState(false);

  const onPublishTicket = () => {
    updateTicketStage({
      variables: { ticketId: ticket.id, stage: ModelStage.Published },
    });
  };

  return (
    <div className={className}>
      <WarningConfirm
        cta={`Yes, re-publish ticket`}
        description={`Are you sure you want to republish this ticket? This will allow you to change the assignment and re-schedule this ticket`}
        onConfirm={onPublishTicket}
        onClose={() => setIsRepublishWarningModalVisible(false)}
        title={`Republish ticket?`}
        visible={isRepublishWarningModalVisible}
      />
      <div className="flex flex-col space-y-4 p-4">
        <div className="text-center text-base font-medium text-gray-50">
          Archived Ticket
        </div>
        <div className="flex justify-center">
          <ArchiveIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-100">
          This ticket or its project has been archived, no more work may be done
          on it.
        </p>
        {/* <Button
          btnType="warning"
          onClick={() => setIsRepublishWarningModalVisible(true)}
          type="button"
        >
          <RefreshIcon className="w-4 h-4 mr-2" />
          re-publish Ticket
        </Button> */}
      </div>
    </div>
  );
};

ArchivedTicketStage.fragments = {
  archivedTicketStageFragment: gql`
    fragment archivedTicketStageFragment on Ticket {
      id
      stage
    }
  `,
};
