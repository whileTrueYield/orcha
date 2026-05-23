/// <reference types="cypress" />

describe("Timezones", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");
  });

  it("can update their time zone", () => {
    // lets log the user in
    cy.asMemberUser();
    cy.visit("/org/:orgId/dashboard");

    // by default the new user should be in ETC/UTC and should
    // have a warning about their timezone
    cy.get("@timezone-banner").then(($el) => {
      Cypress.dom.isVisible($el); // true
    });

    // click to change to the current web-browser timezone
    cy.get("@timezone-banner button").first().click();
    cy.get("@confirm-modal-form").then(($el) => {
      Cypress.dom.isVisible($el); // true
    });
    cy.get("@confirm-modal-form button[type=submit]").first().click();

    // the timezone bar should not be visible anymore
    cy.get("@confirm-modal-form").should("not.exist");
  });
});
