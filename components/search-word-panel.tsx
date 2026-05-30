"use client";

import { useState } from "react";
import {
  Loader2,
  Plus,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import type { VocabEntry } from "@/lib/vocab-generator";

import { Button } from "@/components/ui/button";
import { WordCard } from "./word-card";

export function SearchWordPanel() {
  const [term, setTerm] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [showContext, setShowContext] = useState(false);

  const [entry, setEntry] = useState<VocabEntry | null>(null);

  const [status, setStatus] = useState<
    "idle" | "looking" | "adding" | "added"
  >("idle");

  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    try {
      setStatus("looking");
      setError(null);
      setEntry(null);

      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term,
          sourceText,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(
          data?.error ??
            "Unable to generate this vocabulary card right now. Please try again later."
        );
        return;
      }

      setEntry(data.entry);
    } catch (error) {
      console.error(error);

      setError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setStatus("idle");
    }
  }

  async function addToWords() {
    if (!entry) {
      return;
    }

    try {
      setStatus("adding");
      setError(null);

      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entry }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(
          data?.error ??
            "Could not add this word. Please try again."
        );
        setStatus("idle");
        return;
      }

      setStatus("added");

      setTimeout(() => {
        setEntry(null);
        setStatus("idle");
      }, 900);
    } catch (error) {
      console.error(error);

      setError(
        "Network error. Please check your connection and try again."
      );

      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          bg-gradient-to-b
          from-background
          to-muted/[0.35]
          shadow-sm
        "
      >
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <div
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl
                bg-primary/10
              "
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-sm font-medium">
                AI word lookup
              </p>

              <p className="text-xs text-muted-foreground">
                Search meanings, examples, memory tricks, and more
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                value={term}
                onChange={(event) =>
                  setTerm(event.target.value)
                }
                placeholder="Search a word or phrase..."
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  bg-background/80
                  px-5
                  text-[15px]
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-muted-foreground/70

                  focus:border-primary/40
                  focus:ring-4
                  focus:ring-primary/10
                "
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() =>
                  setShowContext((value) => !value)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
              >
                <Plus className="h-4 w-4" />

                Add context sentence

                <ChevronDown
                  className={[
                    "h-4 w-4 transition-transform duration-200",
                    showContext ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              <div
                className={[
                  "grid transition-all duration-300 ease-out",
                  showContext
                    ? "grid-rows-[1fr] opacity-100 mt-3"
                    : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <textarea
                    value={sourceText}
                    onChange={(event) =>
                      setSourceText(event.target.value)
                    }
                    placeholder="Example: I’m still on the fence about moving abroad."
                    className="
                      min-h-28
                      w-full
                      rounded-2xl
                      border
                      bg-background/80
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition-all
                      duration-200

                      placeholder:text-muted-foreground/70

                      focus:border-primary/40
                      focus:ring-4
                      focus:ring-primary/10
                    "
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              disabled={
                !term.trim() ||
                status === "looking"
              }
              onClick={lookup}
              className="
                h-12
                w-full
                rounded-2xl
                text-sm
                font-medium
                shadow-lg
                shadow-primary/15
                transition-all
                duration-300
                hover:scale-[1.01]
              "
            >
              {status === "looking" ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                "Search"
              )}
            </Button>

            {error ? (
              <div
                className="
                  rounded-2xl
                  border border-destructive/20
                  bg-destructive/5
                  px-4 py-3
                  text-sm
                  text-destructive
                "
              >
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {entry ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <WordCard
            word={{
              ...entry,
              examples: entry.examples ?? [],
              synonyms: entry.synonyms ?? [],
            }}
            action={{
              label: "Add to Words",
              loading: status === "adding",
              success: status === "added",
              disabled:
                status === "adding" ||
                status === "added",
              onClick: async () => {
                await addToWords();
              },
            }}
            showMeta
          />
        </div>
      ) : null}
    </div>
  );
}