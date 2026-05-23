-- CreateEnum
CREATE TYPE "FeatureGroupStatus" AS ENUM ('ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EstimateType" AS ENUM ('TicketWorkflowState');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROTOTYPING', 'SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ModelStage" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('INVITED', 'ACCEPTED', 'REJECTED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('VISITOR', 'MEMBER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('UNSCHEDULED', 'SCHEDULED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'UNCONFIRMED', 'ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "WorkflowStateStatus" AS ENUM ('DELETED', 'ACTIVE');

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_confirmation" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "secret" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "featureGroupId" INTEGER NOT NULL,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR,
    "status" "FeatureGroupStatus" NOT NULL DEFAULT E'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "feature_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_address" (
    "id" SERIAL NOT NULL,
    "address1" VARCHAR NOT NULL,
    "address2" VARCHAR,
    "zipcode" VARCHAR NOT NULL,
    "city" VARCHAR NOT NULL,
    "state" VARCHAR,
    "country" VARCHAR NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "organization_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "about" VARCHAR,
    "coverUrl" VARCHAR,
    "status" "OrganizationStatus" NOT NULL DEFAULT E'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "mailingAddressId" INTEGER,
    "billingAddressId" INTEGER,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_upload" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "organization_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_lost" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "secret" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "password_lost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "replacedByTagId" INTEGER,

    CONSTRAINT "personal_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "code" VARCHAR NOT NULL,
    "description" VARCHAR,
    "coverUrl" VARCHAR,
    "stage" "ModelStage" NOT NULL DEFAULT E'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "type" "EstimateType" NOT NULL,
    "epoch" INTEGER NOT NULL,
    "updatedEpoch" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "end_p50" INTEGER NOT NULL,
    "end_p70" INTEGER NOT NULL,
    "end_p80" INTEGER NOT NULL,
    "end_p90" INTEGER NOT NULL,
    "end_p95" INTEGER NOT NULL,
    "start_p50" INTEGER NOT NULL,
    "start_p70" INTEGER NOT NULL,
    "start_p80" INTEGER NOT NULL,
    "start_p90" INTEGER NOT NULL,
    "start_p95" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "status" "ProjectStatus" NOT NULL DEFAULT E'PROTOTYPING',
    "stage" "ModelStage" NOT NULL DEFAULT E'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_phase" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "project_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_group" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "projectPhaseId" INTEGER NOT NULL,

    CONSTRAINT "project_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "acceptedReplyId" INTEGER,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_reply" (
    "id" SERIAL NOT NULL,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "organizationId" INTEGER,

    CONSTRAINT "question_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "timeZone" VARCHAR NOT NULL DEFAULT E'Etc/UTC',
    "name" VARCHAR NOT NULL,
    "title" VARCHAR,
    "description" VARCHAR,
    "avatarUrl" VARCHAR,
    "coverUrl" VARCHAR,
    "workWeek" VARCHAR NOT NULL DEFAULT E'{}',
    "status" "RoleStatus" NOT NULL DEFAULT E'INVITED',
    "type" "RoleType" NOT NULL DEFAULT E'MEMBER',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_item" (
    "id" SERIAL NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "stoppedAt" TIMESTAMPTZ(6),
    "note" TEXT,
    "ticketWorkflowStateId" INTEGER NOT NULL,
    "nextTicketWorkflowStateId" INTEGER,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,

    CONSTRAINT "schedule_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "featureId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_rating" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "skill_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "replacedByTagId" INTEGER,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "code" VARCHAR NOT NULL,
    "coverUrl" VARCHAR,
    "description" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "localId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT E'UNSCHEDULED',
    "stage" "ModelStage" NOT NULL DEFAULT E'DRAFT',
    "description" VARCHAR,
    "difficulty" INTEGER,
    "deadline" TIMESTAMPTZ(6),
    "authorId" INTEGER NOT NULL,
    "productId" INTEGER,
    "workflowId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "groupPosition" INTEGER,
    "projectGroupId" INTEGER,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_priority_filter" (
    "id" SERIAL NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "schedulePriorityId" INTEGER NOT NULL,

    CONSTRAINT "schedule_priority_filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_priority" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "schedule_priority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_workflow_state" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" VARCHAR NOT NULL DEFAULT E'lightGray',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "complete" INTEGER NOT NULL DEFAULT 0,
    "todo" INTEGER NOT NULL DEFAULT 0,
    "fractionable" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "checklist" VARCHAR NOT NULL DEFAULT E'[]',
    "estimateMinimum" INTEGER,
    "estimateMostLikely" INTEGER,
    "estimateMaximum" INTEGER,
    "estimate" TIMESTAMPTZ(6),
    "assigneeId" INTEGER,
    "ticketId" INTEGER NOT NULL,
    "workflowStateId" INTEGER,

    CONSTRAINT "ticket_workflow_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "timeZone" VARCHAR NOT NULL DEFAULT E'Etc/UTC',
    "password" VARCHAR NOT NULL,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT E'INVITED',
    "about" VARCHAR,
    "coverUrl" VARCHAR,
    "avatarUrl" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_upload" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "stage" "ModelStage" NOT NULL DEFAULT E'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_state" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "color" VARCHAR NOT NULL DEFAULT E'lightGray',
    "status" "WorkflowStateStatus" NOT NULL DEFAULT E'ACTIVE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "workflowId" INTEGER NOT NULL,

    CONSTRAINT "workflow_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeatureToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FeatureToSchedulePriorityFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PersonalTagToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToWorkflow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToSchedulePriorityFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoleToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SchedulePriorityFilterToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PrimaryTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BackupTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TicketAncestry" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SchedulePriorityToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SchedulePriorityFilterToWorkflow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "comment_createdAt_idx" ON "comment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_confirmation_email_key" ON "email_confirmation"("email");

-- CreateIndex
CREATE INDEX "email_confirmation_email_idx" ON "email_confirmation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_name_key" ON "organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "password_lost_email_key" ON "password_lost"("email");

-- CreateIndex
CREATE INDEX "password_lost_email_idx" ON "password_lost"("email");

-- CreateIndex
CREATE INDEX "personal_tag_name_idx" ON "personal_tag"("name");

-- CreateIndex
CREATE INDEX "product_stage_idx" ON "product"("stage");

-- CreateIndex
CREATE INDEX "product_code_idx" ON "product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_id_type_epoch_organizationId_key" ON "Estimate"("id", "type", "epoch", "organizationId");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "project_stage_idx" ON "project"("stage");

-- CreateIndex
CREATE INDEX "question_createdAt_idx" ON "question"("createdAt");

-- CreateIndex
CREATE INDEX "question_reply_createdAt_idx" ON "question_reply"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "one_role_per_user_and_organization" ON "role"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "schedule_item_startedAt_idx" ON "schedule_item"("startedAt");

-- CreateIndex
CREATE INDEX "schedule_item_stoppedAt_idx" ON "schedule_item"("stoppedAt");

-- CreateIndex
CREATE UNIQUE INDEX "one_skill_per_role_and_feature" ON "skill"("roleId", "featureId");

-- CreateIndex
CREATE INDEX "tag_name_idx" ON "tag"("name");

-- CreateIndex
CREATE INDEX "team_code_idx" ON "team"("code");

-- CreateIndex
CREATE INDEX "ticket_stage_idx" ON "ticket"("stage");

-- CreateIndex
CREATE INDEX "ticket_status_idx" ON "ticket"("status");

-- CreateIndex
CREATE INDEX "ticket_localId_idx" ON "ticket"("localId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_localId_productId_key" ON "ticket"("localId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_priority_organizationId_key" ON "schedule_priority"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "workflow_stage_idx" ON "workflow"("stage");

-- CreateIndex
CREATE INDEX "workflow_name_idx" ON "workflow"("name");

-- CreateIndex
CREATE INDEX "workflow_state_status_idx" ON "workflow_state"("status");

-- CreateIndex
CREATE INDEX "workflow_state_name_idx" ON "workflow_state"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureToTicket_AB_unique" ON "_FeatureToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureToTicket_B_index" ON "_FeatureToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureToSchedulePriorityFilter_AB_unique" ON "_FeatureToSchedulePriorityFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureToSchedulePriorityFilter_B_index" ON "_FeatureToSchedulePriorityFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PersonalTagToTicket_AB_unique" ON "_PersonalTagToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonalTagToTicket_B_index" ON "_PersonalTagToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToWorkflow_AB_unique" ON "_ProductToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToWorkflow_B_index" ON "_ProductToWorkflow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSchedulePriorityFilter_AB_unique" ON "_ProductToSchedulePriorityFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSchedulePriorityFilter_B_index" ON "_ProductToSchedulePriorityFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToTeam_AB_unique" ON "_RoleToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToTeam_B_index" ON "_RoleToTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTicket_AB_unique" ON "_TagToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTicket_B_index" ON "_TagToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SchedulePriorityFilterToTag_AB_unique" ON "_SchedulePriorityFilterToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_SchedulePriorityFilterToTag_B_index" ON "_SchedulePriorityFilterToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PrimaryTeam_AB_unique" ON "_PrimaryTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_PrimaryTeam_B_index" ON "_PrimaryTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BackupTeam_AB_unique" ON "_BackupTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_BackupTeam_B_index" ON "_BackupTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TicketAncestry_AB_unique" ON "_TicketAncestry"("A", "B");

-- CreateIndex
CREATE INDEX "_TicketAncestry_B_index" ON "_TicketAncestry"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SchedulePriorityToTicket_AB_unique" ON "_SchedulePriorityToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_SchedulePriorityToTicket_B_index" ON "_SchedulePriorityToTicket"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SchedulePriorityFilterToWorkflow_AB_unique" ON "_SchedulePriorityFilterToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_SchedulePriorityFilterToWorkflow_B_index" ON "_SchedulePriorityFilterToWorkflow"("B");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feature_group" ADD CONSTRAINT "feature_group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feature_group" ADD CONSTRAINT "feature_group_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organization_address" ADD CONSTRAINT "organization_address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_mailingAddressId_fkey" FOREIGN KEY ("mailingAddressId") REFERENCES "organization_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "organization_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organization_upload" ADD CONSTRAINT "organization_upload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organization_upload" ADD CONSTRAINT "organization_upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_replacedByTagId_fkey" FOREIGN KEY ("replacedByTagId") REFERENCES "personal_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_phase" ADD CONSTRAINT "project_phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_group" ADD CONSTRAINT "project_group_projectPhaseId_fkey" FOREIGN KEY ("projectPhaseId") REFERENCES "project_phase"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_acceptedReplyId_fkey" FOREIGN KEY ("acceptedReplyId") REFERENCES "question_reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_ticketWorkflowStateId_fkey" FOREIGN KEY ("ticketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_nextTicketWorkflowStateId_fkey" FOREIGN KEY ("nextTicketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skill_rating" ADD CONSTRAINT "skill_rating_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_replacedByTagId_fkey" FOREIGN KEY ("replacedByTagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_projectGroupId_fkey" FOREIGN KEY ("projectGroupId") REFERENCES "project_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_priority_filter" ADD CONSTRAINT "schedule_priority_filter_schedulePriorityId_fkey" FOREIGN KEY ("schedulePriorityId") REFERENCES "schedule_priority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_priority" ADD CONSTRAINT "schedule_priority_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "workflow_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_upload" ADD CONSTRAINT "user_upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_FeatureToTicket" ADD FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToSchedulePriorityFilter" ADD FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToSchedulePriorityFilter" ADD FOREIGN KEY ("B") REFERENCES "schedule_priority_filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonalTagToTicket" ADD FOREIGN KEY ("A") REFERENCES "personal_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonalTagToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToWorkflow" ADD FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToWorkflow" ADD FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSchedulePriorityFilter" ADD FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSchedulePriorityFilter" ADD FOREIGN KEY ("B") REFERENCES "schedule_priority_filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTeam" ADD FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTeam" ADD FOREIGN KEY ("B") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTicket" ADD FOREIGN KEY ("A") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToTag" ADD FOREIGN KEY ("A") REFERENCES "schedule_priority_filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToTag" ADD FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrimaryTeam" ADD FOREIGN KEY ("A") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrimaryTeam" ADD FOREIGN KEY ("B") REFERENCES "workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackupTeam" ADD FOREIGN KEY ("A") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackupTeam" ADD FOREIGN KEY ("B") REFERENCES "workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketAncestry" ADD FOREIGN KEY ("A") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketAncestry" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityToTicket" ADD FOREIGN KEY ("A") REFERENCES "schedule_priority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToWorkflow" ADD FOREIGN KEY ("A") REFERENCES "schedule_priority_filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToWorkflow" ADD FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
