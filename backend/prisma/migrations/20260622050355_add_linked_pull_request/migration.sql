-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('OPEN', 'MERGED', 'CLOSED');

-- CreateTable
CREATE TABLE "linked_pull_request" (
    "id" SERIAL NOT NULL,
    "repoFullName" VARCHAR NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "state" "PullRequestState" NOT NULL DEFAULT 'OPEN',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "authorLogin" VARCHAR,
    "htmlUrl" VARCHAR NOT NULL,
    "githubUpdatedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "repositoryLinkId" INTEGER NOT NULL,

    CONSTRAINT "linked_pull_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LinkedPullRequestToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LinkedPullRequestToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "linked_pull_request_organizationId_idx" ON "linked_pull_request"("organizationId");

-- CreateIndex
CREATE INDEX "linked_pull_request_repositoryLinkId_idx" ON "linked_pull_request"("repositoryLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "linked_pull_request_repoFullName_number_key" ON "linked_pull_request"("repoFullName", "number");

-- CreateIndex
CREATE INDEX "_LinkedPullRequestToTicket_B_index" ON "_LinkedPullRequestToTicket"("B");

-- AddForeignKey
ALTER TABLE "linked_pull_request" ADD CONSTRAINT "linked_pull_request_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_pull_request" ADD CONSTRAINT "linked_pull_request_repositoryLinkId_fkey" FOREIGN KEY ("repositoryLinkId") REFERENCES "repository_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkedPullRequestToTicket" ADD CONSTRAINT "_LinkedPullRequestToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "linked_pull_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkedPullRequestToTicket" ADD CONSTRAINT "_LinkedPullRequestToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
