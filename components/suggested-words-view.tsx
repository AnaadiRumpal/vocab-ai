"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight,  Info,  X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type SuggestedWord = {
  term: string;
  relatedTo: string;
  reason: string;
};

export function SuggestedWordsView() {
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<
    SuggestedWord[]
  >([]);

  useEffect(() => {
    async function load() {
        try {
        setError(null);

        const response = await fetch(
            "/api/related-words",
            {
            method: "POST",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(
            data.error ??
            "Could not generate suggestions right now."
            );
            return;
        }

        setWords(data.words ?? []);
        } catch {
        setError(
            "Could not generate suggestions right now."
        );
        } finally {
        setLoading(false);
        }
    }

    load();
    }, []);

  function removeWord(term: string) {
    setWords((current) =>
      current.filter(
        (word) => word.term !== term
      )
    );
  }

    if (loading) {
    return (

            <div className="space-y-2 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-lg border p-3"
                >
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-2 h-3 w-40" />
                    <Skeleton className="mt-2 h-3 w-32" />
                </div>
                ))}

            <Skeleton className="h-10 w-full" />
            </div>
        );
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
                onClick={() => window.location.reload()}
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

        <p className="text-sm mt-4 text-muted-foreground">
        Remove any words you already know or don't want to learn.
        </p>

      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <div
            key={word.term}
            className="
                rounded-full
                border
                px-4
                py-3
                transition-all
                hover:border-primary/30
                hover:bg-accent/40
            "
            >
            <div className="flex items-center gap-3">
                <button
                onClick={() => removeWord(word.term)}
                className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    border
                    cursor-pointer
                    transition-colors
                    hover:bg-destructive/10
                "
                >
                <X className="h-3 w-3" />
                </button>

                <div className="font-medium">
                    {word.term}
                </div>

                <div className=" px-2 py-1 items-center rounded-full
                    flex text-muted-foreground bg-muted items-center gap-2">
                    <span
                    className="        
                        text-xs  
                    "
                    >
                    {word.relatedTo}
                    </span>

                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <button
                            className="
                            cursor-pointer
                            text-muted-foreground
                            hover:text-foreground
                            "
                        >
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

      <div className="sticky bottom-0  bg-background/95 pt-3 backdrop-blur">
        <Button
            disabled={words.length === 0}
            className="
            h-12
            m-2
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
            onClick={() => {
                sessionStorage.setItem(
                "suggestedWords",
                JSON.stringify(words)
                );

                window.location.href =
                "/suggested-words/learn";
            }}
        >
            Begin Learning
            <ArrowRight className="h-4 w-4" />
        </Button>
        </div>
    </div>
  );
}