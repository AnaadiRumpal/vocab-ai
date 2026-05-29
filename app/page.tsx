import { Settings } from "lucide-react";
import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth-buttons";
import { LoadingNavButton } from "@/components/loading-nav-button";
import { db } from "@/lib/db";
import { WordStatus } from "@/app/generated/prisma/client";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  let dueCount = 0;

  if (session?.user?.id) {
    const now = new Date();
    dueCount = await db.word.count({
      where: {
        userId: session.user.id,
        status: {
          not: WordStatus.ARCHIVED,
        },
        dueAt: {
          lte: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999
              ),
        },
      },
    });
  }

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
              <div className="relative flex-1">
                <LoadingNavButton
                  href="/review"
                  variant="outline"
                  className="w-full"
                >
                  Review
                </LoadingNavButton>

                {dueCount > 0 ? (
                  <div
                    className="
                      absolute -right-2 -top-2
                      flex h-6 min-w-6 items-center justify-center
                      rounded-full bg-primary px-1.5
                      text-xs font-semibold text-primary-foreground
                      shadow-sm
                    "
                  >
                    {dueCount > 99 ? "99+" : dueCount}
                  </div>
                ) : null}
              </div>

              <LoadingNavButton
                href="/words"
                variant="outline"
                className="flex-1"
              >
                Saved Words
              </LoadingNavButton>

              <LoadingNavButton
                href="/search"
                className="flex-1"
              >
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