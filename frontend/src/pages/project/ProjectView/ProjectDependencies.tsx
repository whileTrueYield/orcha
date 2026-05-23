import React from "react";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { Project } from "types/graphql";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { LinkIcon } from "@heroicons/react/outline";

interface ProjectDependenciesProps {
  project: Project;
  className?: string;
}

export const ProjectDependencies: FCWithFragments<ProjectDependenciesProps> = (
  props
) => {
  const { project } = props;

  return (
    <div className={props.className}>
      <Link
        className="group my-1 flex flex-row items-center rounded-lg py-1 text-gray-700 transition duration-100 hover:text-brand-600 hover:underline"
        to={urlResolver.explorer.dependencies(
          project.organizationId.toString(),
          project.id
        )}
      >
        <LinkIcon className="mr-1 h-5 w-5" />
        Dependency Explorer
      </Link>
    </div>
  );
};

ProjectDependencies.fragments = {
  ProjectDependenciesFragment: gql`
    fragment ProjectDependenciesFragment on Project {
      id
      name
      organizationId
    }
  `,
};
