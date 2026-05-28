import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vocabEntrySchema } from "@/lib/vocab-generator";

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Shortcut is not configured. Sign in to Vocab AI, open Settings, and copy your capture token.",
      },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: { captureToken: token },
  });

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid capture token. Sign in to Vocab AI, open Settings, and copy your current token.",
      },
      { status: 401 }
    );
  }
  const body = await request.json().catch((error) => {
    console.log("JSON parse failed:", error);
    return null;
  });

  console.log("Shortcut capture body JSON:", JSON.stringify(body, null, 2));

  let candidate = body?.entry ?? body;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid vocabulary entry JSON string.",
          received: body,
        },
        { status: 400 }
      );
    }
  }

  const parsed = vocabEntrySchema.safeParse(candidate);

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.flatten());

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid vocabulary entry.",
        details: parsed.error.flatten(),
        received: body,
      },
      { status: 400 }
    );
  }

  const entry = parsed.data;

  const word = await db.word.upsert({
    where: {
      userId_normalized: {
        userId: user.id,
        normalized: entry.normalized,
      },
    },
    update: {
      term: entry.term,
      normalized: entry.normalized,
      kind: entry.kind,
      partOfSpeech: entry.partOfSpeech,
      meaning: entry.meaning,
      plainEnglish: entry.plainEnglish,
      examples: entry.examples,
      synonyms: entry.synonyms,
      mnemonic: entry.mnemonic,
      etymology: entry.etymology,
      difficulty: entry.difficulty,
    },
    create: {
      userId: user.id,
      term: entry.term,
      normalized: entry.normalized,
      kind: entry.kind,
      partOfSpeech: entry.partOfSpeech,
      meaning: entry.meaning,
      plainEnglish: entry.plainEnglish,
      examples: entry.examples,
      synonyms: entry.synonyms,
      mnemonic: entry.mnemonic,
      etymology: entry.etymology,
      difficulty: entry.difficulty,
    },
  });

  return NextResponse.json({
    ok: true,
    word: {
      id: word.id,
      term: word.term,
      kind: word.kind,
      meaning: word.meaning,
      plainEnglish: word.plainEnglish,
      mnemonic: word.mnemonic,
      difficulty: word.difficulty,
      createdAt: word.createdAt,
    },
  });
}