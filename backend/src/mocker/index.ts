import initialWorkflows from "../models/organization/resolvers/initialWorkflows.json";
import { flatten, map, random, range, sample, sampleSize, uniq } from "lodash";
import { Feature, RoleType, Ticket } from ".prisma/client";
import {
  addRandomEmployee,
  createRole,
  createTeam,
  createUser,
  grantSkill,
  setTeamMembers,
} from "./employee";
import { faker } from "@faker-js/faker";
import { createOrganization } from "./organization";
import { createFeatureGroup, createFeature, createProduct } from "./product";
import {
  Context,
  ContextTeam,
  ContextWorkflow,
  ContextProduct,
  ContextFeatureGroup,
  ContextWorkflowState,
  ContextDocumentation,
} from "./types";
import {
  createWorkflowState,
  createWorkflow,
  setWorkflowStateTeams,
} from "./workflow";
import {
  addAncestorsToTicket,
  assignTicket,
  createTicket,
  setTicketFeatures,
  setTicketTags,
} from "./ticket";
import { featureNames } from "./utils";
import { createTag } from "./tag";
import { createPageForProduct } from "./page";
import { startOfDay, subDays } from "date-fns";
import { runSimulation } from "./simulateWork";
import { createProject } from "./project";
import { requestEstimate } from "../models/ticket/jobs/estimateTickets";
import { createDocumentation, createDocumentationPage } from "./documentation";

const PAST_TIME_FRAME = 28;

const USER_OWNERS = [
  {
    name: "Brice Leroy",
    email: "brice@orchalabs.com",
    password: "lighter basic rover what",
  },
  {
    name: "Jill Guttierez",
    email: "jill@orchalabs.com",
    password: "lighter basic rover what",
  },
  {
    name: "Elise Levy",
    email: "elise@orchalabs.com",
    password: "lighter basic rover what",
  },
  {
    name: "Kerby",
    email: "kerby@orchalabs.com",
    password: "lighter basic rover what",
  },
  {
    name: "Mike Bieronski",
    email: "mike@orchalabs.com",
    password: "lighter basic rover what",
  },
];

// Odds
// const LEAVING_ORG = {};

const GOALS = {
  activeTickets: [80, 300],
  backupTeamPerWorklowState: [0, 2],
  employees: [8, 30],
  employeesPerTeam: [1, 8],
  featureGroupPerProduct: [1, 20],
  featurePerTicket: [1, 2],
  featuresPerFeatureGroup: [1, 5],
  products: [2, 4],
  statePerWorkflow: [2, 8],
  teamPerWorklowState: [1, 3],
  teams: [2, 6],
  ticketPerGroup: [0, 6],
  workflows: [2, 4],
  workflowsPerProduct: [1, 8],
  projects: [3, 8],
  documentations: [5, 12],
  pagePerDocumentation: [5, 50],
};

const tags = ["version 1", "version 2", "Beta"];

const getCount = (boundaries: number[]): number =>
  random(boundaries[0], boundaries[1]);

