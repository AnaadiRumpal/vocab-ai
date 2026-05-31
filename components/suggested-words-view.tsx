"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight,  Info,  RefreshCw,  X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useRouter } from "next/navigation";

type SuggestedWord = {
  relatedTo: string;
  reason: string;

  entry: {
    term: string;
  };
};

export function SuggestedWordsView() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<SuggestedWord[]>([]);
  const [navigating, setNavigating] = useState(false);

  const seedRef = useRef<number>(Date.now());
  const initialized = useRef(false);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const cached = sessionStorage.getItem("suggestedWords");

    if (cached) {
      setWords(JSON.parse(cached));
      setLoading(false);
      return;
    }

    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/related-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seed: seedRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not generate suggestions.");
        return;
      }

      setWords(data.words ?? []);
    } catch {
      setError("Could not generate suggestions.");
    } finally {
      setLoading(false);
    }
  }

  function removeWord(term: string) {
    setWords((curr) => curr.filter((w) => w.entry.term !== term));
  }

  function beginLearning() {
    setNavigating(true);

    sessionStorage.setItem("suggestedWords", JSON.stringify(words));
    setTimeout(() => {
        window.location.href = "/suggested-words/learn";
    }, 50);
  }


    if (error) {
        return (
            <div className="mt-6">
            <div
                className="
                rounded-xl
                border
                border-destructive/20
                bg-destructive/5
                p-4
                "
            >
                <h3 className="font-medium">
                Suggestions unavailable
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                {error}
                </p>

                <Button
                className="mt-4"
                onClick={loadSuggestions}
                >
                Try Again
                </Button>
            </div>
            </div>
        );
        }

  return (
    <div className="space-y-6">

        <div className="rounded-lg mt-4 border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
                How suggestions work
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
                The highlighted badge shows a word already in your vocabulary that inspired the suggestion.
            </p>
        </div>

        <Button
      variant="outline"
      size="sm"
      onClick={loadSuggestions}
      disabled={loading}
      className="gap-2 cursor-pointer"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Generate new words
    </Button>

    {loading ? (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}

        <Skeleton className="h-10 w-full" />
      </div>
    ) : words.length > 0 ? (
      <div className="flex flex-col gap-4 p-4 rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Remove any words you already know or don't want to learn.
        </p>

        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <div
              key={word.entry.term}
              className="
                rounded-full
                border
                border-primary/30
                px-4
                py-3
                bg-background
                transition-all
                hover:border-primary/80
                hover:bg-accent/80
              "
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeWord(word.entry.term)}
                  className="
                    flex h-6 w-6 items-center justify-center
                    rounded-full border cursor-pointer
                    transition-colors
                    hover:bg-foreground/80
                    hover:text-background
                  "
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="font-medium">{word.entry.term}</div>

                <div className="px-2 py-1 rounded-full flex text-muted-foreground bg-muted items-center gap-2">
                  <span className="text-xs">{word.relatedTo}</span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="cursor-pointer text-muted-foreground hover:text-foreground">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>{word.reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-4 p-4 rounded-lg border bg-muted/30">
        No suggestions found.
      </div>
    )}

    <div className="sticky bottom-0 bg-background/95 pt-3 backdrop-blur">
        <Button
            disabled={words.length === 0 || navigating}
            className="
            h-12
            my-2
            w-full
            cursor-pointer
            gap-2
            rounded-xl
            border
            border-primary/20
            bg-gradient-to-b
            from-primary
            to-primary/90
            text-primary-foreground
            shadow-[0_8px_24px_rgba(0,0,0,0.12)]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)]
            active:translate-y-0
            active:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
            "
            onClick={beginLearning}
        >
            {navigating ? "Generating cards for words..." : "Begin Learning"}

            {!navigating && <ArrowRight className="h-4 w-4" />}
        </Button>
        </div>
    </div>
  );
}