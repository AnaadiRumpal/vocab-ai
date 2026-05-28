"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button type="button" variant="outline" disabled>
        Checking session...
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button type="button" onClick={() => signIn("google")}>
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="max-w-40 truncate text-sm text-muted-foreground">
        {session.user.email}
      </span>

      <Button type="button" variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}