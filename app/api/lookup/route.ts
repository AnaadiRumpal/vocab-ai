import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateVocabEntry } from "@/lib/vocab-generator";

function cleanTerm(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const term = value.replace(/\s+/g, " ").trim();

  if (!term || term.length > 160) {
    return null;
  }

  return term;
}

function normalizeTerm(term: string) {
  return term
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in before looking up words." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const term = cleanTerm(body?.term);

  if (!term) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid word or phrase." },
      { status: 400 }
    );
  }

  const sourceText =
    typeof body?.sourceText === "string" ? body.sourceText.trim() : null;

try {
  const entry = await generateVocabEntry({
    term,
    normalized: normalizeTerm(term),
    sourceText,
  });

  return NextResponse.json({
      ok: true,
      entry,
    });
  } catch (error) {
    console.error("Lookup failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "";

    return NextResponse.json(
      {
        ok: false,
        error:
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED")
            ? "AI quota exceeded. Please try again shortly."
            : "Could not generate vocabulary card.",
      },
      {
        status: 500,
      }
    );
  }
}