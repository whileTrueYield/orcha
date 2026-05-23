import {
  graphqlRequest,
  getTestSessionWithRole,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import { map, range, sortBy, take } from "lodash";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getDocumentationsQuery = `
query getDocumentations {
  documentations (first: 10, sort: "name") {
    totalCount
    nodes {
      id
      name
      stage
      description
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      pageNumber
      pageSize
      pageCount
      endCursor
    }
  }
}
`;

describe("get many documentations", () => {
  it("returns pagination and an array of documentations", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { documentation: true });

    const documentationPromises = map(range(20), (counter) => {
      return prisma.documentation.create({
        data: {
          name: faker.person.jobTitle(),
          description: faker.lorem.paragraph(),
          stage: ModelStage.PUBLISHED,
          organizationId: organization.id,
        },
      });
    });

    const documentations = await Promise.all(documentationPromises);

    const response = await graphqlRequest({
      source: getDocumentationsQuery,
      session,
    });

    const expectedDocumentationObjs = map(
      documentations,
      ({ id, name, stage, description }) => ({
        id,
        name,
        stage,
        description,
      }),
    );

    expect(response).toEqual({
      data: {
        documentations: {
          totalCount: 20,
          nodes: take(sortBy(expectedDocumentationObjs, "name"), 10),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 2,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      },
    });
  });
});
