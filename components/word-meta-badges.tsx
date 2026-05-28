"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type WordMetaBadge = {
  label: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
};

export function WordMetaBadges({ badges }: { badges: WordMetaBadge[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleBadges = expanded ? badges : badges.slice(0, 3);
  const hiddenCount = badges.length - visibleBadges.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleBadges.map((badge, index) => (
        <Badge
          key={`${badge.label}-${index}`}
          variant={badge.variant ?? "outline"}
          className={badge.className}
        >
          {badge.label}
        </Badge>
      ))}

      {!expanded && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={(event) => {
            setExpanded(true);
            event.stopPropagation()}}
          className="rounded-full"
          aria-label={`Show ${hiddenCount} more details`}
        >
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
          >
            ...
          </Badge>
        </button>
      ) : null}
    </div>
  );
}