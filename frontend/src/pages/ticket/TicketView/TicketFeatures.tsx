import React from "react";
import { gql } from "@apollo/client";
import { GroupTag } from "components/tags/GroupTag";
import { map } from "lodash";
import { FCWithFragments } from "types";
import {
  Feature,
  MiniFeature,
  MutationAddTicketFeaturesArgs,
  MutationRemoveTicketFeaturesArgs,
  Ticket,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { PlusIcon } from "@heroicons/react/solid";
import { FeatureSelect } from "components/fields/FeatureSelect";
import { Listbox } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  ticket: Ticket;
  productId: number;
  description?: string;
  className?: string;
  features: any[];
  readOnly?: boolean;
}

export const TicketFeatures: FCWithFragments<Props> = (props) => {
  const { features, description, className, ticket, productId, readOnly } =
    props;

  const [addFeatures] = useBlockingMutation<
    { addTicketFeatures: Ticket },
    MutationAddTicketFeaturesArgs
  >(MUTATE_ADD_FEATURES, {
    onError: onGraphQLError({ title: "Could not add feature" }),
    onCompleted: onMutationComplete({ title: "Feature added" }),
  });

  const [removeFeatures] = useBlockingMutation<
    { removeTicketFeatures: Ticket },
    MutationRemoveTicketFeaturesArgs
  >(MUTATE_REMOVE_FEATURES, {
    onError: onGraphQLError({ title: "Could not remove feature" }),
    onCompleted: onMutationComplete({ title: "Feature removed" }),
  });

  const ticketId = ticket.id;
  const featureIds = ticket.features.map((feature) => feature.id);

  const onChange = (miniFeature?: MiniFeature) => {
    if (miniFeature) {
      if (featureIds.indexOf(miniFeature.id) > -1) {
        onRemoveMiniFeature(miniFeature);
      } else {
        onAddMiniFeature(miniFeature);
      }
    }
  };

  const onAddMiniFeature = (miniFeature: MiniFeature) => {
    addFeatures({
      variables: {
        ticketId,
        featureIds: [miniFeature.id],
      },
    });
  };

  const onRemoveMiniFeature = (miniFeature: MiniFeature) => {
    removeFeatures({
      variables: {
        ticketId,
        featureIds: [miniFeature.id],
      },
    });
  };

  const onRemoveFeature = (feature: Feature) => {
    removeFeatures({
      variables: {
        ticketId,
        featureIds: [feature.id],
      },
    });
  };

  const renderFeature = (feature: Feature) => (
    <div className="inline-flex flex-row" key={`feature-${feature.id}`}>
      <GroupTag
        large
        className="mr-2 mt-2 text-brand-800 shadow-sm"
        groupBgColor="bg-brand-300 text-brand-900"
        bgColor="bg-brand-200"
        actionBgColor="bg-brand-300 hover:bg-brand-400 hover:text-brand-900"
        // cannot delete when in readOnly
        onDelete={readOnly ? undefined : () => onRemoveFeature(feature)}
        label={feature.name}
        groupLabel={feature.featureGroup.name}
      />
    </div>
  );

  const renderNoFeatures = () => (
    <div className="p-2">
      <div className="flex h-20 flex-col items-center justify-center p-1 text-gray-600">
        No features
        {readOnly ? null : (
          <div className="text-center text-sm text-gray-500">
            Click
            <PlusIcon className="mx-1 inline-block h-4 w-4 rounded bg-gray-300 leading-4" />
            to associate features
          </div>
        )}
      </div>
    </div>
  );

  const renderDescription = () => {
    if (description) {
      return (
        <div className="mt-2 ml-1 text-sm text-gray-500">{description}</div>
      );
    }

    return null;
  };

  const renderButton = (feature: MiniFeature | null) => (
    <div className="flex flex-row justify-between">
      <div className="text-lg text-gray-700">
        Features
        <span className="ml-2 font-normal text-gray-500">
          ({features.length})
        </span>
      </div>
      <Listbox.Button className="rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none focus:ring">
        <PlusIcon className="h-5 w-5 text-gray-700" />
      </Listbox.Button>
    </div>
  );

  if (readOnly) {
    return (
      <div className={className}>
        <div className="text-lg text-gray-700">
          Features
          <span className="ml-2 font-normal text-gray-500">
            ({features.length})
          </span>
        </div>
        {features.length ? map(features, renderFeature) : renderNoFeatures()}
        {renderDescription()}
      </div>
    );
  }

  return (
    <div className={className}>
      <FeatureSelect
        renderButton={renderButton}
        productId={productId}
        onChange={onChange}
        isSelected={(value) => featureIds.indexOf(value.id) > -1}
      />
      {features.length ? map(features, renderFeature) : renderNoFeatures()}
      {renderDescription()}
    </div>
  );
};

TicketFeatures.fragments = {
  TicketFeaturesFragment: gql`
    fragment TicketFeaturesFragment on Ticket {
      id
      features {
        id
        name
        featureGroup {
          id
          name
        }
      }
    }
  `,
};

const MUTATE_ADD_FEATURES = gql`
  mutation AddTicketFeatures($ticketId: Int!, $featureIds: [Int!]!) {
    addTicketFeatures(ticketId: $ticketId, featureIds: $featureIds) {
      ...TicketFeaturesFragment
    }
  }
  ${TicketFeatures.fragments.TicketFeaturesFragment}
`;

const MUTATE_REMOVE_FEATURES = gql`
  mutation RemoveTicketFeatures($ticketId: Int!, $featureIds: [Int!]!) {
    removeTicketFeatures(ticketId: $ticketId, featureIds: $featureIds) {
      ...TicketFeaturesFragment
    }
  }
  ${TicketFeatures.fragments.TicketFeaturesFragment}
`;
