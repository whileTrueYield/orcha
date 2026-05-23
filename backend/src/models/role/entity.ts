import { Field, Int, ObjectType } from "type-graphql";
import {
  RoleType,
  RoleStatus,
  Role,
  Product,
  Workflow,
  Project,
} from "@generated/type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { logger } from "../../logger";

@ObjectType()
export class RoleWorkDay {
  @Field((_type) => String)
  startTime: string;

  @Field((_type) => String)
  stopTime: string;
}

@ObjectType()
export class WorkWeekTime {
  @Field((_type) => [RoleWorkDay])
  monday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  tuesday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  wednesday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  thursday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  friday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  saturday: RoleWorkDay[];

  @Field((_type) => [RoleWorkDay])
  sunday: RoleWorkDay[];
}

@ObjectType()
export class HabitProductWorkflow {
  @Field((_type) => Product)
  product: Product;

  @Field((_type) => Workflow)
  workflow: Workflow;
}

@ObjectType()
export class RoleHabit {
  @Field((_type) => [HabitProductWorkflow])
  productWorkflows: HabitProductWorkflow[];

  @Field((_type) => [Project])
  projects: Project[];
}

export const EMPTY_WORK_WEEK: WorkWeekTime = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export const DEFAULT_WORK_WEEK: WorkWeekTime = {
  monday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  tuesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  friday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  saturday: [],
  sunday: [],
};

export const roleStatuses = Object.values(RoleStatus);
export const roleTypes = Object.values(RoleType);

// This is a restricted role set to allow for fast
// queriying in the frontend using a fuzzy library
@ObjectType()
export class MiniRole {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;
}

@ObjectType()
export class PaginatedRoles extends PaginatedNodes {
  @Field(() => [Role])
  nodes: Role[];
}

@ObjectType()
export class RoleNoteColorPreferences {
  @Field((_type) => String)
  YELLOW: string;

  @Field((_type) => String)
  BLUE: string;

  @Field((_type) => String)
  PURPLE: string;

  @Field((_type) => String)
  GREEN: string;

  @Field((_type) => String)
  PINK: string;

  @Field((_type) => String)
  ORANGE: string;
}

@ObjectType()
export class RolePreferences {
  @Field((_type) => Boolean)
  showOnboarding: boolean;

  @Field((_type) => [String])
  recentSearchHits: string[];

  @Field((_type) => [String])
  recentlyVisited: string[];

  @Field((_type) => Int, { nullable: true })
  lastProjectId: number | null;

  @Field((_type) => RoleNoteColorPreferences)
  noteColors: RoleNoteColorPreferences;
}

export const DEFAULT_ROLE_PREFERENCES: RolePreferences = {
  showOnboarding: true,
  recentSearchHits: [],
  recentlyVisited: [],
  lastProjectId: null,
  noteColors: {
    YELLOW: "Yellow",
    BLUE: "Blue",
    PURPLE: "Purple",
    GREEN: "Green",
    PINK: "Pink",
    ORANGE: "Orange",
  },
};

/**
 * Partially update the preferences of a role.
 *
 * If not preferences have been set, it will fallback on the
 * default preferences. This method is resilient to badly formatted
 * JSON string but will log any error.
 *
 * @param role Role containing current preferences
 * @param values New set of preference to be updated
 * @returns RolePreferences
 */
export const updateRolePreferences = (
  role: Role,
  values: Partial<RolePreferences>
): RolePreferences => {
  return {
    ...getRolePreferences(role),
    ...values,
  };
};

/**
 * Resilient way of retrieving the role preferences without
 * failing.
 *
 * In case of parsing issue, the method fallsback to the
 * DEFAULT_ROLE_PREFERENCES.
 *
 * @param role Role containing the preferences
 * @returns RolePreferences
 */
export const getRolePreferences = (role: Role): RolePreferences => {
  try {
    return {
      ...DEFAULT_ROLE_PREFERENCES,
      ...JSON.parse(role.preferences || "{}"),
    };
  } catch {
    logger.warn(`Could not parse role preferences for role ID ${role.id}`);
    return { ...DEFAULT_ROLE_PREFERENCES };
  }
};
