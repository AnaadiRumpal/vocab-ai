-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEWING', 'MASTERED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewRating" AS ENUM ('FORGOT', 'HARD', 'GOOD', 'EASY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "captureToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "sourceText" TEXT,
    "partOfSpeech" TEXT,
    "meaning" TEXT NOT NULL,
    "plainEnglish" TEXT,
    "examples" JSONB NOT NULL,
    "synonyms" JSONB NOT NULL,
    "mnemonic" TEXT,
    "etymology" TEXT,
    "difficulty" INTEGER,
    "status" "WordStatus" NOT NULL DEFAULT 'NEW',
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" "ReviewRating" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_captureToken_key" ON "User"("captureToken");

-- CreateIndex
CREATE INDEX "Word_userId_dueAt_idx" ON "Word"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_term_key" ON "Word"("userId", "term");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_reviewedAt_idx" ON "ReviewLog"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewLog_wordId_idx" ON "ReviewLog"("wordId");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
