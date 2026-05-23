-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "acceptedReplyId" INTEGER,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_reply" (
    "id" SERIAL NOT NULL,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "organizationId" INTEGER,

    CONSTRAINT "comment_reply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_createdAt_idx" ON "comment"("createdAt");

-- CreateIndex
CREATE INDEX "comment_reply_createdAt_idx" ON "comment_reply"("createdAt");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_acceptedReplyId_fkey" FOREIGN KEY ("acceptedReplyId") REFERENCES "comment_reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reply" ADD CONSTRAINT "comment_reply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reply" ADD CONSTRAINT "comment_reply_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reply" ADD CONSTRAINT "comment_reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
