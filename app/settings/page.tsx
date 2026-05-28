// app/settings/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, Smartphone } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyTokenButton } from "@/components/copy-token-button";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/");
  }

  const endpoint = `${process.env.AUTH_URL}/api/capture`;

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="flex flex-col items-start gap-5 justify-between">
            <Button asChild variant="outline" size="sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Settings</p>
            <h1 className="text-2xl font-semibold">Capture setup</h1>
          </div>
        </header>

        <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">How iPhone capture works</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your iPhone Shortcut will send clipboard text to this app using a private
            capture token. You do not need to log in from the Shortcut. Copy the endpoint
            and token below, then create a Shortcut that accepts selected text from the
            Share Sheet and sends it as a POST request.
        </p>

        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Select a word or phrase on your iPhone/iPad/Mac and copy it.</li>
            <li>Run your vocabulary Shortcut. (You can add it to control center)</li>
            <li>The Shortcut selects the word from your clipboard sends it to the endpoint below.</li>
            <li>The app enriches it with AI and saves it to your vocabulary which you can later revise with flashcards.</li>
        </ol>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="
            h-12
            flex-1
            gap-2
            rounded-xl
            shadow-sm
            transition-all
            duration-200
            hover:scale-[1.01]
            hover:shadow-md
          "
        >
          <a
            href={process.env.SHORTCUT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-4 w-4" />
            Download Shortcut
          </a>
        </Button>

        <div
          className="
            flex items-center justify-center gap-2
            rounded-xl border bg-muted/40
            px-4 py-3
            text-sm text-muted-foreground
          "
        >
          <Smartphone className="h-4 w-4" />
          iOS & macOS
        </div>
      </div>
        <Card>       
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Signed in as</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Endpoint</p>
              <code className="mt-1 block overflow-x-auto rounded-md bg-muted p-3 text-xs">
                {endpoint}
              </code>
            </div>

            <div>
              <p className="text-sm font-medium">Capture token</p>
              <div className="mt-1 flex gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {user.captureToken}
                </code>
                <CopyTokenButton value={user.captureToken} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Authorization header</p>
              <code className="mt-1 block overflow-x-auto rounded-md bg-muted p-3 text-xs">
                Authorization: Bearer {user.captureToken}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}