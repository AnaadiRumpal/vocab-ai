/*
  Warnings:

  - A unique constraint covering the columns `[userId,normalized]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalized` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TermKind" AS ENUM ('WORD', 'PHRASE', 'IDIOM', 'PHRASAL_VERB', 'TECHNICAL_TERM', 'OTHER');

-- DropIndex
DROP INDEX "Word_userId_term_key";

-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "kind" "TermKind" NOT NULL DEFAULT 'WORD',
ADD COLUMN     "normalized" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_normalized_key" ON "Word"("userId", "normalized");
