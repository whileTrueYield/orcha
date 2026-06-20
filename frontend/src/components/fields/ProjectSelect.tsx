import { useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { gql, useQuery } from "@apollo/client";
import { MiniProject } from "types/graphql";
import { CheckIcon, SelectorIcon, FolderIcon } from "@heroicons/react/solid";
import { find, sortBy, sortedUniq } from "lodash";
import cn from "classnames";
import fuzzysort from "fuzzysort";
import { HighlightMatch } from "./HighlightMatch";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { useProjectPath } from "utils/project";
import { XIcon } from "@heroicons/react/solid";
import { QueryReturnValue } from "types/queryTypes";

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  value?: MiniProject | null;
  onChange: (value?: MiniProject) => void;
  label?: string;
  defaultId?: number;
  labelClassname?: string;
  inputClassName?: string;
  className?: string;
  tabIndex?: number;
  projectId?: number | null;
  showExploreLink?: boolean;
  showUnsetButton?: boolean;
  disabled?: boolean;
}

// this is so we can display the ancestors as
// grand-parent/parent/project
interface ProjectWithPath extends MiniProject {
  path: string;
}

export const ProjectSelect: React.FC<Props> = (props) => {
  const {
    label,
    labelClassname,
    onChange,
    tabIndex,
    projectId,
    showExploreLink,
    showUnsetButton,
    disabled,
  } = props;
  const [search, setSearch] = useState("");
  const { orgId } = useParams<{ orgId: string }>();
  const getProjectPath = useProjectPath();

  const { data } = useQuery<QueryReturnValue["miniProjects"]>(
    GET_MINI_PROJECTS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: ({ miniProjects }) => {
        if (props.defaultId) {
          const workflow = find(miniProjects, { id: props.defaultId });
          if (workflow) {
            props.onChange(workflow);
          }
        }
      },
    }
  );

  const projectWithPaths = useMemo((): ProjectWithPath[] => {
    const projects: ProjectWithPath[] = [];

    if (data?.miniProjects) {
      for (const project of data.miniProjects) {
        projects.push({
          path: [...getProjectPath(project), project.name].join("/"),
          ...project,
        });
      }
    }

    return sortedUniq(sortBy(projects, "path"));
  }, [data, getProjectPath]);

  const filteredProjects = useMemo((): ProjectWithPath[] => {
    if (search) {
      const results = fuzzysort.go(search, projectWithPaths, {
        key: "path",
        limit: 10,
        threshold: -Infinity,
      });
      return results.map((r) => r.obj);
    } else {
      return projectWithPaths;
    }
  }, [projectWithPaths, search]);

  const miniProjects = data?.miniProjects || [];

  const inputClassName = cn(
    "w-full rounded-md border border-gray-300 py-2 pr-10 pl-8 text-gray-600 shadow-sm focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm",
    props.inputClassName,
    {
      "cursor-not-allowed bg-gray-50": disabled,
      "bg-white": !disabled,
    }
  );

  const className = cn("relative", props.className);

  // this uses the provided value and fallsback on the provided projectId
  // if provided. This allow us to display the full path to a project
  // without consuming too much DB
  const findValue = (): MiniProject | undefined => {
    if (props.value) {
      return props.value;
    } else if (props.projectId) {
      return find(miniProjects, (project) => project.id === projectId);
    }
  };

  const value = findValue();

  const renderNoMatch = () => {
    return (
      <div className="flex h-12 items-center justify-center text-gray-400">
        No Matching Project :(
      </div>
    );
  };

  return (
    <Combobox
      value={value}
      onChange={(project) => onChange(project ?? undefined)}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          {label ? (
            <div className="flex flex-row items-baseline justify-between">
              <Combobox.Label
                className={
                  labelClassname || "mb-1 text-sm font-medium text-gray-700"
                }
              >
                {label}
              </Combobox.Label>
              {value && showExploreLink && (
                <Link
                  className="text-sm text-brand-700 hover:text-brand-600 hover:underline"
                  to={urlResolver.explorer.listing(orgId, value.id)}
                >
                  explore folder
                </Link>
              )}
            </div>
          ) : null}
          <div className={cn(className, { "z-30": open })}>
            <Combobox.Input
              aria-label="Select a project"
              className={inputClassName}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Select a project..."
              displayValue={(project: ProjectWithPath) =>
                project
                  ? [...getProjectPath(project), project.name].join("/")
                  : ""
              }
              spellCheck={false}
              tabIndex={tabIndex}
              autoComplete="off"
            />

            <Combobox.Button
              aria-label="Open list of projects"
              className="right-l absolute inset-y-0 flex items-center rounded-r-md px-2 focus:outline-none"
            >
              <FolderIcon className="h-5 w-5 text-yellow-400" />
            </Combobox.Button>

            {value && showUnsetButton ? (
              <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                <button
                  type="button"
                  onClick={() => props.onChange()}
                  aria-label="Unset project"
                  className="flex cursor-pointer items-center rounded p-0.5 text-gray-400 transition hover:bg-red-100 hover:text-red-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Combobox.Button
                aria-label="Open list of projects"
                className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
              >
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            )}

            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredProjects.length
                ? filteredProjects.map((project, index) => (
                    <Combobox.Option
                      key={index}
                      value={project}
                      className={({ focus }) =>
                        classNames(
                          "relative h-9 cursor-default select-none py-2 pl-3 pr-9",
                          focus
                            ? "bg-brand-600 text-white focus:ring-opacity-25"
                            : "text-gray-900"
                        )
                      }
                    >
                      {({ focus, selected }) => (
                        <>
                          <span
                            className={classNames(
                              "block truncate",
                              selected && "font-semibold"
                            )}
                          >
                            <HighlightMatch
                              value={project.path}
                              query={search}
                            />
                          </span>

                          {selected && (
                            <span
                              className={classNames(
                                "absolute inset-y-0 right-0 flex items-center pr-4",
                                focus
                                  ? "text-white"
                                  : "text-brand-600 focus:ring-opacity-25"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                : renderNoMatch()}
            </Combobox.Options>
          </div>
        </>
      )}
    </Combobox>
  );
};

export const GET_MINI_PROJECTS_QUERY = gql`
  query GetMiniProjectsForProjectSelect {
    miniProjects {
      id
      name
      parentId
    }
  }
`;
