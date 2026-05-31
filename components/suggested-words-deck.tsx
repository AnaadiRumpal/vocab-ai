"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Check,
  Loader2,
} from "lucide-react";

import type {
  VocabEntry,
} from "@/lib/vocab-generator";
import { getDifficultyBadge } from "./utils/utils";
import { useRouter } from "next/navigation";

type QueueWord = {
  relatedTo: string;
  reason: string;

  entry: VocabEntry;
};

export function SuggestedWordsDeck() {
const [queue, setQueue] = useState<QueueWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);


  const [initialCount, setInitialCount] = useState(0);
  const [completed, setCompleted] = useState(0);

  const current = queue.length > 0 ? queue[0] : null;

  const router = useRouter();

  useEffect(() => {
    router.prefetch("/suggested-words/learn");
    router.prefetch("/suggested-words");
  }, [router]);

  /**
   * ✅ FIX: Handle iOS / Safari / Chrome back-forward cache correctly
   * Prevents loading state + stale UI on swipe navigation
   */
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // restored from bfcache → DO NOT show loader again
        setLoading(false);
        setIsExiting(false);
      }
    };

    const handlePageHide = () => {
      // mark that we are leaving page cleanly
      // helps prevent weird rehydration flickers
      setIsExiting(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

useEffect(() => {
  try {
    const stored = sessionStorage.getItem("suggestedWords");

    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed: QueueWord[] = JSON.parse(stored);

    setInitialCount(parsed.length);
    setQueue(parsed);
  } finally {
    setLoading(false);
  }
}, []);


function nextCard() {
  setIsExiting(true);

  const rest = queue.slice(1);

  setTimeout(() => {
    setQueue(rest);
    setIsExiting(false); // reset AFTER animation
  }, 250); // match your CSS duration

  sessionStorage.setItem(
    "suggestedWords",
    JSON.stringify(rest)
  );

  setCompleted((value) => value + 1);
}

 async function addWord() {
  if (!current) return;

  try {
    setSaving(true);

    const response =
      await fetch(
        "/api/words",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            entry:
              current.entry,
          }),
        }
      );

    if (!response.ok) {
      return;
    }

    nextCard();
  } finally {
    setSaving(false);
  }
}

  const progress =
  initialCount === 0
    ? 0
    : (completed / initialCount) * 100;

  const difficultyBadge = getDifficultyBadge(
    current?.entry.difficulty ?? null
  );

  if (!loading && queue.length === 0) {
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
            Suggested words complete ✨
            </h2>

            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            You processed {completed} suggested word
            {completed === 1 ? "" : "s"}.
            </p>

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
            Your selected words have been reviewed.
            </div>
        </CardContent>
        </Card>
    );
    }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Loading vocabulary card...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
            <div>
            <p className="text-sm font-medium">
                {queue.length} word
                {queue.length === 1 ? "" : "s"} left
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                {completed} processed so far
            </p>
            </div>

            <div className="text-right">
            <p className="text-sm font-semibold">
                {Math.round(progress)}%
            </p>

            <p className="text-xs text-muted-foreground">
                complete
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
                transition-all
                duration-500
            "
            style={{
                width: `${progress}%`,
            }}
            />
        </div>

        {queue.length <= 3 && queue.length > 0 ? (
            <div
            className="
                rounded-xl
                border
                bg-primary/[0.03]
                px-3
                py-2
                text-xs
                text-muted-foreground
            "
            >
            {queue.length === 1
                ? "Last word ✨"
                : "Almost finished 🔥"}
            </div>
        ) : null}
        </div>

      <Card className={[
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
          current?.entry.difficulty === 1
          ? "before:bg-emerald-500/5"
          : current?.entry.difficulty === 2
          ? "before:bg-sky-500/5"
          : current?.entry.difficulty === 3
          ? "before:bg-violet-500/5"
          : current?.entry.difficulty === 4
          ? "before:bg-pink-500/5"
          : current?.entry.difficulty === 5
          ? "before:bg-rose-500/5"
          : "before:bg-primary/5",
            isExiting
            ? "-translate-x-24 rotate-[-10deg] scale-[0.94] opacity-0 blur-[1px]"
            : "translate-x-0 rotate-0 scale-100 opacity-100 blur-0",
        ].join(" ")}>
        <CardHeader>
          <CardTitle className="text-3xl">
            {current?.entry.term}
          </CardTitle>

          <div className="flex gap-2">
            <Badge variant="secondary">
              {current?.entry.kind.replaceAll(
                "_",
                " "
              )}
            </Badge>

            {current?.entry.difficulty ? (
              <Badge variant="outline" className={difficultyBadge.className}>
                {difficultyBadge.label}
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Meaning
            </p>

            <p>{current?.entry.meaning}</p>
          </div>

          {current?.entry.plainEnglish ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Plain English
              </p>

              <p>
                {current?.entry.plainEnglish}
              </p>
            </div>
          ) : null}

          {current?.entry.examples
            ?.length ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Examples
              </p>

              <ul className="mt-2 list-disc pl-5 text-sm">
                {current?.entry.examples
                  .slice(0, 3)
                  .map(
                    (
                      example,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {
                          example
                        }
                      </li>
                    )
                  )}
              </ul>
            </div>
          ) : null}

          {current?.entry.synonyms
            ?.length ? (
            <div className="flex flex-wrap gap-2">
              {current?.entry.synonyms
                .slice(0, 6)
                .map(
                  (
                    synonym,
                    index
                  ) => (
                    <Badge
                      key={
                        index
                      }
                      variant="outline"
                    >
                      {
                        synonym
                      }
                    </Badge>
                  )
                )}
            </div>
          ) : null}

          {current?.entry.mnemonic ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Memory trick
              </p>

              <p>
                {current?.entry.mnemonic}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={nextCard}
          disabled={saving}
        >
          Skip
        </Button>

        <Button
          onClick={addWord}
          disabled={saving}
        >
          {saving
            ? "Adding..."
            : "Add To Words"}
        </Button>
      </div>
    </div>
  );
}