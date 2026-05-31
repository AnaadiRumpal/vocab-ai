export function getDifficultyBadge(difficulty: number | null) {
  if (difficulty === 1) {
    return {
      label: "Common",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (difficulty === 2) {
    return {
      label: "Familiar",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  if (difficulty === 3) {
    return {
      label: "Intermediate",
      className: "border-violet-200 bg-violet-50 text-amber-700",
    };
  }

  if (difficulty === 4) {
    return {
      label: "Advanced",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    };
  }

  if (difficulty === 5) {
    return {
      label: "Rare",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "Unrated",
    className: "border-muted bg-muted/40 text-muted-foreground",
  };
}