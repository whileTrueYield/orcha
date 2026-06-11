/**
 * Ticket.body field (#40) — reads the ticket's Markdown body + version through
 * the body repository (ADR 0007). Replaces the dead `description` computed field
 * that reconstructed TipTap JSON from Yjs bytes.
 *
 * An unwritten body reads as { markdown: "", version: 0 } (getBody's uniform
 * empty), so this field is non-nullable and callers never branch on null.
 */

import builder from "../../../schema/builder";
import { getBody } from "../../../markdown/bodyRepository";
import { DocumentBodyRef } from "../../documentBody/entity";

builder.prismaObjectField("Ticket", "body", (t) =>
  t.field({
    type: DocumentBodyRef,
    resolve: (ticket) => getBody("ticket", ticket.id),
  }),
);
