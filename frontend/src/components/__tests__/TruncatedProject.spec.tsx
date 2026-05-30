import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { TruncatedProjectPath } from "components/TruncatedProjectPath";
import { ModelStage, Project } from "types/graphql";
import { GET_MINI_PROJECTS_QUERY } from "utils/project";
import renderer from "react-test-renderer";

const mocks = [
  {
    request: {
      query: GET_MINI_PROJECTS_QUERY,
    },
    result: {
      data: {
        myMiniProjects: [
          {
            __typename: "MiniProject",
            id: 1,
            name: "Project 01",
            parentId: null,
            stage: ModelStage.Published,
          },
          {
            __typename: "MiniProject",
            id: 10,
            name: "Project 10",
            parentId: null,
            stage: ModelStage.Published,
          },
          {
            __typename: "MiniProject",
            id: 11,
            name: "Project 11",
            parentId: 1,
            stage: ModelStage.Published,
          },
          {
            __typename: "MiniProject",
            id: 12,
            name: "Project 12",
            parentId: 11,
            stage: ModelStage.Published,
          },
          {
            __typename: "MiniProject",
            id: 13,
            name: "Project 13",
            parentId: null,
            stage: ModelStage.Published,
          },
        ],
      },
    },
  },
];

describe("TruncatedProject", () => {
  it("should display a project ancestry path", async () => {
    const project: Partial<Project> = {
      id: 12,
      name: "Project 12",
      parentId: 11,
    };

    render(
      <MockedProvider mocks={mocks}>
        <TruncatedProjectPath project={project as Project} />
      </MockedProvider>
    );

    // the project title should be displayed and prefixed with a /
    expect(await screen.findByText("/Project 12")).toBeTruthy();

    // see if the ancestry is visible
    expect(await screen.findByText("Project 01/Project 11")).toBeTruthy();
  });

  it("should not display any ancestry if none exist", async () => {
    const project: Partial<Project> = {
      id: 1,
      name: "Project 01",
      parentId: null,
    };

    const component = renderer.create(
      <MockedProvider mocks={mocks}>
        <TruncatedProjectPath project={project as Project} />
      </MockedProvider>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
