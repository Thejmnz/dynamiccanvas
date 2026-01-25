import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const fontsDirectory = path.join(process.cwd(), "public", "fonts");

        if (!fs.existsSync(fontsDirectory)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(fontsDirectory);
        // Filter for common font extensions
        const fontFiles = files.filter(file =>
            /\.(ttf|otf|woff|woff2)$/i.test(file)
        );

        return NextResponse.json(fontFiles);
    } catch (error) {
        console.error("Error reading fonts directory:", error);
        return NextResponse.json({ error: "Failed to load fonts" }, { status: 500 });
    }
}
