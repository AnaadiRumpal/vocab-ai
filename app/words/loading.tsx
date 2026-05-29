// app/words/loading.tsx

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />

          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card/60 p-3 shadow-sm backdrop-blur">
          <div className="flex gap-2">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-muted" />
            <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="h-11 w-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-11 w-24 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading your words...</p>
          </div>
        </div>

        
      </div>
    </main>
  );
}