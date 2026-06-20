/**
 * End-to-end tests for the product & workflow discovery tools — `list_products`
 * and `list_workflows`.
 *
 * These two reads exist so an agent can fill the (optional) `productId` and
 * `workflowId` fields when it creates a ticket: it cannot choose what it cannot
 * see. The contract pinned here is what that agent relies on — each list is
 * tenant-scoped and paginated, a product carries the descriptive signal an
 * agent matches a ticket against (`description`, `code`), and
 * `list_workflows({ product })` returns exactly the workflows that product can
 * attach (the same valid set `create_ticket` validates against, org defaults
 * included), each with its ordered stages.
 */

import expect from "expect";
import prisma from "../../prisma";
import {
  getTestApiToken,
  createRandomProduct,
  createRandomWorkflow,
} from "../../utils/testing";
import { listen, connect, parse } from "./mcpClient";

// Run `body` with a connected client for `token`, tearing both down after.
async function withClient(
  token: { plaintext: string },
  body: (
    call: (name: string, args?: Record<string, unknown>) => Promise<any>,
  ) => Promise<void>,
): Promise<void> {
  const { url, server } = listen();
  const { client, transport } = await connect(url, token.plaintext);
  try {
    await body((name, args = {}) => client.callTool({ name, arguments: args }));
  } finally {
    await transport.close();
    server.close();
  }
}

describe("MCP read surface — products", () => {
  it("list_products returns the org's products with their discovery fields", async () => {
    const token = await getTestApiToken();
    const product = await createRandomProduct(token.organization, {
      name: "ZZ-FINDABLE-PRODUCT",
    });

    await withClient(token, async (call) => {
      const page = parse(await call("list_products", { search: "FINDABLE" }));
      expect(page.products).toHaveLength(1);
      const found = page.products[0];
      expect(found.id).toBe(product.id);
      expect(found.name).toBe("ZZ-FINDABLE-PRODUCT");
      expect(found).toHaveProperty("code");
      expect(found).toHaveProperty("description");
      expect(found).toHaveProperty("stage");
    });
  });

  it("is tenant-scoped: list_products never returns another org's products", async () => {
    const tokenA = await getTestApiToken();
    const tokenB = await getTestApiToken();
    const onlyA = await createRandomProduct(tokenA.organization);

    await withClient(tokenB, async (call) => {
      const page = parse(await call("list_products"));
      expect(page.products.map((p: any) => p.id)).not.toContain(onlyA.id);
    });
  });
});

describe("MCP read surface — workflows", () => {
  it("list_workflows returns workflows with their ordered states", async () => {
    const token = await getTestApiToken();
    const workflow = await createRandomWorkflow(token.organization);

    await withClient(token, async (call) => {
      const page = parse(await call("list_workflows"));
      const found = page.workflows.find((w: any) => w.id === workflow.id);
      expect(found).toBeDefined();
      expect(found).toHaveProperty("description");
      expect(Array.isArray(found.states)).toBe(true);
      expect(found.states).toHaveLength(3);
      expect(found.states[0]).toHaveProperty("name");
      expect(found.states[0]).toHaveProperty("position");
    });
  });

  it("list_workflows({ product }) returns only the workflows that product can attach", async () => {
    const token = await getTestApiToken();
    // A product that does NOT use org defaults: its attachable set is exactly
    // the workflows wired to it.
    const product = await createRandomProduct(token.organization, {
      isUsingDefaultWorkflows: false,
    });
    const attached = await createRandomWorkflow(token.organization);
    await prisma.product.update({
      where: { id: product.id },
      data: { workflows: { connect: { id: attached.id } } },
    });
    // An unattached workflow in the same org — must be filtered out.
    const unattached = await createRandomWorkflow(token.organization);

    await withClient(token, async (call) => {
      const page = parse(await call("list_workflows", { product: product.id }));
      const ids = page.workflows.map((w: any) => w.id);
      expect(ids).toContain(attached.id);
      expect(ids).not.toContain(unattached.id);
    });
  });

  it("list_workflows({ product }) includes org default workflows when the product uses them", async () => {
    const token = await getTestApiToken();
    const product = await createRandomProduct(token.organization, {
      isUsingDefaultWorkflows: true,
    });
    // A default workflow not wired to the product is still attachable because
    // the product opts into defaults.
    const defaultWorkflow = await createRandomWorkflow(token.organization, {
      isDefaultWorkflow: true,
    });

    await withClient(token, async (call) => {
      const page = parse(await call("list_workflows", { product: product.id }));
      expect(page.workflows.map((w: any) => w.id)).toContain(defaultWorkflow.id);
    });
  });
});
