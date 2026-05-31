import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateRelatedWords } from "@/lib/vocab-generator";
import { WordStatus } from "@/app/generated/prisma/client";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const recentWords = await db.word.findMany({
    where: {
      userId: session.user.id,
      status: {
            in: [
            WordStatus.NEW,
            WordStatus.LEARNING,
            WordStatus.REVIEWING,
            WordStatus.MASTERED,
            ],
        },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: {
      term: true,
      meaning: true,
    },
  });

  if (recentWords.length < 5) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Need at least 5 learned words.",
      },
      {
        status: 400,
      }
    );
  }

    try {
    const words = await generateRelatedWords(recentWords);

    return NextResponse.json({
        ok: true,
        words,
    });
    } catch (error) {
    console.error("Related words failed:", error);

    const message =
        error instanceof Error
        ? error.message
        : JSON.stringify(error);

    return NextResponse.json(
        {
        ok: false,
        error:
            message.includes("RESOURCE_EXHAUSTED") ||
            message.includes("429")
            ? "AI quota exceeded. Try again in a minute."
            : "Could not generate suggestions.",
        },
        {
        status: 429,
        }
    );
    }
}