import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { IssueStatus } from "@prisma/client";

const issueSendMessageMutation = `
mutation IssueSendMessage($issueId: Int!, $input:IssueSendMessageInput!) {
  issueSendMessage(
    issueId: $issueId
    input: $input
  ) {
    id
    status
  }
}
`;

describe("updateIssue", () => {
  it("can send a message", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { support: true });

    const product = await createRandomProduct(organization);

    const issue = await prisma.issue.create({
      data: {
        localId: 1,
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
        email: "foo@example.com",
        name: "john doe",
        productId: product.id,
        url: "foo/bar",
        metaData: "",
        userAgent: "",
        token: Math.random().toString(),
      },
    });

    const newMessage = faker.lorem.paragraph();
    const response = await graphqlRequest({
      source: issueSendMessageMutation,
      variableValues: {
        issueId: issue.id,
        input: { message: newMessage },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        issueSendMessage: {
          status: IssueStatus.PROCESSING,
          id: issue.id,
        },
      },
    });
  });
});
