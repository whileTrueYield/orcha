/*
  Warnings:

  - Added the required column `ipAddress` to the `user_email_change` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_email_change" ADD COLUMN     "ipAddress" VARCHAR NOT NULL;
