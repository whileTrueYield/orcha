/**
 * Behavior tests for the two-step token creation modal.
 *
 * The contract that matters: the plaintext token is shown exactly once. After
 * the user acknowledges it ("I've saved it"), it must be gone — there is no way
 * to retrieve it again, mirroring the backend which only ever returns it once.
 */

import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// GQLClient pulls in config, which reads import.meta.env (Vite) — jsdom can't
// evaluate it. The toast side-effect is peripheral to these behavior tests.
jest.mock("utils/GQLClient", () => ({
  onGraphQLError: () => () => {},
}));

import { TokenCreateModal } from "../TokenCreateModal";
import { CREATE_API_TOKEN } from "../tokenQueries";

const PLAINTEXT = "orcha_pat_supersecretplaintextvalue123456";

const createMock = {
  request: {
    query: CREATE_API_TOKEN,
    variables: { input: { name: "CI bot", readOnly: false } },
  },
  result: {
    data: {
      createApiToken: {
        __typename: "CreateApiTokenResult",
        plaintext: PLAINTEXT,
        token: {
          __typename: "PersonalAccessToken",
          id: 7,
          name: "CI bot",
          tokenPrefix: "orcha_pat_su",
          readOnly: false,
          lastUsedAt: null,
          expiresAt: null,
          revokedAt: null,
          createdAt: "2026-06-13T00:00:00.000Z",
          roleId: 1,
          role: { __typename: "Role", id: 1, name: "Alice" },
        },
      },
    },
  },
};

const renderModal = (props: Partial<React.ComponentProps<typeof TokenCreateModal>> = {}) =>
  render(
    <MockedProvider mocks={[createMock]}>
      <TokenCreateModal
        visible
        onClose={props.onClose ?? jest.fn()}
        onCreated={props.onCreated ?? jest.fn()}
      />
    </MockedProvider>
  );

const submitCreateForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/name/i), "CI bot");
  await user.click(screen.getByRole("button", { name: /create token/i }));
};

describe("TokenCreateModal", () => {
  it("shows the plaintext exactly once after creation", async () => {
    const user = userEvent.setup();
    renderModal();

    // The secret is not present before creation.
    expect(screen.queryByText(PLAINTEXT)).not.toBeInTheDocument();

    await submitCreateForm(user);

    await waitFor(() => expect(screen.getByText(PLAINTEXT)).toBeInTheDocument());
  });

  it("copies the plaintext to the clipboard", async () => {
    const user = userEvent.setup();
    renderModal();
    await submitCreateForm(user);
    await waitFor(() => expect(screen.getByText(PLAINTEXT)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /copy/i }));

    // userEvent.setup() installs a working clipboard stub; read it back.
    expect(await navigator.clipboard.readText()).toBe(PLAINTEXT);
  });

  it("closes via 'I've saved it' and drops the secret from the DOM", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onCreated = jest.fn();
    renderModal({ onClose, onCreated });
    await submitCreateForm(user);
    await waitFor(() => expect(screen.getByText(PLAINTEXT)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /saved it/i }));

    expect(onClose).toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalled();
    expect(screen.queryByText(PLAINTEXT)).not.toBeInTheDocument();
  });
});
