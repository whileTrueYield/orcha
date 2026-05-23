-- CreateTable
CREATE TABLE "user_email_change" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousEmail" VARCHAR NOT NULL,
    "newEmail" VARCHAR NOT NULL,

    CONSTRAINT "user_email_change_pkey" PRIMARY KEY ("id")
);