export const start = async () => {
  const context: Context = {
    organization: await createOrganization(),
    teams: [],
    workflows: [],
    products: [],
    employees: [],
    tickets: [],
    tags: [],
    projects: [],
    documentations: [],
  };

  for (const owner of USER_OWNERS) {
    const user = await createUser({
      email: owner.email,
      password: owner.password,
    });
    const role = await createRole(context.organization, user, {
      type: RoleType.OWNER,
      name: owner.name,
    });
    context.employees.push({ role, user });
  }

  const employeeCount = getCount(GOALS.employees);
  while (context.employees.length < employeeCount) {
    const employee = await addRandomEmployee(context.organization);
    context.employees.push(employee);
  }

  const teamCount = getCount(GOALS.teams);
  while (context.teams.length < teamCount) {
    const employeePerTeamCount = getCount(GOALS.employeesPerTeam);

    const contextTeam: ContextTeam = {
      team: await createTeam(context.organization),
      members: map(sampleSize(context.employees, employeePerTeamCount), "role"),
    };

    await setTeamMembers(contextTeam.team, contextTeam.members);
    context.teams.push(contextTeam);
  }

  for (const initialWorkflow of initialWorkflows.workflows) {
    const contextWorkflow: ContextWorkflow = {
      workflow: await createWorkflow(context.organization, {
        name: initialWorkflow.name,
      }),
      states: [],
    };

    // create the workflow state with a position and add the teams to it
    const promises = initialWorkflow.states.map(async (state, index) => {
      const teamPerStateCount = getCount(GOALS.teamPerWorklowState);

      const contextWorkflowState: ContextWorkflowState = {
        state: await createWorkflowState(contextWorkflow.workflow, {
          name: state.name,
          position: index,
        }),
        teams: sampleSize(map(context.teams, "team"), teamPerStateCount),
      };

      await setWorkflowStateTeams(
        contextWorkflowState.state,
        contextWorkflowState.teams
      );

      contextWorkflow.states.push(contextWorkflowState);
    });

    await Promise.all(promises);

    context.workflows.push(contextWorkflow);
  }

  const documentationCount = getCount(GOALS.documentations);
  while (context.documentations.length < documentationCount) {
    const documentationPageCount = getCount(GOALS.pagePerDocumentation);
    const contextDocumentation: ContextDocumentation = {
      documentation: await createDocumentation(context.organization),
      documentationPages: [],
    };

    for (let i = 0; i < documentationPageCount; i++) {
      contextDocumentation.documentationPages.push(
        await createDocumentationPage(
          context.organization,
          contextDocumentation.documentation
        )
      );
    }

    context.documentations.push(contextDocumentation);
  }

  const productCount = getCount(GOALS.products);
  const features: Feature[] = [];

  while (context.products.length < productCount) {
    const productWorkflowCount = getCount(GOALS.workflowsPerProduct);
    const contextProduct: ContextProduct = {
      product: await createProduct(context.organization),
      workflows: sampleSize(
        map(context.workflows, "workflow"),
        productWorkflowCount
      ),
      featureGroups: [],
    };

    // await setProductWorkflows(contextProduct.product, contextProduct.workflows);

    const featureGroupCount = getCount(GOALS.featureGroupPerProduct);

    // create a uniq set of feature group names
    const featureGroupNames = uniq(
      map(range(0, featureGroupCount), faker.hacker.noun)
    );
    for (const featureGroupName of featureGroupNames) {
      const featureGroup: ContextFeatureGroup = {
        featureGroup: await createFeatureGroup(contextProduct.product, {
          name: featureGroupName,
        }),
        features: [],
      };

      const featureCount = getCount(GOALS.featuresPerFeatureGroup);
      const names = sampleSize(featureNames, featureCount);
      for (const name of names) {
        const feature = await createFeature(featureGroup.featureGroup, {
          name,
        });

        features.push(feature);
        featureGroup.features.push(feature);
      }

      contextProduct.featureGroups.push(featureGroup);
    }

    await createPageForProduct(contextProduct.product);

    context.products.push(contextProduct);
  }

  // randomly associate a set of feature skills (between 3 and 10) to
  // every person at a random level (from 1 to 5)
  for (const role of context.employees) {
    const roleFeatures = sampleSize(features, random(3, 10));
    for (const feature of roleFeatures) {
      await grantSkill(role.role, feature, random(1, 5));
    }
  }

  for (const tagName of tags) {
    const author = sample(context.employees);
    context.tags.push(
      await createTag(tagName, context.organization.id, author!.role.id)
    );
  }

  const projectCount = getCount(GOALS.projects);
  while (context.projects.length < projectCount) {
    const author = sample(map(context.employees, "role"));

    context.projects.push(
      await createProject(
        `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
        context.organization.id,
        { author: { connect: { id: author!.id } } }
      )
    );
  }

  const ticketCount = getCount(GOALS.activeTickets);
  const ticketWithoutAncestors: Ticket[] = [];
  while (context.tickets.length < ticketCount) {
    const productContext = sample(context.products);
    const author = sample(map(context.employees, "role"));

    if (!productContext || !author) {
      continue;
    }

    const workflow = sample(productContext.workflows);
    const project = sample(context.projects);

    if (workflow && project) {
      const createdAt = startOfDay(
        subDays(new Date(), Math.round(Math.random() * 28) + 28)
      );

      const ticket = await createTicket(
        productContext.product,
        workflow,
        project!,
        author,
        {
          project: project ? { connect: { id: project.id } } : {},
          createdAt,
          updatedAt: createdAt,
        }
      );

      // add a feature set to the ticket
      const featureCount = getCount(GOALS.featurePerTicket);
      const features = sampleSize(
        flatten(map(productContext.featureGroups, "features")),
        featureCount
      );

      if (features.length > 0) {
        await setTicketFeatures(ticket, features);
      }

      if (Math.random() < 0.8) {
        await setTicketTags(ticket, [sample(context.tags)!]);
      }

      // assign ticket + estimate
      await assignTicket(ticket, map(context.employees, "role"));

      // Add ancestors
      const size = sample([0, 0, 0, 0, 0, 0, 1, 1, 1, 2]);
      const ancestors = sampleSize(map(context.tickets), size);
      if (ancestors.length) {
        await addAncestorsToTicket(ticket, ancestors);
      } else {
        ticketWithoutAncestors.push(ticket);
      }
      context.tickets.push(ticket);
    }
  }

  await runSimulation(context.organization.id, PAST_TIME_FRAME);
  await requestEstimate(context.organization.id);

  process.exit(0);
};

start();
