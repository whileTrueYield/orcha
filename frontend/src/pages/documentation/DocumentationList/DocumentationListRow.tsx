import React from "react";
import { truncate } from "lodash";
import { Link } from "react-router-dom";
import { Documentation, ModelStage } from "types/graphql";
import { SmartTime } from "components/views/Time";
import {
  BanIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  documentation: Documentation;
  index: number;
  url: string;
}

export const DocumentationListRow: FCWithFragments<Props> = (props) => {
  const { documentation } = props;
  const description = truncate(documentation.description!, {
    length: 120,
    separator: " ",
  });

  return (
    <Link to={props.url} className="block hover:bg-gray-50">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
            <div>
              <p className="truncate text-sm font-medium text-indigo-600">
                {documentation.name}
              </p>
              <p className="mt-2 flex items-center truncate text-sm text-gray-500">
                {description}
              </p>
            </div>
            <div className="hidden md:block">
              <div>
                <p className="text-sm text-gray-900">
                  Updated on <SmartTime date={documentation.updatedAt} />
                </p>
                {documentation.stage === ModelStage.Published ? (
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <CheckCircleIcon
                      className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400"
                      aria-hidden="true"
                    />
                    Last published{" "}
                    <SmartTime
                      className="ml-1"
                      date={documentation.updatedAt}
                    />
                  </p>
                ) : (
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <BanIcon
                      className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    Not published
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <ChevronRightIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
};

DocumentationListRow.fragments = {
  DocumentationListRowFragment: gql`
    fragment DocumentationListRowFragment on Documentation {
      id
      name
      stage
      description
      lastPublishedAt
      updatedAt
    }
  `,
};
