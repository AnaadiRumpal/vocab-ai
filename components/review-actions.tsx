"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewActions({ wordId }: { wordId: string }) {
  const router = useRouter();

  async function submitReview(rating: "FORGOT" | "HARD" | "GOOD" | "EASY") {
    await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wordId, rating }),
    });

    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" onClick={() => submitReview("FORGOT")}>
        Forgot
      </Button>
      <Button variant="outline" onClick={() => submitReview("HARD")}>
        Hard
      </Button>
      <Button variant="secondary" onClick={() => submitReview("GOOD")}>
        Good
      </Button>
      <Button onClick={() => submitReview("EASY")}>Easy</Button>
    </div>
  );
}