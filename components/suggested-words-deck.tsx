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
import { LoadingLinkButton } from "./loading-link-button";

type QueueWord = {
  term: string;
  relatedTo: string;
  reason: string;
};

export function SuggestedWordsDeck() {
  const [queue, setQueue] = useState<
    QueueWord[]
  >([]);

  const [entry, setEntry] =
    useState<VocabEntry | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

    const [initialCount, setInitialCount] =
  useState(0);

  const [completed, setCompleted] =
    useState(0);

  useEffect(() => {
    const stored =
      sessionStorage.getItem(
        "suggestedWords"
      );

    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed =
      JSON.parse(stored);
    setInitialCount(parsed.length);

    setQueue(parsed);
  }, []);

  useEffect(() => {
    if (
      queue.length === 0 ||
      entry
    ) {
      setLoading(false);
      return;
    }

    loadWord(queue[0].term);
  }, [queue]);

  async function loadWord(
    term: string
  ) {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/lookup",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            term,
          }),
        }
      );

      const data =
        await response.json();

      if (
        response.ok &&
        data.entry
      ) {
        setEntry(data.entry);
      }
    } finally {
      setLoading(false);
    }
  }

  function nextCard() {
    const rest =
      queue.slice(1);

    setQueue(rest);

    sessionStorage.setItem(
      "suggestedWords",
      JSON.stringify(rest)
    );

    setEntry(null);

    setCompleted(
      (value) => value + 1
    );
  }

  async function addWord() {
    if (!entry) return;

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
              entry,
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

            <LoadingLinkButton
            href="/"
            className="mt-5 w-full"
            >
            Back Home
            </LoadingLinkButton>
        </CardContent>
        </Card>
    );
    }

  if (loading || !entry) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Generating vocabulary card...
          </p>
        </CardContent>
      </Card>
    );
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

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            {entry.term}
          </CardTitle>

          <div className="flex gap-2">
            <Badge variant="secondary">
              {entry.kind.replaceAll(
                "_",
                " "
              )}
            </Badge>

            {entry.difficulty ? (
              <Badge
                variant="outline"
              >
                Difficulty{" "}
                {
                  entry.difficulty
                }
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Meaning
            </p>

            <p>{entry.meaning}</p>
          </div>

          {entry.plainEnglish ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Plain English
              </p>

              <p>
                {entry.plainEnglish}
              </p>
            </div>
          ) : null}

          {entry.examples
            ?.length ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Examples
              </p>

              <ul className="mt-2 list-disc pl-5 text-sm">
                {entry.examples
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

          {entry.synonyms
            ?.length ? (
            <div className="flex flex-wrap gap-2">
              {entry.synonyms
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

          {entry.mnemonic ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Memory trick
              </p>

              <p>
                {entry.mnemonic}
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