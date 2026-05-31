"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RelatedWordsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    router.push("/suggested-words");
  }

  return (
    <Button
        onClick={handleClick}
        disabled={loading}
        className="
            h-12
            m-2
            cursor-pointer
            gap-2
            rounded-xl
            border
            border-primary/20
            bg-gradient-to-b
            from-primary
            to-primary/90
            text-primary-foreground
            shadow-[0_8px_24px_rgba(0,0,0,0.12)]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)]
            active:translate-y-0
            active:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
            "
        >
        {loading ? (
            <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening suggestions...
            </>
        ) : (
            <>
            <Sparkles className="h-4 w-4" />
            Try AI Suggested Words
            </>
        )}
        </Button>
  );
}