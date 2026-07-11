import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sum } from "drizzle-orm";

export async function GET() {
  try {
    // Obtener el total de renders sumando todos los renderCount
    const result = await db
      .select({ total: sum(users.renderCount) })
      .from(users);

    const totalRenders = result[0]?.total || 0;

    return NextResponse.json({ totalRenders });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
