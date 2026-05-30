import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const words = await db.word.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      term: "asc",
    },
    select: {
      term: true,
      meaning: true,
    },
  });

  const csv = [
    ["Word", "Meaning"],
    ...words.map((word) => [
      escapeCsv(word.term),
      escapeCsv(word.meaning),
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="vocabulary.csv"',
    },
  });
}