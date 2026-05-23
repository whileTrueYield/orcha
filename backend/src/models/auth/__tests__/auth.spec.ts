import {
  createRandomOrgAndUser,
  createRandomUser,
  getRandomCode,
  getTestSessionWithRole,
  graphqlRequest,
  POW_HASH,
  POW_PROOF,
  TEST_IP,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { AuthStatus } from "../../../types";
import { RoleType, UserStatus } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import { URLSearchParams } from "url";
import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import request from "supertest";
import { createExpressApp } from "../../../app";
import expect from "expect";
import sinon, { SinonSpy } from "sinon";
import { redis } from "../../../redis";
import * as email from "../../../emails/email";

// note that we don't request the ID since this is a create
// test and we mock the DB create which would generate the ID
const registerMutation = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      status
      user {
        email
        status
      }
    }
  }
`;

const passwordLostMutation = `
  mutation PasswordLost($input: PasswordLostInput!) {
    passwordLost(input: $input)
  }
`;

const loginMutation = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      status
      role {
        id
        name
      }
      organization { 
        id
        name
      }
      user {
        email
        status
      }
    }
  }
`;

const meQuery = `
  query Me {
    me {
      status
      user {
        email
        status
      }
    }
  }
`;

const sendConfirmationEmailMutation = `
  mutation SendConfirmationEmail {
    sendConfirmationEmail
  }`;

const logoutMutation = `
  mutation LogoutEmail {
    logout
  }`;

const passwordResetMutation = `
  mutation PasswordResetMutation($input: PasswordResetInput!) {
    passwordReset(input: $input) {
      status
      user {
        email
        status
      }
    }
  }
`;

