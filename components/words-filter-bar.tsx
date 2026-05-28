"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const STATUSES = ["NEW", "LEARNING", "REVIEWING", "MASTERED", "ARCHIVED"] as const;
const KINDS = ["WORD", "PHRASE", "IDIOM", "PHRASAL_VERB", "TECHNICAL_TERM", "OTHER"] as const;

export function WordsFilterBar({
  q,
  status,
  kind,
  due,
}: {
  q: string;
  status: string;
  kind: string;
  due: string;
}) {
  const hasExtraFilters = status !== "ACTIVE" || kind !== "ALL" || due !== "ALL";
  const [open, setOpen] = useState(hasExtraFilters);

  return (
    <form action="/words" className="rounded-lg border bg-muted/30 p-3">
      <input type="hidden" name="page" value="1" />

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search terms, meanings, notes..."
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-3 border-t pt-4">
          <label className="grid gap-1 sm:grid-cols-[1fr_180px] sm:items-center">
            <span>
              <span className="block text-sm font-medium">Status</span>
              <span className="block text-xs text-muted-foreground">
                Choose active cards, archived cards, or one learning stage.
              </span>
            </span>
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="ALL">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 sm:grid-cols-[1fr_180px] sm:items-center">
            <span>
              <span className="block text-sm font-medium">Kind</span>
              <span className="block text-xs text-muted-foreground">
                Filter words, idioms, phrases, phrasal verbs, or technical terms.
              </span>
            </span>
            <select
              name="kind"
              defaultValue={kind}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All kinds</option>
              {KINDS.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 sm:grid-cols-[1fr_180px] sm:items-center">
            <span>
              <span className="block text-sm font-medium">Due date</span>
              <span className="block text-xs text-muted-foreground">
                See cards due now or cards scheduled for later.
              </span>
            </span>
            <select
              name="due"
              defaultValue={due}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All due dates</option>
              <option value="DUE">Due now</option>
              <option value="FUTURE">Scheduled later</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Button type="submit">Apply</Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/words">Reset</Link>
        </Button>
      </div>
    </form>
  );
}