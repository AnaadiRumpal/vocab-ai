import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVocabEntry } from "@/lib/vocab-generator";

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

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

  const body = await request.json().catch(() => null);
  const term = cleanTerm(body?.term);

  if (!term) {
    return NextResponse.json(
      { ok: false, error: "Expected a valid word or phrase." },
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