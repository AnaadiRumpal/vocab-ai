import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      id,
      userId,
    },
  });

  if (!word) {
    return NextResponse.json(
      { ok: false, error: "Word not found." },
      { status: 404 }
    );
  }

  await db.word.delete({
    where: {
      id: word.id,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}