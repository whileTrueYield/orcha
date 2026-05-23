/*
  Warnings:

  - Added the required column `body` to the `ticket_workflow_state_note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_workflow_state_note" ADD COLUMN     "body" TEXT NOT NULL;
