"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Volume2 } from "lucide-react";

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

function getDifficultyBadge(difficulty: number | null) {
  if (difficulty === 1) {
    return {
      label: "Common",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (difficulty === 2) {
    return {
      label: "Familiar",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  if (difficulty === 3) {
    return {
      label: "Intermediate",
      className: "border-violet-200 bg-violet-50 text-amber-700",
    };
  }

  if (difficulty === 4) {
    return {
      label: "Advanced",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    };
  }

  if (difficulty === 5) {
    return {
      label: "Rare",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "Unrated",
    className: "border-muted bg-muted/40 text-muted-foreground",
  };
}

function speakWord(word: string) {
  if (typeof window === "undefined") return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);

  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();

  const preferredVoice =
    voices.find((v) => v.name.toLowerCase().includes("google")) ||
    voices.find((v) => v.lang.startsWith("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function ReviewDeck({
  words,
  totalDueCount,
}: {
  words: ReviewDeckCard[];
  totalDueCount: number;
}) {  const [queue, setQueue] = useState<ReviewDeckCard[]>(words);
  const [completedCount, setCompletedCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

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
    if (!current || pending || isExiting) {
      return;
    }

    setIsExiting(true);

    await new Promise((resolve) => setTimeout(resolve, 260));

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
      setRevealed(false);
      setError(null);
      setIsExiting(false);

      return;
    }

    setPending(true);
    setError(null);

    try {
      await submitReview(current.id, current.isRetry ? "FORGOT" : rating);

      setQueue(rest);
      setCompletedCount((count) => count + 1);
      setRevealed(false);
    } catch {
      setError("Could not save this review. Try again.");
    } finally {
      setPending(false);
      setIsExiting(false);
    }
  }

  if (!current) {
    const remainingOutsideSession =
      totalDueCount - completedCount;

    return (
      <Card
        className="
          overflow-hidden
          border-primary/20
          bg-gradient-to-b
          from-primary/[0.05]
          to-background
        "
      >
        <CardContent className="flex flex-col items-center py-14 text-center">
          <div
            className="
              mb-5
              flex h-20 w-20 items-center justify-center
              rounded-full
              bg-primary/10
              animate-in zoom-in duration-500
            "
          >
            <Check className="h-10 w-10 text-primary" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            Round complete ✨
          </h2>

          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            You reviewed {completedCount} word
            {completedCount === 1 ? "" : "s"} this round.
          </p>

          {remainingOutsideSession > 0 ? (
            <>
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  bg-muted/40
                  px-4
                  py-3
                  text-sm
                "
              >
                {remainingOutsideSession} more waiting today
              </div>

              <Button
                className="mt-5 w-full"
                onClick={() => window.location.reload()}
              >
                Start next round
              </Button>
            </>
          ) : (
            <div
              className="
                mt-5
                rounded-xl
                border
                bg-primary/[0.04]
                px-4
                py-3
                text-sm
                text-muted-foreground
              "
            >
              You’re fully caught up for today 🎉
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  const sessionCardCount = words.length;

  const totalCardsLeft =
    totalDueCount - completedCount;

  const progress =
    sessionCardCount === 0
      ? 100
      : (completedCount / sessionCardCount) * 100;

  const difficultyBadge = getDifficultyBadge(current.difficulty);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              {queue.length} word
              {queue.length === 1 ? "" : "s"} left in this round
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {totalCardsLeft > queue.length
                ? `${totalCardsLeft} total waiting today`
                : "You’re on your final round today"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold">
              {Math.round(progress)}%
            </p>

            <p className="text-xs text-muted-foreground">
              cleared
            </p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-primary
              to-primary/70
              shadow-[0_0_18px_rgba(99,102,241,0.35)]
              transition-all
              duration-500
              ease-out
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {queue.length <= 5 ? (
          <div
            className="
              rounded-xl
              border
              bg-primary/[0.03]
              px-3
              py-2
              text-xs
              text-muted-foreground
              animate-in fade-in duration-500
            "
          >
            {queue.length === 1
              ? "Last word. Finish strong ✨"
              : queue.length <= 3
              ? "Final stretch 🔥"
              : "You’re almost done"}
          </div>
        ) : null}
      </div>
      <Card
        className={[
          `
          transition-all
          duration-300
          ease-out
          will-change-transform
          relative
          overflow-hidden
          
          before:absolute
          before:inset-0
          before:bg-gradient-to-br
          before:via-transparent
          before:to-muted/10
          before:opacity-70
          before:pointer-events-none
          `,
          current.difficulty === 1
          ? "before:bg-emerald-500/5"
          : current.difficulty === 2
          ? "before:bg-sky-500/5"
          : current.difficulty === 3
          ? "before:bg-violet-500/5"
          : current.difficulty === 4
          ? "before:bg-pink-500/5"
          : current.difficulty === 5
          ? "before:bg-rose-500/5"
          : "before:bg-primary/5",
          current.isRetry
            ? "border-2 border-amber-500 shadow-sm shadow-amber-500/20"
            : "",
            isExiting
            ? "-translate-x-24 rotate-[-10deg] scale-[0.94] opacity-0 blur-[1px]"
            : "translate-x-0 rotate-0 scale-100 opacity-100 blur-0",
        ].join(" ")}
      >
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center gap-2">
            <Badge variant="secondary">
              {current.kind.replaceAll("_", " ")}
            </Badge>

            <Badge variant="outline" className={difficultyBadge.className}>
              {difficultyBadge.label}
            </Badge>

            {current.isRetry ? (
              <Badge variant="outline">Retry</Badge>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-3">
          <CardTitle className="text-4xl tracking-tight">
            {current.term}
          </CardTitle>

          <Button
            size="icon"
            variant="ghost"
            className="
              h-10
              w-10
              rounded-full
              text-muted-foreground
              transition-all
              duration-200

              hover:bg-primary/10
              hover:text-primary
              hover:scale-110
            "
            onClick={(e) => {
              e.stopPropagation();
              speakWord(current.term);
            }}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
        </CardHeader>

          <CardContent className="flex flex-col items-center gap-5  text-center">
            {!revealed ? (
            <Button
              type="button"
              size="lg"
              onClick={() => setRevealed(true)}
              className="
                h-14
                w-full
                max-w-xs
                cursor-pointer
                rounded-2xl
                bg-muted/60
                text-foreground
                backdrop-blur
                border border-border/60
                shadow-lg
                shadow-primary/10
                hover:scale-[1.015]
                hover:bg-muted
                hover:shadow-xl
                transition-all
                duration-500
                ease-out
                animate-[softReveal_3s_ease-in-out_infinite]
              "
            >
              <span className="tracking-wide font-semibold text-sm">
                Reveal meaning
              </span>
            </Button>
          ) : (
            <div className="animate-in fade-in duration-300 flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Meaning
                </p>

                <p className="mt-1 text-lg">
                  {current.meaning}
                </p>
              </div>

              {current.plainEnglish ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Plain English
                  </p>

                  <p className="mt-1">
                    {current.plainEnglish}
                  </p>
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

              {current.synonyms.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {current.synonyms.slice(0, 6).map((synonym, index) => (
                    <Badge key={index} variant="outline">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {current.mnemonic ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Memory trick
                  </p>

                  <p className="mt-1 text-sm">
                    {current.mnemonic}
                  </p>
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>


        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
          <Button
            variant="outline"
            disabled={pending}
            className="cursor-pointer"
            onClick={() => handleRating("FORGOT")}
          >
            Forgot
          </Button>

          <Button
            variant="outline"
            disabled={pending}
            className="cursor-pointer"
            onClick={() => handleRating("HARD")}
          >
            Hard
          </Button>

          <Button
            variant="secondary"
            disabled={pending}
            className="cursor-pointer"
            onClick={() => handleRating("GOOD")}
          >
            Good
          </Button>

          <Button
            disabled={pending}
            className="cursor-pointer"
            onClick={() => handleRating("EASY")}
          >
            Easy
          </Button>
        </div>
    </>
  );
}