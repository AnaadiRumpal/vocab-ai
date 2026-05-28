import { Settings } from "lucide-react";
import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth-buttons";
import { LoadingNavButton } from "@/components/loading-nav-button";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-20 top-4 z-40 flex items-center gap-2">
        <AuthButtons />

        {isLoggedIn ? (
          <LoadingNavButton
            href="/settings"
            variant="outline"
            aria-label="Settings"
            preserveDefaultSize={false}
            className="shrink-0"
          >
            <Settings className="h-4 w-4" />
          </LoadingNavButton>
        ) : null}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Vocab AI</p>

          <h1 className="text-3xl font-semibold">
            Capture words. Remember them.
          </h1>
        </div>

        {isLoggedIn ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
            <LoadingNavButton href="/review" variant="outline">
              Review
            </LoadingNavButton>

            <LoadingNavButton href="/words" variant="outline">
              Saved Words
            </LoadingNavButton>

            <LoadingNavButton href="/search">
              Search Word
            </LoadingNavButton>
  
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              Want to capture words from your iPhone? Open Settings for the
              Shortcut setup link, token, and step-by-step instructions.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with Google to open your vocabulary deck and review
            captured words.
          </p>
        )}
      </div>
    </main>
  );
}