-- CreateEnum
CREATE TYPE "NoteColor" AS ENUM ('YELLOW', 'BLUE', 'PURPLE', 'GREEN', 'PINK', 'ORANGE');

-- AlterTable
ALTER TABLE "note" ADD COLUMN     "color" "NoteColor" NOT NULL DEFAULT 'YELLOW';
