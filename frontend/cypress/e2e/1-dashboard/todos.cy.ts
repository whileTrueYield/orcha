/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe("Dashboard todos", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");
  });

  it("can interact with todos on the dashboard", () => {
    // lets log the user in
    cy.asMemberUser();
    cy.visit("/org/:orgId/dashboard");

    cy.get("@todo-list").should("exist");
    cy.get("@show-add-task-button").click();

    // add a todo
    const todoTitle = `${faker.hacker.ingverb()} ${faker.hacker.noun()} ${faker.hacker.adjective()}`;
    cy.get("@add-task-input").type(todoTitle);
    cy.get("@add-task-button").click();
    cy.get("@todo-list").contains(todoTitle);
    cy.get("@todo-list @task-body")
      .first()
      .should("not.have.class", "line-through");

    // let's check it and it should be striked-through
    cy.get("@todo-list @task-checkbox").first().click();
    cy.get("@todo-list @task-body")
      .first()
      .should("have.class", "line-through");
  });
});
