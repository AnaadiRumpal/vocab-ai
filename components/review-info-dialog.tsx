// components/review-info-dialog.tsx
"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReviewInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="
            rounded-full
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>

        <DialogContent
        className="
            max-h-[85vh]
            overflow-hidden
            rounded-2xl
            p-0
            sm:max-w-md
        "
        >  
        <div className="max-h-[85vh] overflow-y-auto p-6">
  
        <DialogHeader>
          <DialogTitle className="text-left mb-2">
            How review works
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm leading-6 text-muted-foreground">
          <p>
            Review uses spaced repetition. Words you struggle with appear
            more often, while easy words are pushed farther into the future.
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="font-medium text-foreground">
                Forgot
              </p>

              <p className="mt-1">
                Use this when you completely forgot the word.
                The card returns later in the same session as a retry card,
                then gets scheduled again soon.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="font-medium text-foreground">
                Hard
              </p>

              <p className="mt-1">
                You remembered it, but with effort.
                The app schedules the word sooner so you reinforce it again.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="font-medium text-foreground">
                Good
              </p>

              <p className="mt-1">
                Normal successful recall.
                The interval increases steadily for long-term retention.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="font-medium text-foreground">
                Easy
              </p>

              <p className="mt-1">
                The word felt instant and obvious.
                The app pushes it much farther away to reduce unnecessary reviews.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-foreground">
            The goal is simple:
            spend more time on weak memories and less time on strong ones.
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}