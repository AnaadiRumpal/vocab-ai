"use client";

import { useState } from "react";
import type { VocabEntry } from "@/lib/vocab-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SearchWordPanel() {
  const [term, setTerm] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [entry, setEntry] = useState<VocabEntry | null>(null);
  const [status, setStatus] = useState<"idle" | "looking" | "adding" | "added">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    setStatus("looking");
    setError(null);
    setEntry(null);

    const response = await fetch("/api/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ term, sourceText }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not look up this term.");
      setStatus("idle");
      return;
    }

    setEntry(data.entry);
    setStatus("idle");
  }

  async function addToWords() {
    if (!entry) {
      return;
    }

    setStatus("adding");
    setError(null);

    const response = await fetch("/api/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entry }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not add this term.");
      setStatus("idle");
      return;
    }

    setStatus("added");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Word or phrase</label>
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="on the fence"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Context sentence</label>
            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="I am still on the fence about moving."
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Button
            type="button"
            disabled={!term.trim() || status === "looking"}
            onClick={lookup}
            className="w-full"
          >
            {status === "looking" ? "Searching..." : "Search"}
          </Button>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {entry ? (
        <Card>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{entry.kind.replaceAll("_", " ")}</Badge>
              <Badge variant="outline">Difficulty {entry.difficulty}</Badge>
            </div>

            <CardTitle className="text-2xl">{entry.term}</CardTitle>
            <p className="text-sm text-muted-foreground">{entry.meaning}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm">{entry.plainEnglish}</p>

            {entry.examples.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Examples
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {entry.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {entry.mnemonic ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Memory trick
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.mnemonic}
                </p>
              </div>
            ) : null}

            <Button
              type="button"
              disabled={status === "adding" || status === "added"}
              onClick={addToWords}
              className="w-full"
            >
              {status === "adding"
                ? "Adding..."
                : status === "added"
                  ? "Added to words"
                  : "Add to Words"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}