import { gql } from "@apollo/client";

/**
 * Here are centralize the values to be pulled for a
 * complete "Me" profile, including the role's avatar
 * it's workweek, preferences... from organization,
 * to user, to role.
 *
 * Use these definitions everytime you pull a Me
 * information and plan on updating the Me reducer
 */

export const meOrganizationFragment = gql`
  fragment meOrganizationFragment on Organization {
    id
    name
    scheduleStatus
    preferences {
      showOnboarding
    }
    onboardingStatus {
      invite
      product
      ticket
    }
  }
`;

export const meRoleFragment = gql`
  fragment meRoleFragment on Role {
    id
    name
    title
    type
    timeZone
    avatarUrl
    coverUrl
    preferences {
      showOnboarding
      recentlyVisited
      noteColors {
        YELLOW
        BLUE
        PURPLE
        GREEN
        PINK
        ORANGE
      }
    }
    pinnedProjects {
      id
      name
    }
    workWeek {
      monday {
        startTime
        stopTime
      }
      tuesday {
        startTime
        stopTime
      }
      wednesday {
        startTime
        stopTime
      }
      thursday {
        startTime
        stopTime
      }
      friday {
        startTime
        stopTime
      }
      saturday {
        startTime
        stopTime
      }
      sunday {
        startTime
        stopTime
      }
    }
  }
`;

export const meUserFragment = gql`
  fragment meUserFragment on User {
    id
    email
    status
    preferences {
      favoriteOrganizations
      lastOrganizationId
    }
  }
`;

export const meFragment = gql`
  fragment meFragment on Me {
    status
    user {
      id
      ...meUserFragment
    }
    organization {
      id
      ...meOrganizationFragment
    }
    role {
      id
      ...meRoleFragment
    }
  }
  ${meUserFragment}
  ${meOrganizationFragment}
  ${meRoleFragment}
`;
