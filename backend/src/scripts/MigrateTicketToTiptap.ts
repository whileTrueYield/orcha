/**
 * Convert markdown ticket descriptions to a YJS tiptap record
 */

import prisma from "../prisma";
import { markdownToTipTapDoc } from "../mocker/demo/markdownToDoc";
import { tiptapToYdoc } from "../utils/tiptap";
import * as Y from "yjs";

async function run() {
  const migrations = [];

  let migration = {
    type: "ticket",
    count: 0,
    migrated: 0,
    overwritten: 0,
  };

  const tickets = await prisma.ticket.findMany({});
  for (const ticket of tickets) {
    migration.count++;
    if (ticket.description) {
      const tipTapDoc = markdownToTipTapDoc(ticket.description);
      const doc = tiptapToYdoc(tipTapDoc);

      const ticketText = await prisma.ticketText.findFirst({
        where: { ticketId: ticket.id },
      });

      if (ticketText) {
        await prisma.ticketText.update({
          where: { ticketId: ticketText.id },
          data: {
            bytes: Buffer.from(Y.encodeStateAsUpdate(doc)),
          },
        });

        migration.migrated++;
        migration.overwritten++;
      } else {
        await prisma.ticketText.create({
          data: {
            ticketId: ticket.id,
            bytes: Buffer.from(Y.encodeStateAsUpdate(doc)),
          },
        });

        migration.migrated++;
      }
    }
  }
  migrations.push(migration);

  migration = {
    type: "comment",
    count: 0,
    migrated: 0,
    overwritten: 0,
  };
  const comments = await prisma.comment.findMany({});
  for (const comment of comments) {
    migration.count++;
    // if the comment body starts with "{" it was already
    // converted to a tiptap doc
    if (comment.body && !comment.body.startsWith("{")) {
      const tipTapDoc = markdownToTipTapDoc(comment.body);

      await prisma.comment.update({
        where: { id: comment.id },
        data: {
          body: JSON.stringify(tipTapDoc),
        },
      });

      migration.migrated++;
    }
  }
  migrations.push(migration);

  migration = {
    type: "comment reply",
    count: 0,
    migrated: 0,
    overwritten: 0,
  };
  const commentReplies = await prisma.commentReply.findMany({});
  for (const commentReply of commentReplies) {
    migration.count++;
    // if the comment reply body starts with "{" it was already
    // converted to a tiptap doc
    if (commentReply.body && !commentReply.body.startsWith("{")) {
      const tipTapDoc = markdownToTipTapDoc(commentReply.body);

      await prisma.commentReply.update({
        where: { id: commentReply.id },
        data: {
          body: JSON.stringify(tipTapDoc),
        },
      });

      migration.migrated++;
    }
  }
  migrations.push(migration);

  migration = {
    type: "workflow note",
    count: 0,
    migrated: 0,
    overwritten: 0,
  };
  const ticketWorkflowStateNotes =
    await prisma.ticketWorkflowStateNote.findMany({});
  for (const ticketWorkflowStateNote of ticketWorkflowStateNotes) {
    migration.count++;
    // if the transition note starts with "{" it was already
    // converted to a tiptap doc
    if (
      ticketWorkflowStateNote.body &&
      !ticketWorkflowStateNote.body.startsWith("{")
    ) {
      const tipTapDoc = markdownToTipTapDoc(ticketWorkflowStateNote.body);

      await prisma.ticketWorkflowStateNote.update({
        where: { id: ticketWorkflowStateNote.id },
        data: {
          body: JSON.stringify(tipTapDoc),
        },
      });

      migration.migrated++;
    }
  }
  migrations.push(migration);

  migration = {
    type: "ticket closing note",
    count: 0,
    migrated: 0,
    overwritten: 0,
  };
  for (const ticket of tickets) {
    migration.count++;
    // if the transition note starts with "{" it was already
    // converted to a tiptap doc
    if (ticket.closingNote && !ticket.closingNote.startsWith("{")) {
      const tipTapDoc = markdownToTipTapDoc(ticket.closingNote);

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          closingNote: JSON.stringify(tipTapDoc),
        },
      });

      migration.migrated++;
    }
  }
  migrations.push(migration);

  console.table(migrations);
}

run();
