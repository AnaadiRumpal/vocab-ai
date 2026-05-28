"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingNavButtonProps {
  href: string;
  children: React.ReactNode;

  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";

  className?: string;

  preserveDefaultSize?: boolean;
    external?: boolean;
}

export function LoadingNavButton({
  href,
  children,

  variant = "default",
  size = "default",

  className,

  preserveDefaultSize = true,
  external = false,
}: LoadingNavButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

    const handleClick = () => {
    if (external) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
    }

    startTransition(() => {
        router.push(href);
    });
    };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={variant}
      size={size}
      className={cn(
        preserveDefaultSize &&
          "flex-1 min-h-12 cursor-pointer text-base",

        className
      )}
    >
      {isPending ? (
        <Loader2
          className={cn(
            "animate-spin",
            size === "icon"
              ? "h-4 w-4"
              : "h-5 w-5"
          )}
        />
      ) : (
        children
      )}
    </Button>
  );
}