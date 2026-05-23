import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";
import { getUniqEmail } from "./uniq";
import { first, map, sample } from "lodash";
import {
  FIRST_HALF_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  SECOND_HALF_WORK_WEEK,
  WEEK_END_WORK_WEEK,
} from "./utils";
import prisma from "../prisma";
import {
  Prisma,
  Feature,
  Organization,
  Role,
  RoleStatus,
  RoleType,
  Skill,
  Team,
  User,
  UserStatus,
} from ".prisma/client";

// Odds will be in favor of FULL TIME
// 12x full / 2x 1st half / 2x 2nd half / 1x weekend
const WORK_WEEKS = [
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  FIRST_HALF_WORK_WEEK,
  FIRST_HALF_WORK_WEEK,
  SECOND_HALF_WORK_WEEK,
  SECOND_HALF_WORK_WEEK,
  WEEK_END_WORK_WEEK,
];

const timezones = [
  "America/Los_Angeles",
  "Africa/Dakar",
  "America/Chicago",
  "America/Martinique",
  "America/New_York",
  "Asia/Yakutsk",
  "Chile/Continental",
  "Pacific/Kanton",
  "US/Alaska",
  "Pacific/Midway",
  "Europe/Vilnius",
  "Europe/Paris",
  "Europe/Guernsey",
  "Australia/Yancowinna",
  "Asia/Katmandu",
];

export const createRole = async (
  organization: Organization,
  user: User,
  roleData: Partial<Prisma.RoleCreateInput>,
): Promise<Role & { user: User }> => {
  // create a role for that session
  const role = await prisma.role.create({
    data: {
      title: faker.person.jobTitle(),
      status: RoleStatus.ACCEPTED,
      type: RoleType.MEMBER,
      timeZone: sample(timezones),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      description: JSON.stringify(faker.person.bio()),
      workWeek: JSON.stringify(sample(WORK_WEEKS)),
      user: {
        connect: { id: user.id },
      },
      organization: {
        connect: { id: organization.id },
      },
      ...roleData,
    },
    include: { user: true },
  });

  // mock should opt-out of notification emails
  await prisma.roleEmail.create({
    data: {
      roleId: role.id,
      nextWorkDayNotificationDate: new Date(),
      nextWorkDayNotificationOptOut: true,
    },
  });

  return role;
};

export const grantSkill = async (
  role: Role,
  feature: Feature,
  level: number,
): Promise<Skill> => {
  return prisma.skill.create({
    data: {
      role: { connect: { id: role.id } },
      feature: { connect: { id: feature.id } },
      organization: { connect: { id: role.organizationId } },
      value: level,
    },
  });
};

export const createUser = async (
  values?: Partial<Prisma.UserCreateInput>,
): Promise<User> => {
  if (values?.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (existingUser) {
      return existingUser;
    }
  }

  const userValues: Prisma.UserCreateInput = {
    status: UserStatus.ACTIVE,
    password: "lighter basic rover what",
    email: getUniqEmail(),
    isStaff: true,
    ...values,
  };

  userValues.password = await hash(userValues.password, 12);

  return prisma.user.create({ data: userValues });
};

export const createTeam = (
  organization: Organization,
  values?: Partial<Prisma.TeamCreateInput>,
): Promise<Team> => {
  const name = faker.person.jobTitle() + "s";
  const code = map(name.split(" "), first).join("");

  const teamValues: Prisma.TeamCreateInput = {
    code,
    name,
    coverUrl: faker.image.urlPicsumPhotos(),
    description: faker.lorem.paragraph(),
    organization: { connect: { id: organization.id } },
    ...values,
  };

  return prisma.team.create({ data: teamValues });
};

export const setTeamMembers = async (
  team: Team,
  members: Role[],
): Promise<Team> => {
  return prisma.team.update({
    where: { id: team.id },
    data: {
      members: {
        connect: members.map((member) => ({ id: member.id })),
      },
    },
  });
};

export const addRandomEmployee = async (
  organization: Organization,
  roleType?: RoleType,
) => {
  roleType = roleType
    ? roleType
    : sample([
        RoleType.ADMIN,
        RoleType.MEMBER,
        RoleType.MEMBER,
        RoleType.MEMBER,
        RoleType.MEMBER,
        RoleType.MEMBER,
      ]);
  const user = await createUser();
  const role = await createRole(organization, user, { type: roleType });

  return { user, role };
};

export const inviteRandomEmployee = async (
  organization: Organization,
  roleType: RoleType = RoleType.MEMBER,
) => {
  const user = await createUser();
  const role = await createRole(organization, user, {
    status: RoleStatus.INVITED,
    type: roleType,
  });

  return { user, role };
};

export const removeEmployee = async (role: Role) => {
  return prisma.role.update({
    where: { id: role.id },
    data: {
      status: RoleStatus.DEACTIVATED,
    },
  });
};
