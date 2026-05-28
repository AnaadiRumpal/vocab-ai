import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewDeck, type ReviewDeckCard } from "@/components/review-deck";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReviewInfoDialog } from "@/components/review-info-dialog";
import { LoadingLinkButton } from "@/components/loading-link-button";
import { WordStatus } from "@/app/generated/prisma/client";

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export default async function ReviewPage() {
    const session = await auth();

    if (!session?.user?.id) {
    redirect("/");
    }

    const userId = session.user.id;

    const dueWhere = {
      userId,
      status: {
        not: WordStatus.ARCHIVED,
      },
      dueAt: {
        lte: new Date(),
      },
    };

    const [words, totalDueCount] = await Promise.all([
      db.word.findMany({
        where: dueWhere,
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        take: 20,
      }),

      db.word.count({
        where: dueWhere,
      }),
    ]);

  const reviewCards: ReviewDeckCard[] = words.map((word) => ({
    id: word.id,
    term: word.term,
    kind: word.kind,
    meaning: word.meaning,
    plainEnglish: word.plainEnglish,
    examples: toStringArray(word.examples),
    synonyms: toStringArray(word.synonyms),
    mnemonic: word.mnemonic,
    difficulty: word.difficulty,
  }));

  return (
    <main className="flex min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <header className="flex items-center gap-3">
            <LoadingLinkButton
              href="/"
              variant="outline"
              size="sm"
              className="inline-flex cursor-pointer items-center gap-2"
            >
              <>
                <ArrowLeft className="h-4 w-4" />
                Home
              </>
            </LoadingLinkButton>
          <div>
            <p className="text-sm text-muted-foreground">
              Daily memory workout
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Today’s review
            </h1>
          </div>
          <ReviewInfoDialog />
        </header>

        {reviewCards.length === 0 ? (
        <Card className="border-primary/10 bg-gradient-to-b from-primary/[0.03] to-background">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div
              className="
                mb-4
                flex h-16 w-16 items-center justify-center
                rounded-full
                bg-primary/10
              "
            >
              ✨
            </div>

            <h2 className="text-xl font-semibold tracking-tight">
              You’re all caught up
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              No reviews waiting right now. Come back later to keep your memory sharp.
            </p>
          </CardContent>
        </Card>
        ) : (
          <ReviewDeck
            words={reviewCards}
            totalDueCount={totalDueCount}
          />
        )}
      </div>
    </main>
  );
}