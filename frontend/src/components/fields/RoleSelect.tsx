import React, { useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { MiniRole } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { reject } from "lodash";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import fuzzysort from "fuzzysort";
import { convertToMiniRole } from "./convertToMini";
import { HighlightMatch } from "./HighlightMatch";
import cn from "classnames";
import { Tag } from "components/tags/Tag";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { QueryReturnValue } from "types/queryTypes";

const GET_MINI_ROLES = gql`
  query GetMiniRoles {
    miniRoles {
      id
      name
      title
      avatarUrl
    }
  }
`;

interface Props {
  label?: string;
  tabIndex?: number;
  value?: MiniRole | null;
  onChange: (value: MiniRole | null) => void;
  className?: string;
  placeholder?: string;
  includeMe?: boolean;
  disabled?: boolean;
  showDeleteButton?: boolean;
}

export const RoleSelect: React.FC<Props> = (props) => {
  const { includeMe, showDeleteButton } = props;
  const [search, setSearch] = useState("");
  const me = useSelector(getMe);
  const [showConfirmDelete, setConfirmDelete] = useState(false);

  const { data, error } = useQuery<QueryReturnValue["miniRoles"]>(
    GET_MINI_ROLES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const roles = useMemo((): MiniRole[] => {
    if (data?.miniRoles) {
      let allRoles = data.miniRoles;

      if (includeMe && !search && me?.role) {
        allRoles = [
          convertToMiniRole(me.role),
          ...reject(data.miniRoles, { id: me.role.id }),
        ];
      }

      if (search) {
        const results = fuzzysort.go(search, allRoles, {
          key: "name",
          limit: 10,
          threshold: -Infinity,
        });

        return results.map((r) => r.obj);
      } else {
        return allRoles;
      }
    }
    return [];
  }, [data, me, includeMe, search]);

  if (error) {
    return null;
  }

  const searchHeader = () => {
    if (search || roles.length > 4) {
      return <ObjectSelectSearch onChange={setSearch} />;
    }
  };

  const renderLabel = (
    role?: MiniRole,
    isActive?: boolean,
    isSelected?: boolean
  ) => {
    if (role) {
      const activeState = isActive || isSelected;
      const tagClass = cn("text-xs truncate rounded-md px-1 py-0.5", {
        "bg-gray-200 text-gray-800": !activeState,
        "bg-brand-800 text-brand-50": activeState,
      });

      if (role.id === me?.role?.id) {
        return (
          <span className="flex min-w-0 flex-row justify-between">
            <div className="shrink-0 truncate">
              <HighlightMatch value={role.name} query={search} />
            </div>
            <Tag className={tagClass}>me</Tag>
          </span>
        );
      } else if (role.title) {
        return (
          <span className="flex min-w-0 flex-row items-center justify-between space-x-2">
            <div className="shrink-0 truncate">
              <HighlightMatch value={role.name} query={search} />
            </div>
            <span title={role.title} className={tagClass}>
              {role.title}
            </span>
          </span>
        );
      } else {
        return <HighlightMatch value={role.name} query={search} />;
      }
    }
    return "";
  };

  return (
    <>
      <WarningConfirm
        title="Confirm Remove"
        description="Are you sure you want to remove this person?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => props.onChange(null)}
        cta="Remove"
        visible={showConfirmDelete}
      />
      <ObjectSelect<MiniRole>
        className={props.className}
        tabIndex={props.tabIndex}
        label={props.label}
        disabled={props.disabled}
        header={searchHeader()}
        items={roles}
        value={props.value}
        onChange={props.onChange}
        identityMethod={(role) => (role ? role.id : null)}
        renderOptionLabel={renderLabel}
        placeholder={props.placeholder}
        onDelete={showDeleteButton ? () => setConfirmDelete(true) : undefined}
      />
    </>
  );
};
