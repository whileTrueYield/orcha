import { useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { MiniRole } from "types/graphql";
import { Combobox } from "@headlessui/react";
import { difference, every, find, orderBy, union, without } from "lodash";
import { plural } from "utils/string";
import { Tag } from "components/tags/Tag";
import { Label } from "components/fields/Label";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useEffect } from "react";
import { QueryReturnValue } from "types/queryTypes";
import cn from "classnames";
import { Button } from "components/fields/Button";

interface Props {
  roleIds: number[];
  onChange: (roleIds: number[]) => void;
}

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

export const RoleComboInput: React.FC<Props> = (props) => {
  const { roleIds, onChange } = props;
  const [query, setQuery] = useState("");
  const [displayedRoles, setDisplayedRoles] = useState<MiniRole[]>([]);
  const [miniRoles, setMiniRoles] = useState<MiniRole[]>([]);
  const [focus, setFocus] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MiniRole | null>();
  const optionsRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useOutsideClick(optionsRef, () => setFocus(false));

  useQuery<QueryReturnValue["miniRoles"]>(GET_MINI_ROLES_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ miniRoles }) => setMiniRoles(orderBy(miniRoles, "name")),
  });

  const removeRole = (roleId: number) => {
    onChange(without(roleIds, roleId));
  };

  const addRole = (roleId: number) => {
    onChange([...roleIds, roleId]);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Backspace" && query === "" && roleIds.length > 0) {
          onChange(roleIds.slice(0, roleIds.length - 1));
        }
      };
      input.addEventListener("keydown", onKeyDown);
      return () => {
        input.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [roleIds, query, onChange]);

  useEffect(() => {
    if (query) {
      setDisplayedRoles(
        miniRoles.filter((miniRole) => {
          return `${miniRole.name} ${miniRole.title}`
            .toLowerCase()
            .includes(query.toLowerCase());
        })
      );
    } else {
      setDisplayedRoles(miniRoles);
    }
  }, [query, setDisplayedRoles, miniRoles]);

  const isSelected = (roleId: number) => roleIds.includes(roleId);

  const toggleRole = (miniRole: MiniRole) => {
    if (isSelected(miniRole.id)) {
      removeRole(miniRole.id);
    } else {
      addRole(miniRole.id);
    }
    setSelectedRole(null);
  };

  const renderOptions = (filteredRoles: MiniRole[]) => {
    if (filteredRoles.length) {
      const getClassName =
        (id: number) =>
        ({ active }: { active: boolean }) =>
          cn("cursor-default select-none py-2 px-3", {
            "bg-sky-600 text-white": active,
            "bg-sky-100 text-sky-700": isSelected(id) && !active,
            "text-gray-900": !active && !isSelected(id),
          });

      return filteredRoles.map((miniRole) => (
        <Combobox.Option
          value={miniRole}
          key={miniRole.id}
          className={getClassName(miniRole.id)}
        >
          {({ active }) => (
            <div className="flex flex-1 flex-row justify-between">
              <span
                className={classNames(
                  "block truncate",
                  isSelected(miniRole.id) && "font-semibold"
                )}
              >
                {miniRole.name}
              </span>
              <div className="flex flex-row space-x-1">
                {miniRole.title && (
                  <Tag
                    large
                    className={cn({
                      "bg-sky-700 text-white": active,
                      "bg-white text-sky-700":
                        isSelected(miniRole.id) && !active,
                      "bg-gray-100 text-gray-700":
                        !active && !isSelected(miniRole.id),
                    })}
                  >
                    {miniRole.title}
                  </Tag>
                )}
              </div>
            </div>
          )}
        </Combobox.Option>
      ));
    } else {
      return (
        <div className="p-2 text-center text-sm text-gray-400">
          No Match Found
        </div>
      );
    }
  };

  const renderRole = (roleId: number) => {
    const miniRole = find(miniRoles, { id: roleId });
    if (miniRole) {
      return (
        <Tag
          key={roleId}
          large
          className="ml-2 mb-2 bg-sky-600 text-white"
          onDelete={() => removeRole(roleId)}
          actionBgColor="bg-sky-700"
        >
          {miniRole.name}
        </Tag>
      );
    } else {
      return null;
    }
  };
  const toggleAll = () => {
    // if all are selected, then we can deselect all of them
    if (every(displayedRoles, (role) => roleIds.includes(role.id))) {
      onChange(
        difference(
          roleIds,
          displayedRoles.map((role) => role.id)
        )
      );
    } else {
      onChange(
        union(
          roleIds,
          displayedRoles.map((role) => role.id)
        )
      );
    }
  };

  return (
    <Combobox value={selectedRole} onChange={toggleRole}>
      {() => (
        <>
          <Combobox.Label className="block text-left">
            <Label className="mb-1">People</Label>
          </Combobox.Label>
          <div
            onClick={(event) => {
              event.currentTarget.querySelector("input")?.focus();
            }}
            className="rounded-md border border-gray-300 bg-white pr-2 pt-2 text-left shadow-sm sm:pt-1.5"
            ref={optionsRef}
          >
            {roleIds.map(renderRole)}

            <Combobox.Input
              placeholder="Search..."
              className="mb-2 ml-2 inline-block border-0 p-0 py-0.5 pl-1 text-sm text-gray-600 outline-none  placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 sm:mb-1.5"
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocus(true)}
              ref={inputRef}
              autoComplete="off"
              displayValue={() => query}
            />

            {focus && (
              <div className="relative">
                <Combobox.Options
                  static
                  className="absolute z-10 mt-1 w-full rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  <div className="max-h-60 overflow-auto py-1">
                    {renderOptions(displayedRoles)}
                  </div>
                  <div className="flex flex-row items-center justify-between rounded-b-md border-t bg-gray-100 p-2">
                    <span className="pl-2 text-sm font-medium text-gray-400">
                      {plural("{} role", "{} roles", displayedRoles)}
                    </span>
                    <Button btnSize="small" type="button" onClick={toggleAll}>
                      Toggle All
                    </Button>
                  </div>
                </Combobox.Options>
              </div>
            )}
          </div>
        </>
      )}
    </Combobox>
  );
};

const GET_MINI_ROLES_QUERY = gql`
  query GetMiniRoleForTicket {
    miniRoles {
      id
      name
      title
    }
  }
`;
