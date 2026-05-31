/**
 * Markdown body repository (PRD #36, issue #39) — the single read/write
 * interface every layer (GraphQL, /v1 REST, seed) uses for ticket, project, and
 * documentation bodies.
 *
 * Public API:
 *   - getBody(type, id): Promise<Body>
 *   - saveBody(type, id, markdown, baseVersion): Promise<SaveResult>
 *   - types BodyType, Body, SaveResult
 *
 * It owns optimistic concurrency and delegates reconciliation to the pure 3-way
 * merge module. ADR 0007 makes Markdown the literal source of truth: a writer
 * reads { markdown, version }, edits, and writes back the version it started
 * from. When that base is current we fast-forward; when it is stale we recover
 * the base Markdown from the revision history and 3-way merge against what is now
 * stored, returning either the merged body or the overlapping conflicts — never
 * silently picking a winner.
 *
 * The three body types differ only in their Prisma table and foreign-key column;
 * that difference lives entirely in STORES below, so the concurrency logic is
 * written once. `merge` (and thus ESM-only node-diff3) is reached only through
 * this module, keeping it out of *.spec.ts per the ESM-in-specs rule.
 */

import { Prisma } from "@prisma/client";

import prisma from "../prisma";
import { merge, type ConflictHunk } from "./merge";

export type BodyType = "ticket" | "project" | "documentation";

export type Body = { markdown: string; version: number };

/**
 * Predictable discriminated result: branch on `ok`. A successful save carries
 * the persisted body (with its bumped version); a conflict carries the
 * overlapping regions and means nothing was written.
 */
export type SaveResult =
  | { ok: true; body: Body }
  | { ok: false; conflicts: ConflictHunk[] };

/**
 * Per-type storage adapter — the only place the three body tables differ. Args
 * are loosely typed because each Prisma delegate has model-specific argument
 * types; the structural shape we rely on (findUnique/upsert/create) is identical
 * across them.
 */
type BodyStore = {
  current(id: number): Promise<Body | null>;
  revisionAt(id: number, version: number): Promise<string | null>;
  /**
   * Atomically write the new current body and append its revision. The
   * revision table's unique([fk, version]) guard turns a concurrent
   * double-write of the same version into a hard failure rather than silent
   * loss — crash early on a lost-update race.
   */
  commit(id: number, markdown: string, version: number): Promise<void>;
};

// upsert/create return PrismaPromise (not a plain Promise) so they can be
// batched in prisma.$transaction([...]); findUnique is awaited directly.
type Delegate = {
  findUnique(args: any): Promise<any>;
  upsert(args: any): Prisma.PrismaPromise<any>;
  create(args: any): Prisma.PrismaPromise<any>;
};

function makeStore(
  text: Delegate,
  revision: Delegate,
  foreignKey: "ticketId" | "projectId" | "documentationPageId",
): BodyStore {
  return {
    async current(id) {
      const row = await text.findUnique({
        where: { [foreignKey]: id },
        select: { markdown: true, version: true },
      });
      return row ?? null;
    },

    async revisionAt(id, version) {
      const row = await revision.findUnique({
        where: { [`${foreignKey}_version`]: { [foreignKey]: id, version } },
        select: { markdown: true },
      });
      return row?.markdown ?? null;
    },

    async commit(id, markdown, version) {
      await prisma.$transaction([
        text.upsert({
          where: { [foreignKey]: id },
          create: { [foreignKey]: id, markdown, version },
          update: { markdown, version },
        }),
        revision.create({ data: { [foreignKey]: id, version, markdown } }),
      ]);
    },
  };
}

const STORES: Record<BodyType, BodyStore> = {
  ticket: makeStore(
    prisma.ticketText as Delegate,
    prisma.ticketTextRevision as Delegate,
    "ticketId",
  ),
  project: makeStore(
    prisma.projectText as Delegate,
    prisma.projectTextRevision as Delegate,
    "projectId",
  ),
  documentation: makeStore(
    prisma.documentationPageText as Delegate,
    prisma.documentationPageTextRevision as Delegate,
    "documentationPageId",
  ),
};

// A body that was never written reads as the empty document at version 0, so
// callers (and the merge base for a first-ever stale save) never branch on null.
const EMPTY_BODY: Body = { markdown: "", version: 0 };

/**
 * Read the current body. A body that was never written reads as the empty
 * document at version 0 — a uniform shape so callers never branch on null.
 */
export async function getBody(type: BodyType, id: number): Promise<Body> {
  const current = await STORES[type].current(id);
  return current ?? EMPTY_BODY;
}

export async function saveBody(
  type: BodyType,
  id: number,
  markdown: string,
  baseVersion: number,
): Promise<SaveResult> {
  const store = STORES[type];
  const current = (await store.current(id)) ?? EMPTY_BODY;

  // A base ahead of what we store cannot exist — the writer never read it.
  // This is corrupt state, not a conflict, so we crash rather than guess.
  if (baseVersion > current.version) {
    throw new Error(
      `saveBody: baseVersion ${baseVersion} is ahead of stored version ` +
        `${current.version} for ${type} ${id}`,
    );
  }

  // Fast-forward: the writer started from the current version, so nobody saved
  // in between — persist as-is at the next version.
  if (baseVersion === current.version) {
    const version = current.version + 1;
    await store.commit(id, markdown, version);
    return { ok: true, body: { markdown, version } };
  }

  // Stale: another save landed since the writer read `baseVersion`. Recover the
  // exact Markdown the writer started from and 3-way merge it against what is now
  // stored. base@0 is the empty document, which has no revision row.
  const base =
    baseVersion === 0 ? "" : await store.revisionAt(id, baseVersion);
  if (base === null) {
    throw new Error(
      `saveBody: missing revision ${baseVersion} for ${type} ${id}; ` +
        `cannot recover merge base`,
    );
  }

  const reconciled = merge(base, markdown, current.markdown);
  if (!reconciled.clean) {
    return { ok: false, conflicts: reconciled.conflicts };
  }

  const version = current.version + 1;
  await store.commit(id, reconciled.merged, version);
  return { ok: true, body: { markdown: reconciled.merged, version } };
}
