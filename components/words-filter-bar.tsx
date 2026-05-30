"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Loader2,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingLinkButton } from "@/components/loading-link-button";

const STATUSES = [
  "NEW",
  "LEARNING",
  "REVIEWING",
  "MASTERED",
  "ARCHIVED",
] as const;

const KINDS = [
  "WORD",
  "PHRASE",
  "IDIOM",
  "PHRASAL_VERB",
  "TECHNICAL_TERM",
  "OTHER",
] as const;

function SearchButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="
        h-11 rounded-xl
        px-5 font-medium cursor-pointer
      "
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}

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
  const hasExtraFilters =
    status !== "ACTIVE" || kind !== "ALL" || due !== "ALL";

  const [open, setOpen] = useState(hasExtraFilters);

  return (
    <form
      action="/words"
      className="
        rounded-2xl border
        bg-card/60
        p-3
        shadow-sm
        backdrop-blur
      "
    >
      <input type="hidden" name="page" value="1" />

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="
              pointer-events-none
              absolute left-3 top-1/2
              h-4 w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <input
            name="q"
            defaultValue={q}
            placeholder="Search saved words..."
            className="
              h-11 w-full
              rounded-xl
              border border-border/60
              bg-background/80
              pl-10 pr-4
              text-sm
              outline-none
              transition
              focus:border-primary/40
              focus:ring-2
              focus:ring-primary/10
            "
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          className="
            h-11 w-11
            rounded-xl
            border-border/60
            bg-background/80
            cursor-pointer
            shrink-0
          "
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`
          grid transition-all duration-300 ease-in-out
          ${
            open
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div
            className="
              grid gap-3
              border-t border-border/50
              pt-4
            "
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Status
                </span>

                <select
                  name="status"
                  defaultValue={status}
                  className="
                    h-11 rounded-xl
                    border border-border/60
                    bg-background px-3
                    text-sm outline-none
                    transition
                    focus:border-primary/40
                    focus:ring-2
                    focus:ring-primary/10
                  "
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

              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Type
                </span>

                <select
                  name="kind"
                  defaultValue={kind}
                  className="
                    h-11 rounded-xl
                    border border-border/60
                    bg-background px-3
                    text-sm outline-none
                    transition
                    focus:border-primary/40
                    focus:ring-2
                    focus:ring-primary/10
                  "
                >
                  <option value="ALL">All kinds</option>

                  {KINDS.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Review
                </span>

                <select
                  name="due"
                  defaultValue={due}
                  className="
                    h-11 rounded-xl
                    border border-border/60
                    bg-background px-3
                    text-sm outline-none
                    transition
                    focus:border-primary/40
                    focus:ring-2
                    focus:ring-primary/10
                  "
                >
                  <option value="ALL">All due dates</option>
                  <option value="DUE">Due now</option>
                  <option value="FUTURE">Scheduled later</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className=" flex items-center gap-2">
          <SearchButton/>

        <LoadingLinkButton
          href="/words"
          variant="ghost"
          className="
            h-11 rounded-xl
            px-4 text-muted-foreground cursor-pointer
          "
        >
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </>
        </LoadingLinkButton>
        </div>

        <Button asChild variant="ghost" className="h-11 rounded-xl
            px-4 text-muted-foreground cursor-pointer">
          <a href="/api/export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </a>
        </Button>
      </div>
    </form>
  );
}