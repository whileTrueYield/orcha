/// <reference types="cypress" />

import { User, Organization, Role } from "../../src/types/graphql";

interface CreateUserResponse {
  user: User;
  organization: Organization | null;
  role: Role | null;
  password: string;
}

interface CreateUserOptions {
  isConfirmed?: boolean;
  isInvited?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  organizationId?: number;
}

export async function createUser(
  options: CreateUserOptions
): Promise<CreateUserResponse> {
  const response = await fetch(
    Cypress.env("API_HOST") + "/__tests/create_user",
    {
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(options),
    }
  );

  return response.json();
}
