import { Project, Ticket } from "types/graphql";
import { GQLClient } from "./GQLClient";
import { meRoleFragment } from "pages/auth/fragments";
import { without } from "lodash";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";

/**
 * Maintain the local role.preferences.recentlyVisited attribute
 * by adding recently visited tickets into the cache
 **/
export const useAddToRecentlyVisitedTicket = () => {
  const me = useSelector(getMe);

  /**
   * Maintain the local role.preferences.recentlyVisited attribute
   * by adding recently visited tickets into the cache
   **/
  return (ticket: Ticket) => {
    const code = ticket.product?.code || "";
    const localIdStr = `${ticket.localId || ""}`;
    const objectId = `ticket:${ticket.id}:${code}:${localIdStr}:${ticket.title}`;

    if (me?.role?.preferences) {
      GQLClient.cache.updateFragment(
        {
          id: `Role:${me.role.id}`,
          fragment: meRoleFragment,
        },
        (role) => {
          // in some cases (page load), the role isn't part of Apollo
          // cache while it might be in our redux state. This is a
          // workaround to avoid the error.
          // TODO: understand why loading me doesn't populate the role
          if (!role) return role;
          return {
            ...role,
            preferences: {
              ...role.preferences,
              recentlyVisited: [
                objectId,
                ...without(role.preferences.recentlyVisited, objectId),
              ],
            },
          };
        }
      );
    }
  };
};

/**
 * Maintain the local role.preferences.recentlyVisited attribute
 * by adding recently visited projects into the cache
 **/
export const useAddToRecentlyVisitedProject = () => {
  const me = useSelector(getMe);

  /**
   * Maintain the local role.preferences.recentlyVisited attribute
   * by adding recently visited projects into the cache
   **/
  return (project: Project) => {
    const objectId = `project:${project.id}:${project.name}`;

    if (me?.role?.preferences) {
      GQLClient.cache.updateFragment(
        {
          id: `Role:${me.role.id}`,
          fragment: meRoleFragment,
        },
        (role) => {
          // in some cases (page load), the role isn't part of Apollo
          // cache while it might be in our redux state. This is a
          // workaround to avoid the error.
          // TODO: understand why loading me doesn't populate the role
          if (!role) return role;
          return {
            ...role,
            preferences: {
              ...role.preferences,
              recentlyVisited: [
                objectId,
                ...without(role.preferences.recentlyVisited, objectId),
              ],
            },
          };
        }
      );
    }
  };
};
