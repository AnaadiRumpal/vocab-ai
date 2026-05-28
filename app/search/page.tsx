import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { SearchWordPanel } from "@/components/search-word-panel";
import { LoadingLinkButton } from "@/components/loading-link-button";

export default async function SearchPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
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
            <p className="text-sm text-muted-foreground">Lookup</p>
            <h1 className="text-2xl font-semibold">Search word or phrase</h1>
          </div>
        </header>

        <SearchWordPanel />
      </div>
    </main>
  );
}