/*
  Warnings:

  - You are about to drop the column `description` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `ticket` table. All the data in the column will be lost.
  - Made the column `projectId` on table `ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_projectId_fkey";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "description",
ADD COLUMN     "ancestorIsArchived" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "stage" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "deadline",
ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Estimate_start_p80_idx" ON "Estimate"("start_p80");

-- CreateIndex
CREATE INDEX "project_ancestorIsArchived_idx" ON "project"("ancestorIsArchived");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Moving a project to root clear any potential previous archive state
CREATE OR REPLACE FUNCTION move_project_to_root()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stage of all children projects
  UPDATE project
  SET "ancestorIsArchived" = FALSE
  WHERE id = NEW.id;
  
  -- Return the updated project record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- inherit value of ancestorIsArchived from the parent
CREATE OR REPLACE FUNCTION inherit_archive_value_from_parent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stage of all children projects
  UPDATE project
  SET "ancestorIsArchived" = (
	  SELECT 
		project.stage = 'ARCHIVED' OR 
		project."ancestorIsArchived" IS TRUE
	  FROM project 
	  WHERE project.id = NEW."parentId"
  )
  WHERE 
  	id = NEW.id;
	
  -- Return the updated project record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- archive all children of a given project
CREATE OR REPLACE FUNCTION archive_all_children()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stage of all children projects
  UPDATE project
  SET "ancestorIsArchived" = TRUE
  WHERE "parentId" = NEW.id;
  
  -- Return the updated project record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- unarchive all children of a given project
CREATE OR REPLACE FUNCTION unarchive_all_children()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the stage of all sub-projects
  UPDATE project
  SET "ancestorIsArchived" = FALSE
  WHERE "parentId" = NEW.id;
  
  -- Return the updated project record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Delete pre-existing triggers
DROP TRIGGER IF EXISTS change_project_parent_trigger ON project;
DROP TRIGGER IF EXISTS move_project_to_root_trigger ON project;
DROP TRIGGER IF EXISTS archive_project_trigger ON project;
DROP TRIGGER IF EXISTS archive_sub_project_trigger ON project;
DROP TRIGGER IF EXISTS unarchive_project_trigger ON project;
DROP TRIGGER IF EXISTS unarchive_sub_project_trigger ON project;

-- when we move a project under a new parent
CREATE TRIGGER change_project_parent_trigger
AFTER UPDATE OF "parentId" ON project
FOR EACH ROW
WHEN (OLD."parentId" IS DISTINCT FROM NEW."parentId" AND NEW."parentId" IS NOT NULL)
EXECUTE FUNCTION inherit_archive_value_from_parent();

-- when we move a project to the root (set parentId to NULL)
CREATE TRIGGER move_project_to_root_trigger
AFTER UPDATE OF "parentId" ON project
FOR EACH ROW
WHEN (OLD."parentId" IS DISTINCT FROM NEW."parentId" AND NEW."parentId" IS NULL)
EXECUTE FUNCTION move_project_to_root();

-- when we ARCHIVE a project
CREATE TRIGGER archive_project_trigger
AFTER UPDATE OF "stage" ON project
FOR EACH ROW
WHEN (OLD.stage IS DISTINCT FROM NEW.stage AND NEW.stage = 'ARCHIVED')
EXECUTE FUNCTION archive_all_children();

-- when we ARCHIVE a sub-project (children, grand children... of archived project)
CREATE TRIGGER archive_sub_project_trigger
AFTER UPDATE OF "ancestorIsArchived" ON project
FOR EACH ROW
WHEN (OLD."ancestorIsArchived" IS DISTINCT FROM NEW."ancestorIsArchived" AND NEW."ancestorIsArchived" IS TRUE)
EXECUTE FUNCTION archive_all_children();

-- when we UNARCHIVE a project
CREATE TRIGGER unarchive_project_trigger
AFTER UPDATE OF "stage" ON project
FOR EACH ROW
WHEN (OLD.stage IS DISTINCT FROM NEW.stage AND OLD.stage = 'ARCHIVED' AND NEW."ancestorIsArchived" IS FALSE)
EXECUTE FUNCTION unarchive_all_children();

-- when we UNARCHIVE a child project
CREATE TRIGGER unarchive_sub_project_trigger
AFTER UPDATE OF "ancestorIsArchived" ON project
FOR EACH ROW
WHEN (OLD."ancestorIsArchived" IS DISTINCT FROM NEW."ancestorIsArchived" AND NEW."ancestorIsArchived" IS FALSE)
EXECUTE FUNCTION unarchive_all_children();
