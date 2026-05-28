import { NextRequest, NextResponse } from "next/server";
import { ReviewRating } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { getNextReview } from "@/lib/spaced-repetition";
import { auth } from "@/auth";

function isReviewRating(value: unknown): value is ReviewRating {
  return (
    value === "FORGOT" ||
    value === "HARD" ||
    value === "GOOD" ||
    value === "EASY"
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.wordId || typeof body.wordId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Expected wordId." },
      { status: 400 }
    );
  }

  if (!isReviewRating(body.rating)) {
    return NextResponse.json(
      { ok: false, error: "Expected valid rating." },
      { status: 400 }
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const word = await db.word.findFirst({
    where: {
      id: body.wordId,
      userId,
    },
  });

  if (!word) {
    return NextResponse.json(
      { ok: false, error: "Word not found." },
      { status: 404 }
    );
  }

  const nextReview = getNextReview({
    rating: body.rating,
    currentInterval: word.interval,
    currentEaseFactor: word.easeFactor,
  });

  const updatedWord = await db.$transaction(async (tx) => {
    await tx.reviewLog.create({
      data: {
        userId,
        wordId: word.id,
        rating: body.rating,
      },
    });

    return tx.word.update({
      where: {
        id: word.id,
      },
      data: {
        reviewCount: {
          increment: 1,
        },
        interval: nextReview.interval,
        easeFactor: nextReview.easeFactor,
        dueAt: nextReview.dueAt,
        status: body.rating === "FORGOT" ? "LEARNING" : "REVIEWING",
      },
    });
  });

  return NextResponse.json({
    ok: true,
    word: {
      id: updatedWord.id,
      term: updatedWord.term,
      reviewCount: updatedWord.reviewCount,
      interval: updatedWord.interval,
      easeFactor: updatedWord.easeFactor,
      dueAt: updatedWord.dueAt,
      status: updatedWord.status,
    },
  });
}