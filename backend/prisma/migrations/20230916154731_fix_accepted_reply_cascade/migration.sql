-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_acceptedReplyId_fkey";

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_acceptedReplyId_fkey" FOREIGN KEY ("acceptedReplyId") REFERENCES "comment_reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
