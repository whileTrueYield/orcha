/*
  Warnings:

  - Added the required column `name` to the `issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "issue" ADD COLUMN     "name" VARCHAR NOT NULL;
