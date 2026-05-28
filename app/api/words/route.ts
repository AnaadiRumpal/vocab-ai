import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { vocabEntrySchema } from "@/lib/vocab-generator";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please sign in before adding words.",
      },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = vocabEntrySchema.safeParse(body?.entry);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid vocabulary entry." },
      { status: 400 }
    );
  }

  const entry = parsed.data;

  const word = await db.word.upsert({
    where: {
      userId_normalized: {
        userId: session.user.id,
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
      userId: session.user.id,
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
    word,
  });
}