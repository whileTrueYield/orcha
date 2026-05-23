import { gql, useQuery } from "@apollo/client";
import { InformationCircleIcon } from "@heroicons/react/solid";
import { formatDistance } from "date-fns";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
}

export const EstimatedAt: React.FC<Props> = (props) => {
  const { data } = useQuery<QueryReturnValue["organization"]>(
    GET_ESTIMATED_AT_QUERY,
    { fetchPolicy: "cache-and-network" }
  );

  const organization = data?.organization;

  if (organization) {
    if (organization.estimatedAt) {
      return (
        <span className={props.className}>
          <InformationCircleIcon className="relative -top-px mr-1 inline-block h-4 w-4 opacity-75" />
          Updated{" "}
          {formatDistance(new Date(organization.estimatedAt), new Date(), {
            addSuffix: true,
          })}
        </span>
      );
    } else {
      return <span className={props.className}>No estimates</span>;
    }
  }

  return null;
};

const GET_ESTIMATED_AT_QUERY = gql`
  query GetEstimateAtForListView {
    organization {
      id
      estimatedAt
    }
  }
`;
