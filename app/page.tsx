import Link from "next/link";
import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute flex gap-2 right-16 top-4 z-40">
        <AuthButtons />
        {isLoggedIn ? (
        <Button asChild variant="outline" className="flex-1">
          <Link href="/settings">Settings</Link>
        </Button>):
        (<div></div>)
        }
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
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/review">Review</Link>
              </Button>

              <Button asChild variant="outline" className="flex-1">
                <Link href="/words">Saved Words</Link>
              </Button>

              <Button asChild className="flex-1">
                <Link href="/search">Search Word</Link>
              </Button>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              Want to capture words from your iPhone? Open Settings for the Shortcut
              setup link, token, and step-by-step instructions.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with Google to open your vocabulary deck and review captured words.
          </p>
        )}
      </div>
    </main>
  );
}