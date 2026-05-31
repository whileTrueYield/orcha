/**
 * saveDocumentBody mutation (#40) — the single write path for every Markdown
 * document body (ticket, project, documentation page), shared by the web app
 * (GraphQL) and the `/v1` REST surface (which executes this same mutation).
 *
 * Optimistic concurrency (ADR 0007): the caller sends the `baseVersion` it read.
 * A matching base fast-forwards; a stale base 3-way merges; a genuine overlap
 * returns a conflict (git-markered Markdown + the current version) without
 * writing. On a successful write the body's mentions are resolved to id-bearing
 * directives — firing notifications and surfacing unresolved-mention warnings —
 * and the parent's `indexableContent` is repopulated for search.
 *
 * Tenant scoping: the body repository keys on a raw parent id with no org check,
 * so this resolver first asserts the parent belongs to the caller's
 * Organization (NOT_FOUND otherwise) before touching the body.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import type { BodyType } from "../../../markdown/bodyRepository";
import {
  DocumentBodyTypeEnum,
  SaveDocumentBodyResultRef,
  type SaveDocumentBodyResultShape,
} from "../entity";
import { assertDocumentWritable } from "../helper";
import { writeDocumentBody } from "../writeDocumentBody";

builder.mutationField("saveDocumentBody", (t) =>
  t.field({
    type: SaveDocumentBodyResultRef,
    authScopes: { hasRole: true },
    args: {
      documentType: t.arg({ type: DocumentBodyTypeEnum, required: true }),
      documentId: t.arg.int({ required: true }),
      markdown: t.arg.string({ required: true }),
      baseVersion: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<SaveDocumentBodyResultShape> => {
      const me = ctx.me as AuthRoleContext;
      const type = args.documentType as BodyType;

      await assertDocumentWritable(type, args.documentId, me.organizationId);

      return writeDocumentBody({
        type,
        id: args.documentId,
        markdown: args.markdown,
        baseVersion: args.baseVersion,
        organizationId: me.organizationId,
        actorRoleId: me.roleId,
      });
    },
  }),
);
