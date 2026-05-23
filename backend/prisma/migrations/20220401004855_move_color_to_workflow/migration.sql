/*
  Warnings:

  - You are about to drop the column `color` on the `ticket_workflow_state` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticket_workflow_state" DROP COLUMN "color";

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "color" VARCHAR NOT NULL DEFAULT E'lightGray';
