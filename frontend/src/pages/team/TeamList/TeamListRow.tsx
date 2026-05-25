import React from "react";
import { truncate } from "lodash";
import { Link } from "react-router-dom";
import { SmartTime } from "components/views/Time";
import { Tag } from "components/tags/Tag";
import { Team } from "types/graphql";
import { Avatar } from "components/views/Avatar";

interface Props {
  team: Team;
  index: number;
  url: string;
}

export const TeamListRow: React.FC<Props> = (props) => {
  const description = truncate(props.team.description!, {
    length: 80,
    separator: " ",
  });

  const renderMemberAvatars = () => {
    const totalCount = props.team.members.length;
    const hasMore = totalCount > 3;

    const members = hasMore
      ? props.team.members.slice(0, 2)
      : props.team.members;

    const showMore = () => (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-400 ring-2 ring-white">
        +{totalCount - 2}
      </div>
    );

    return (
      <div className="absolute top-20 left-2 flex -space-x-2 overflow-hidden p-2">
        {members.map((member) => (
          <Avatar
            key={`member-${member.id}`}
            src={member.avatarUrl}
            className="inline-block h-12 w-12 rounded-md ring-2 ring-white"
            name={member.name}
          />
        ))}
        {hasMore ? showMore() : null}
      </div>
    );
  };

  return (
    <Link
      to={props.url}
      className="col-span-6 mx-4 flex transform flex-col rounded-lg bg-white shadow transition duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:scale-105 focus:shadow-lg focus:outline-none sm:col-span-3 sm:m-0 lg:col-span-2"
    >
      <div className="relative flex flex-1 flex-col">
        {props.team.coverUrl ? (
          <img
            className="h-32 w-full rounded-t-lg bg-gray-300 object-cover sm:h-36"
            src={props.team.coverUrl}
            alt=""
          />
        ) : (
          <div
            className="h-32 w-full rounded-t-lg bg-gray-300 sm:h-36"
            style={{ backgroundImage: "linear-gradient(#ebf2ff, #adbbbb)" }}
          />
        )}

        {renderMemberAvatars()}

        <div className="flex flex-1 flex-col rounded-b-md bg-white px-4 py-5 sm:p-6">
          <div className="flex flex-1 flex-row items-center justify-between text-xl">
            <div className="truncate text-gray-800">{props.team.name}</div>
            <Tag>{props.team.code}</Tag>
          </div>
          <div className="flex h-full flex-col justify-between">
            {props.team.description ? (
              <div className="mt-2 text-sm text-gray-600">
                <p>{description}</p>
              </div>
            ) : (
              <div />
            )}

            <div className="mt-2 text-sm text-gray-400">
              Last updated <SmartTime date={props.team.updatedAt} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
