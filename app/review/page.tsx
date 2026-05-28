import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewDeck, type ReviewDeckCard } from "@/components/review-deck";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export default async function ReviewPage() {
    const session = await auth();

    if (!session?.user?.id) {
    redirect("/");
    }

    const userId = session.user.id;

  const words = await db.word.findMany({
    where: {
      userId,
      status: {
        not: "ARCHIVED",
      },
      dueAt: {
        lte: new Date(),
      },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 20,
  });

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
            <Button asChild variant="outline" size="sm">
            <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
            </Link>
            </Button>
          <div>
            <p className="text-sm text-muted-foreground">Review</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Due cards
            </h1>
          </div>
        </header>

        {reviewCards.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No cards due right now.
            </CardContent>
          </Card>
        ) : (
          <ReviewDeck words={reviewCards} />
        )}
      </div>
    </main>
  );
}