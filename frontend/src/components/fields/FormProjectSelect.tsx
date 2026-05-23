import { useEffect, useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { gql, useQuery } from "@apollo/client";
import { MiniProject } from "types/graphql";
import { CheckIcon, FolderIcon, SelectorIcon } from "@heroicons/react/solid";
import { findIndex, sortBy, sortedUniq } from "lodash";
import { useFormContext } from "react-hook-form";
import fuzzysort from "fuzzysort";
import { useProjectPath } from "utils/project";
import { QueryReturnValue } from "types/queryTypes";

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  name: string;
  label: string;
}

interface ProjectWithPaths extends MiniProject {
  path: string;
}

export const FormProjectSelect: React.FC<Props> = (props) => {
  const { name, label } = props;
  const [query, setQuery] = useState("");
  const getProjectPath = useProjectPath();

  const { register, setValue, watch } = useFormContext();

  const { data } = useQuery<QueryReturnValue["miniProjects"]>(
    GET_MINI_PROJECTS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    register(name);
  }, [register, name]);

  const setSelectedProject = (value: string) => {
    setValue(name, value);
  };

  const value = watch(name);

  const projectWithPaths = useMemo((): ProjectWithPaths[] => {
    const projects: ProjectWithPaths[] = [];

    if (data?.miniProjects) {
      for (const project of data.miniProjects) {
        projects.push({
          path: [...getProjectPath(project), project.name].join("/"),
          ...project,
        });
      }
    }

    return sortedUniq(sortBy(projects));
  }, [data, getProjectPath]);

  const filteredProjects = useMemo((): ProjectWithPaths[] => {
    if (query) {
      const results = fuzzysort.go(query, projectWithPaths, {
        key: "path",
        limit: 10,
        threshold: -Infinity,
      });
      return results.map((r) => r.obj);
    } else {
      return projectWithPaths;
    }
  }, [projectWithPaths, query]);

  const projectExists = (project: MiniProject) => {
    return findIndex(filteredProjects, { id: project.id }) > -1;
  };

  const renderIfNoExactMatch = () => {
    if (query && filteredProjects.length === 0) {
      return (
        <Combobox.Option
          value={query}
          className={({ active }) =>
            classNames(
              "relative flex cursor-default select-none flex-row justify-between py-2 pl-3 pr-9",
              active
                ? "bg-brand-600 text-white focus:ring-opacity-25"
                : "text-gray-900"
            )
          }
        >
          {({ active, selected }) => (
            <>
              <span
                className={classNames(
                  "block truncate",
                  selected && "font-semibold"
                )}
              >
                {query}
              </span>
              <span
                className={classNames(
                  "rounded px-1 py-0.5 text-xs font-bold tracking-wide ",
                  selected || active
                    ? "bg-brand-700 text-gray-50"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                New
              </span>
            </>
          )}
        </Combobox.Option>
      );
    }

    return null;
  };

  return (
    <Combobox
      as="div"
      className="relative"
      value={value}
      onChange={setSelectedProject}
    >
      <Combobox.Label className="text-sm font-medium text-gray-700">
        {label}
      </Combobox.Label>

      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-8 pr-10 text-gray-600 shadow-sm focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(value: string) => value}
          spellCheck={false}
        />
        <Combobox.Button className="right-l absolute inset-y-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FolderIcon className="h-5 w-5 text-yellow-400" />
        </Combobox.Button>
        {!value || projectExists(value) ? null : (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold tracking-wide text-gray-600">
              New
            </div>
          </div>
        )}
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredProjects.map((project) => (
            <Combobox.Option
              key={project.id}
              value={project}
              className={({ active }) =>
                classNames(
                  "relative cursor-default select-none py-2 pl-3 pr-9",
                  active
                    ? "bg-brand-600 text-white focus:ring-opacity-25"
                    : "text-gray-900"
                )
              }
            >
              {({ active, selected }) => (
                <>
                  <span
                    className={classNames(
                      "block truncate",
                      selected && "font-semibold"
                    )}
                  >
                    {project.path}
                  </span>

                  {selected && (
                    <span
                      className={classNames(
                        "absolute inset-y-0 right-0 flex items-center pr-4",
                        active
                          ? "text-white"
                          : "text-brand-600 focus:ring-opacity-25"
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
          {renderIfNoExactMatch()}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export const GET_MINI_PROJECTS_QUERY = gql`
  query GetMiniProjectsForFormProjectSelect {
    miniProjects {
      id
      name
      parentId
    }
  }
`;
