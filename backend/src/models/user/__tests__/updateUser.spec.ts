import {
  getTestSession,
  graphqlRequest,
  POW_HASH,
  POW_PROOF,
  TEST_IP,
} from "../../../utils/testing";
import { AuthStatus } from "../../../types";
import { faker } from "@faker-js/faker";
import expect from "expect";
import sinon from "sinon";
import { get } from "lodash";
import { redis } from "../../../redis";

const changeEmailMutation = `
mutation changeEmail($input: ChangeEmailInput!) {
  changeEmail(input: $input) {
    id
    status
    email
  }
}
`;

const changePasswordMutation = `
mutation changePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    id
    status
  }
}
`;

const loginMutation = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      status
    }
  }
`;

describe("updateMe", () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.stub(redis, "getdel").value(() => Promise.resolve(TEST_IP));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("changes the email of a user", async () => {
    const { session, user } = await getTestSession();

    const newEmail = user.id + faker.internet.email();
    const response = await graphqlRequest({
      source: changeEmailMutation,
      variableValues: {
        input: { email: newEmail, password: "password" },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        changeEmail: {
          id: user.id,
          status: user.status,
          email: newEmail.toLowerCase(),
        },
      },
    });
  });

  it("changes the password of a user", async () => {
    const { session, user } = await getTestSession();

    const response = await graphqlRequest({
      source: changePasswordMutation,
      variableValues: {
        input: {
          newPassword: "new password",
          password: "password",
        },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        changePassword: {
          id: user.id,
          status: user.status,
        },
      },
    });

    // The old password must no longer work — changePassword actually rotates
    // the credential (the legacy resolver had a bug where it re-hashed the
    // current password and `newPassword` was ignored).
    const oldPasswordLogin = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          password: "password",
          proof: POW_PROOF,
          hash: POW_HASH,
        },
      },
    });

    expect(oldPasswordLogin.data).toBe(null);
    expect(get(oldPasswordLogin, "errors.0.message")).toEqual(
      "Bad password or email does not exist",
    );

    // The new password authenticates successfully.
    const newPasswordLogin = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          password: "new password",
          proof: POW_PROOF,
          hash: POW_HASH,
        },
      },
    });

    expect(newPasswordLogin).toEqual({
      data: {
        login: {
          status: AuthStatus.USER,
        },
      },
    });
  });
});