describe("register", function () {
  this.timeout(5000);
  const sandbox = sinon.createSandbox();
  let sendEmail: SinonSpy<any>;

  beforeEach(() => {
    sendEmail = sandbox.spy(email, "sendEmail");
    sandbox.stub(redis, "getdel").value(() => Promise.resolve(TEST_IP));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("creates the user as unconfirmed", async () => {
    const user = {
      email: `${faker.internet.email()}`,
      password: faker.internet.password(),
      hash: POW_HASH,
      proof: POW_PROOF,
    };

    const response = await graphqlRequest({
      source: registerMutation,
      variableValues: {
        input: user,
      },
    });

    expect(response).toEqual({
      data: {
        register: {
          user: {
            email: user.email.toLowerCase(),
            status: UserStatus.UNCONFIRMED,
          },
          status: AuthStatus.USER,
        },
      },
    });

    sandbox.assert.calledOnce(sendEmail);
  });

  it("cannot reset the a password if user is not ACTIVE or UNCONFIRMED", async () => {
    const user = await prisma.user.create({
      data: {
        email: `${getRandomCode(10)}${faker.internet.email()}`.toLowerCase(),
        password: "na",
        status: UserStatus.SUSPENDED,
      },
    });

    const response = await graphqlRequest({
      source: passwordLostMutation,
      variableValues: {
        input: {
          hash: POW_HASH,
          proof: POW_PROOF,
          email: user.email.toLowerCase(),
        },
      },
    });

    expect(response).toEqual({ data: { passwordLost: false } });
    sandbox.assert.notCalled(sendEmail);
  });

  it("creates a user when it was INVITED", async () => {
    const user = await prisma.user.create({
      data: {
        email: `${getRandomCode(10)}${faker.internet.email()}`.toLowerCase(),
        password: "na",
        status: UserStatus.INVITED,
      },
    });

    await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });

    const response = await graphqlRequest({
      source: registerMutation,
      variableValues: {
        input: {
          email: user.email,
          password: "test-password",
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });

    expect(response).toEqual({
      data: {
        register: {
          user: {
            email: user.email.toLowerCase(),
            status: UserStatus.UNCONFIRMED,
          },
          status: AuthStatus.USER,
        },
      },
    });

    sandbox.assert.calledOnce(sendEmail);
  });

  it("returns ME", async () => {
    const response = await graphqlRequest({ source: meQuery });

    expect(response).toEqual({
      data: {
        me: {
          status: AuthStatus.GUEST,
          user: null,
        },
      },
    });
  });

  it("do not resend the confirmation email if user is ACTIVE", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: sendConfirmationEmailMutation,
      session,
    });

    expect(response).toEqual({ data: { sendConfirmationEmail: false } });
    sandbox.assert.notCalled(sendEmail);
  });

  it("do resend the confirmation email if user is UNCONFIRMED", async () => {
    const { user, session } = await getTestSessionWithRole(RoleType.MEMBER);

    await prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.UNCONFIRMED },
    });

    const response = await graphqlRequest({
      source: sendConfirmationEmailMutation,
      session,
    });

    expect(response).toEqual({ data: { sendConfirmationEmail: true } });
    sandbox.assert.calledOnce(sendEmail);
  });

  it("allows logout", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: logoutMutation,
      session,
    });
    expect(response).toEqual({ data: { logout: true } });
  });

  it("allows a user to connect to an organization", async () => {
    const { user, role, organization } = await createRandomOrgAndUser();

    const response = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          password: "password",
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });

    expect(response).toEqual({
      data: {
        login: {
          role: {
            id: role.id,
            name: role.name,
          },
          organization: {
            id: organization.id,
            name: organization.name,
          },
          user: {
            email: user.email.toLowerCase(),
            status: UserStatus.ACTIVE,
          },
          status: AuthStatus.LINKED,
        },
      },
    });
  });

  it("allows a user to login", async () => {
    const user = await createRandomUser();

    const badPasswordResponse = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          password: user.password, // the user.password being a hash, it should not work
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });
    expect(get(badPasswordResponse, "errors.0.message")).toEqual(
      "Bad password or email does not exist",
    );

    const badEmailResponse = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: "foo-bar-bad-email@example.com",
          password: "password",
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });
    expect(get(badEmailResponse, "errors.0.message")).toEqual(
      "Bad password or email does not exist",
    );

    const response = await graphqlRequest({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          password: "password",
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });

    expect(response).toEqual({
      data: {
        login: {
          organization: null,
          role: null,
          user: {
            email: user.email.toLowerCase(),
            status: UserStatus.ACTIVE,
          },
          status: AuthStatus.USER,
        },
      },
    });
  });

  it("can reset password", async function () {
    const user = await createRandomUser();

    const response = await graphqlRequest({
      source: passwordLostMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });
    expect(response).toEqual({ data: { passwordLost: true } });

    // can be called twice
    const response2 = await graphqlRequest({
      source: passwordLostMutation,
      variableValues: {
        input: {
          email: user.email.toLowerCase(),
          hash: POW_HASH,
          proof: POW_PROOF,
        },
      },
    });
    expect(response2).toEqual({ data: { passwordLost: true } });

    const new_secret = randomBytes(64).toString("hex");

    await prisma.passwordLost.create({
      data: {
        email: user.email.toLowerCase(),
        secret: await hash(new_secret, 12),
      },
    });

    const passwordResetBadResponse = await graphqlRequest({
      source: passwordResetMutation,
      variableValues: {
        input: {
          hash: POW_HASH,
          proof: POW_PROOF,
          email: user.email,
          secret: "bad-secret",
          password: "my new Passw0rd!",
        },
      },
    });

    expect(get(passwordResetBadResponse, "errors.0.message")).toEqual(
      "Invalid Request",
    );

    const passwordResetResponse = await graphqlRequest({
      source: passwordResetMutation,
      variableValues: {
        input: {
          hash: POW_HASH,
          proof: POW_PROOF,
          email: user.email.toLowerCase(),
          secret: new_secret,
          password: "my new Passw0rd!",
        },
      },
    });

    expect(passwordResetResponse).toEqual({
      data: {
        passwordReset: {
          user: {
            email: user.email.toLowerCase(),
            status: UserStatus.ACTIVE,
          },
          status: AuthStatus.USER,
        },
      },
    });

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { password: true },
    });

    const isSamePassword = await compare(
      "my new Passw0rd!",
      updatedUser.password,
    );
    expect(isSamePassword).toBe(true);
    sandbox.assert.callCount(sendEmail, 2);
  });

  it("can authenticate", async () => {
    const app = createExpressApp();

    const user = {
      email: `${faker.internet.email().toLowerCase()}`,
      password: faker.internet.password(),
      hash: POW_HASH,
      proof: POW_PROOF,
    };

    const response = await graphqlRequest({
      source: registerMutation,
      variableValues: {
        input: user,
      },
    });

    expect(response).toEqual({
      data: {
        register: {
          user: {
            email: user.email,
            status: UserStatus.UNCONFIRMED,
          },
          status: AuthStatus.USER,
        },
      },
    });

    const new_secret = randomBytes(64).toString("hex");
    const confirmation = await prisma.emailConfirmation.update({
      where: { email: user.email },
      data: {
        secret: await hash(new_secret, 12),
      },
    });

    const badSecret = new URLSearchParams();
    badSecret.append("email", confirmation.email);
    badSecret.append("secret", "bad-secret");
    await request(app)
      .get(`/email_confirm?${badSecret.toString()}`)
      .set("Accept", "application/json")
      .expect(404);

    const goodRequest = new URLSearchParams();
    goodRequest.append("email", confirmation.email);
    goodRequest.append("secret", new_secret);
    await request(app)
      .get(`/email_confirm?${goodRequest.toString()}`)
      .set("Accept", "application/json")
      .expect(302);

    const confirmedUser = await prisma.user.findUniqueOrThrow({
      where: { email: user.email },
    });

    expect(confirmedUser.status).toBe(UserStatus.ACTIVE);
  });

  it("does not create a user with a bad email format", async () => {
    const user = {
      email: `@badEmail.com`,
      password: faker.internet.password(),
      hash: POW_HASH,
      proof: POW_PROOF,
    };

    const response = await graphqlRequest({
      source: registerMutation,
      variableValues: {
        input: user,
      },
    });

    expect(response.errors).toBeDefined();
    expect(get(response, "errors.0.message")).toEqual(
      "Argument Validation Error",
    );
  });
});
