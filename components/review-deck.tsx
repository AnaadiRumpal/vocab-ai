"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewRating = "FORGOT" | "HARD" | "GOOD" | "EASY";

export type ReviewDeckCard = {
  id: string;
  term: string;
  kind: string;
  meaning: string;
  plainEnglish: string | null;
  examples: string[];
  synonyms: string[];
  mnemonic: string | null;
  difficulty: number | null;
  isRetry?: boolean;
};

export function ReviewDeck({ words }: { words: ReviewDeckCard[] }) {
  const [queue, setQueue] = useState<ReviewDeckCard[]>(words);
  const [completedCount, setCompletedCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = queue[0];

  async function submitReview(wordId: string, rating: ReviewRating) {
    const response = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wordId, rating }),
    });

    if (!response.ok) {
      throw new Error("Review update failed.");
    }
  }

  async function handleRating(rating: ReviewRating) {
    if (!current || pending) {
      return;
    }

    const rest = queue.slice(1);

    if (rating === "FORGOT" && !current.isRetry) {
      const retryCard = {
        ...current,
        isRetry: true,
      };

      const nextQueue = [...rest];
      const insertAt =
        nextQueue.length === 0
          ? 0
          : Math.floor(Math.random() * nextQueue.length) + 1;

      nextQueue.splice(insertAt, 0, retryCard);
      setQueue(nextQueue);
      setError(null);
      return;
    }

    setPending(true);
    setError(null);

    try {
      await submitReview(current.id, current.isRetry ? "FORGOT" : rating);
      setQueue(rest);
      setCompletedCount((count) => count + 1);
    } catch {
      setError("Could not save this review. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (!current) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Review session complete.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {queue.length} card{queue.length === 1 ? "" : "s"} in session
        </span>
        <span>{completedCount} done</span>
      </div>

      <Card
        className={[
          "min-h-[420px] transition-colors",
          current.isRetry
            ? "border-2 border-amber-500 shadow-sm shadow-amber-500/20"
            : "",
        ].join(" ")}
      >
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center gap-2">
            <Badge variant="secondary">{current.kind.replaceAll("_", " ")}</Badge>
            {current.isRetry ? <Badge variant="outline">Retry</Badge> : null}
          </div>

          <CardTitle className="text-4xl">{current.term}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Meaning</p>
            <p className="mt-1 text-lg">{current.meaning}</p>
          </div>

          {current.plainEnglish ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Plain English
              </p>
              <p className="mt-1">{current.plainEnglish}</p>
            </div>
          ) : null}

          {current.examples.length > 0 ? (
            <div className="text-left">
              <p className="text-center text-sm font-medium text-muted-foreground">
                Examples
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {current.examples.slice(0, 3).map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {current.mnemonic ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Memory trick
              </p>
              <p className="mt-1 text-sm">{current.mnemonic}</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => handleRating("FORGOT")}
        >
          Forgot
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => handleRating("HARD")}
        >
          Hard
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => handleRating("GOOD")}
        >
          Good
        </Button>
        <Button disabled={pending} onClick={() => handleRating("EASY")}>
          Easy
        </Button>
      </div>
    </>
  );
}