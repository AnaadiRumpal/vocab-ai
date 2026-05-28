// components/copy-token-button.tsx
"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyTokenButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={copy}>
      <Copy className="h-4 w-4" />
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}