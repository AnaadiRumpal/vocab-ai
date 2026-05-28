import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.count();

  return NextResponse.json({
    ok: true,
    users,
  });
}