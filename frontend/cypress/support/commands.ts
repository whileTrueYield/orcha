/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn<cy.visit>, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

interface CreateUserOptions {
  isConfirmed?: boolean;
  isInvited?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  isMember?: boolean;
  organizationId?: number;
}

interface AuthCache {
  email: string;
  password: string;
  organizationId: string | null;
}

let currentAuth: AuthCache | null = null;
const authCache: { [key: string]: AuthCache } = {};

function asUser(category: string, options: CreateUserOptions) {
  const auth = authCache[category];
  if (auth) {
    const email = auth.email;
    const password = auth.password;

    cy.session([email, password], () => {
      cy.request({
        url: Cypress.env("API_HOST") + "/__tests/login",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: { email: email, password: password },
      })
        .its("body")
        .then((body) => {
          window.localStorage.setItem(
            "e2e_organization_id",
            body.organization.id
          );
        });
    });
  } else {
    cy.request({
      url: Cypress.env("API_HOST") + "/__tests/create_user",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: options,
    })
      .its("body")
      .then((body) => {
        authCache[category] = {
          organizationId: body.organization.id,
          email: body.user.email,
          password: body.password,
        };

        cy.session([body.user.email, body.password], () => {
          cy.request({
            url: Cypress.env("API_HOST") + "/__tests/login",
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: { email: body.user.email, password: body.password },
          })
            .its("body")
            .then((body) => {
              window.localStorage.setItem(
                "e2e_organization_id",
                body.organization.id
              );
            });
        });
      });
  }
}

Cypress.Commands.add("asAdminUser", () => {
  asUser("asAdminUser", { isConfirmed: true, isAdmin: true });
});

Cypress.Commands.add("asOwnerUser", () => {
  asUser("asOwnerUser", { isConfirmed: true, isOwner: true });
});

Cypress.Commands.add("asMemberUser", () => {
  asUser("asMemberUser", { isConfirmed: true, isMember: true });
});

Cypress.Commands.overwrite("visit", (originalVisit, url, options) => {
  // only assert the presence of organization ID if the URL contains :orgId keyword
  if (/\/:orgId\//.test(url)) {
    const organizationId = window.localStorage.getItem("e2e_organization_id");
    expect(organizationId).not.to.be.null;
    return originalVisit(url.replace(":orgId", organizationId!), options);
  } else {
    return originalVisit(url, options);
  }
});

// same a get, but if the selector name starts with an @ it's targeting the data-e2e attribute
Cypress.Commands.overwrite("get", (originalGet, selector, options) =>
  originalGet(
    selector
      .split(" ")
      .map((s) => (s.startsWith("@") ? `[data-e2e=${s.slice(1)}]` : s))
      .join(" "),
    options
  )
);

declare namespace Cypress {
  interface Chainable<Subject> {
    get<E extends Node = HTMLElement>(
      selector: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
    ): Chainable<JQuery<E>>;
    asAdminUser(): Chainable<void>;
    asOwnerUser(): Chainable<void>;
    asMemberUser(): Chainable<void>;
    visit(url: string, options: Partial<VisitOptions>): Chainable<Element>;
  }
}
