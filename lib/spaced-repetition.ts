import type { ReviewRating } from "@/app/generated/prisma/client";

export function getNextReview(input: {
  rating: ReviewRating;
  currentInterval: number;
  currentEaseFactor: number;
}) {
  const easeFactor = Math.max(1.3, input.currentEaseFactor);
  let nextEaseFactor = easeFactor;
  let nextInterval = input.currentInterval;

  if (input.rating === "FORGOT") {
    nextEaseFactor = Math.max(1.3, easeFactor - 0.25);
    nextInterval = 1;
  }

  if (input.rating === "HARD") {
    nextEaseFactor = Math.max(1.3, easeFactor - 0.15);
    nextInterval = Math.max(1, Math.round(input.currentInterval * 1.2));
  }

  if (input.rating === "GOOD") {
    nextInterval =
      input.currentInterval <= 0
        ? 3
        : Math.round(input.currentInterval * easeFactor);
  }

  if (input.rating === "EASY") {
    nextEaseFactor = easeFactor + 0.15;
    nextInterval =
      input.currentInterval <= 0
        ? 5
        : Math.round(input.currentInterval * (easeFactor + 0.3));
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + nextInterval);

  return {
    interval: nextInterval,
    easeFactor: nextEaseFactor,
    dueAt,
  };
}