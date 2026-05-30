import { LoadingLinkButton } from "@/components/loading-link-button";
import { SuggestedWordsView } from "@/components/suggested-words-view";
import { ArrowLeft } from "lucide-react";

export default function SuggestedWordsPage() {
  return (
    <main className="flex min-h-screen bg-background px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <header className="flex items-center gap-3">
        <LoadingLinkButton
            href="/"
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
        >
            <>
            <ArrowLeft className="h-4 w-4" />
            Home
            </>
        </LoadingLinkButton>

        <div>
            <p className="text-sm text-muted-foreground">
            AI powered recommendations
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
            Suggested Words
            </h1>
        </div>
        </header>

        
        <SuggestedWordsView />
      </div>
    </main>
  );
}