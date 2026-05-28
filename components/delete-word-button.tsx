"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeleteWordButton({
  wordId,
  term,
}: {
  wordId: string;
  term: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${term}" permanently?`);

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/words/${wordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Could not delete this word.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      aria-label={`Delete ${term}`}
      title={`Delete ${term}`}
      className="
        h-8 w-8 shrink-0
        text-muted-foreground
        transition-all duration-200
        hover:bg-destructive/10
        hover:text-destructive
        disabled:opacity-100
      "
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}