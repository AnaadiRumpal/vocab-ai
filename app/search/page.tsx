import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SearchWordPanel } from "@/components/search-word-panel";

export default async function SearchPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Lookup</p>
            <h1 className="text-2xl font-semibold">Search word or phrase</h1>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </header>

        <SearchWordPanel />
      </div>
    </main>
  );
}