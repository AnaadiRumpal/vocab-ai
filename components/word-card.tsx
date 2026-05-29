"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteWordButton } from "@/components/delete-word-button";
import { WordMetaBadges } from "@/components/word-meta-badges";

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

type WordCardProps = {
  word: {
    id?: string;
    term: string;
    kind: string;
    meaning: string;
    plainEnglish: string | null;
    examples: string[];
    synonyms: string[];
    mnemonic?: string | null;
    difficulty: number | null;
    status?: string;
    reviewCount?: number;
    createdAt?: Date | string;
    dueAt?: Date | string;
  };

  showDelete?: boolean;
  showMeta?: boolean;
  defaultExpanded?: boolean;

  action?: {
    label: string;
    loadingLabel?: string;
    successLabel?: string;
    disabled?: boolean;
    loading?: boolean;
    success?: boolean;
    onClick?: () => Promise<void> | void;
  };
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
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
    voices.find((voice) =>
      voice.name.toLowerCase().includes("samantha")
    ) ||
    voices.find((voice) =>
      voice.name.toLowerCase().includes("google us english")
    ) ||
    voices.find((voice) =>
      voice.lang.startsWith("en")
    );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function WordCard({
  word,
  showDelete = false,
  showMeta = false,
  defaultExpanded = false,
  action,
}: WordCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isRemoving, setIsRemoving] = useState(false);
  const difficultyBadge = getDifficultyBadge(word.difficulty);
  return (
    <Card
        onClick={() => setExpanded((value) => !value)}
        className={[
          `
          group
          relative
          overflow-hidden
          w-full
          cursor-pointer
          rounded-2xl
          border

          bg-background/60
          backdrop-blur-sm

          text-left

          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          hover:-translate-y-[2px]
          hover:border-primary/20
          hover:shadow-[0_10px_35px_rgba(0,0,0,0.06)]

          active:scale-[0.995]

          before:content-['']
          before:absolute
          before:inset-0
          before:block
          before:z-0
          `,
          word.difficulty === 1
          ? "before:bg-emerald-500/5"
          : word.difficulty === 2
          ? "before:bg-sky-500/5"
          : word.difficulty === 3
          ? "before:bg-violet-500/5"
          : word.difficulty === 4
          ? "before:bg-pink-500/5"
          : word.difficulty === 5
          ? "before:bg-rose-500/5"
          : "before:bg-primary/5",

          isRemoving
            ? "scale-[0.96] opacity-0 blur-[1px] -translate-y-4"
            : "scale-100 opacity-100 blur-0 translate-y-0",
        ].join(" ")}
    >
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <CardTitle className="break-words text-xl">
                  {word.term}
                </CardTitle>

                <Button
                  size="icon"
                  variant="ghost"
                  className="
                    h-8
                    w-8
                    shrink-0
                    rounded-full
                    text-muted-foreground
                    transition-all
                    duration-200

                    hover:bg-primary/10
                    hover:text-primary
                  "
                  onClick={(event) => {
                    event.stopPropagation();
                    speakWord(word.term);
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {word.meaning}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showDelete && word.id ? (
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <DeleteWordButton
                    wordId={word.id}
                    term={word.term}
                  />
                </div>
              ) : null}

              <ChevronDown
                className={[
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                  expanded ? "rotate-180" : "",
                ].join(" ")}
              />
            </div>
          </div>

        </CardHeader>

      <div
        className={[
          "grid transition-all duration-300 ease-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <CardContent className="flex flex-col gap-4 pt-0">
            {showMeta ? (
              <WordMetaBadges
                badges={[
                  {
                    label: word.kind.replaceAll("_", " "),
                    variant: "secondary",
                  },
                  ...(word.status
                    ? [
                        {
                          label: word.status,
                          variant: "outline" as const,
                        },
                      ]
                    : []),
                  {
                    label: difficultyBadge.label,
                    variant: "outline",
                    className: difficultyBadge.className,
                  },
                  ...(typeof word.reviewCount === "number"
                    ? [
                        {
                          label: `Reviewed ${word.reviewCount}x`,
                          variant: "outline" as const,
                        },
                      ]
                    : []),
                  ...(word.createdAt
                    ? [
                        {
                          label: `Created: ${formatDate(word.createdAt)}`,
                          variant: "outline" as const,
                        },
                      ]
                    : []),
                  ...(word.dueAt
                    ? [
                        {
                          label: `Due: ${formatDateTime(word.dueAt)}`,
                          variant: "outline" as const,
                        },
                      ]
                    : []),
                ]}
              />
            ) : null}

            {word.plainEnglish ? (
              <p className="text-sm leading-6">
                {word.plainEnglish}
              </p>
            ) : null}

            {word.examples.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Examples
                </p>

                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {word.examples.slice(0, 2).map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {word.synonyms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {word.synonyms.slice(0, 6).map((synonym, index) => (
                  <Badge key={index} variant="outline">
                    {synonym}
                  </Badge>
                ))}
              </div>
            ) : null}

            {word.mnemonic ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Memory trick
                </p>

                <p className="text-sm text-muted-foreground leading-6">
                  {word.mnemonic}
                </p>
              </div>
            ) : null}

            {action ? (
              <Button
                type="button"
                disabled={action.disabled || action.loading || action.success}
                onClick={async (event) => {
                  event.stopPropagation();

                  await action.onClick?.();

                  if (action.success) {
                    setTimeout(() => {
                      setIsRemoving(true);
                    }, 350);
                  }
                }}
                className="
                  mt-2
                  w-fit
                  min-w-[120px]
                  self-start
                  rounded-xl
                  transition-all
                  duration-300
                "
              >
                {action.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : action.success ? (
                  <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                    <Check className="h-4 w-4" />
                    Added
                  </div>
                ) : (
                  action.label
                )}
              </Button>
            ) : null}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}