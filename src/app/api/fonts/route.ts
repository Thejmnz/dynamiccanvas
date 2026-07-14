import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FONT_EXTENSION_PRIORITY: Record<string, number> = {
    ".woff2": 4,
    ".woff": 3,
    ".otf": 2,
    ".ttf": 1,
};

function isRealFont(filePath: string) {
    const descriptor = fs.openSync(filePath, "r");

    try {
        const signature = Buffer.alloc(4);
        if (fs.readSync(descriptor, signature, 0, 4, 0) !== 4) return false;

        const asciiSignature = signature.toString("ascii");
        return (
            signature.equals(Buffer.from([0x00, 0x01, 0x00, 0x00])) ||
            asciiSignature === "OTTO" ||
            asciiSignature === "wOFF" ||
            asciiSignature === "wOF2" ||
            asciiSignature === "ttcf"
        );
    } finally {
        fs.closeSync(descriptor);
    }
}

export async function GET() {
    try {
        const fontsDirectory = path.join(process.cwd(), "public", "fonts");

        if (!fs.existsSync(fontsDirectory)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(fontsDirectory);
        const validFontFiles = files.filter((file) => {
            if (!/\.(ttf|otf|woff|woff2)$/i.test(file)) return false;
            return isRealFont(path.join(fontsDirectory, file));
        });

        // Several families have both a TTF and a WOFF2. Only return the best
        // browser format so the same family is not downloaded twice.
        const preferredByFamily = new Map<string, string>();
        for (const file of validFontFiles) {
            const extension = path.extname(file).toLowerCase();
            const family = path.basename(file, extension).toLowerCase();
            const current = preferredByFamily.get(family);
            const currentPriority = current
                ? FONT_EXTENSION_PRIORITY[path.extname(current).toLowerCase()] ?? 0
                : 0;

            if (!current || (FONT_EXTENSION_PRIORITY[extension] ?? 0) > currentPriority) {
                preferredByFamily.set(family, file);
            }
        }

        const fontFiles = Array.from(preferredByFamily.values()).sort((a, b) =>
            a.localeCompare(b),
        );

        return NextResponse.json(fontFiles, {
            headers: {
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error reading fonts directory:", error);
        return NextResponse.json({ error: "Failed to load fonts" }, { status: 500 });
    }
}
