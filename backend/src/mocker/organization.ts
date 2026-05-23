import { faker } from "@faker-js/faker";
import prisma from "../prisma";
import { Prisma, Organization, OrganizationStatus } from ".prisma/client";

export const createOrganization = async (
  values?: Partial<Prisma.OrganizationCreateInput>,
  allFeatures: boolean = true
): Promise<Organization> => {
  const data: Prisma.OrganizationCreateInput = {
    name: faker.company.name(),
    about: faker.lorem.paragraph(),
    status: OrganizationStatus.ACTIVE,
    coverUrl: faker.image.url(),
    ...values,
  };

  const organization = await prisma.organization.create({ data });

  if (allFeatures) {
    // activate all the features for mocking
    await prisma.featureFlag.create({
      data: {
        organizationId: organization.id,
        documentation: true,
        report: true,
        support: true,
      },
    });
  }

  return organization;
};
