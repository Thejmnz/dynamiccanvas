import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { designs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

// GET - Fetch all designs
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allDesigns = await db
      .select()
      .from(designs)
      .orderBy(designs.createdAt);

    return NextResponse.json(allDesigns);
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}

// POST - Create a new design
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, json, width, height } = body;

    if (!name || !json) {
      return NextResponse.json(
        { error: "Name and JSON are required" },
        { status: 400 }
      );
    }

    const [newDesign] = await db
      .insert(designs)
      .values({
        name,
        json,
        width: width || 1080,
        height: height || 1350,
      })
      .returning();

    return NextResponse.json(newDesign);
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json(
      { error: "Failed to create design" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a design
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Design ID is required" },
        { status: 400 }
      );
    }

    await db.delete(designs).where(eq(designs.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting design:", error);
    return NextResponse.json(
      { error: "Failed to delete design" },
      { status: 500 }
    );
  }
}
