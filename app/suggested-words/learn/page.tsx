import { ArrowLeft } from "lucide-react";

import { LoadingLinkButton } from "@/components/loading-link-button";
import { SuggestedWordsDeck } from "@/components/suggested-words-deck";

export default function SuggestedWordsLearnPage() {
  return (
    <main className="flex min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <header className="flex items-center gap-3">
          <LoadingLinkButton
            href="/"
            variant="outline"
            size="sm"
            className="inline-flex cursor-pointer items-center gap-2"
          >
            <>
              <ArrowLeft className="h-4 w-4" />
              Home
            </>
          </LoadingLinkButton>

          <div>
            <p className="text-sm text-muted-foreground">
              AI vocabulary recommendations
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Learn Suggested Words
            </h1>
          </div>
        </header>

        <SuggestedWordsDeck />
      </div>
    </main>
  );
}