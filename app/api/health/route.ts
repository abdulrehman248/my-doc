import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "DATABASE_URL is not set"
        ? "DATABASE_URL is not set"
        : "Database is unreachable";

    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
