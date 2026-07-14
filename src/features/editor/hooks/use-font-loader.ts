"use client";

import { useEffect, useState } from "react";

type FontDescriptor = {
  family: string;
  url: string;
};

const normalizeFamily = (family: string) => family.trim().toLowerCase();

const loadFontFace = async ({ family, url }: FontDescriptor) => {
  const existing = Array.from(document.fonts).find(
    (face) => normalizeFamily(face.family) === normalizeFamily(family),
  );
  if (existing?.status === "loaded") return;

  try {
    const fontFace = new FontFace(family, `url('${url}')`);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch {
    // A system font or unavailable custom font will safely use its fallback.
  }
};

export const useFontLoader = (requiredFamilies: string[] = []) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const requiredKey = requiredFamilies
    .map(normalizeFamily)
    .sort()
    .join("|");

  useEffect(() => {
    let mounted = true;

    const discoverFonts = async () => {
      const descriptors: FontDescriptor[] = [];

      try {
        const response = await fetch("/api/fonts");
        if (response.ok) {
          const files = await response.json();
          if (Array.isArray(files)) {
            files.forEach((file: string) => {
              descriptors.push({
                family: file.replace(/\.[^/.]+$/, ""),
                url: `/fonts/${file}`,
              });
            });
          }
        }
      } catch {}

      try {
        const response = await fetch("/api/uploaded-fonts");
        if (response.ok) {
          const fonts = await response.json();
          if (Array.isArray(fonts)) {
            fonts.forEach((font: { displayName: string; publicUrl: string }) => {
              descriptors.push({ family: font.displayName, url: font.publicUrl });
            });
          }
        }
      } catch {}

      const required = new Set(requiredKey.split("|").filter(Boolean));
      const relevant = descriptors.filter((font) =>
        required.has(normalizeFamily(font.family)),
      );

      await Promise.all(relevant.map(loadFontFace));
      if (mounted) setFontsLoaded(true);
    };

    setFontsLoaded(false);
    void discoverFonts();

    return () => { mounted = false; };
  }, [requiredKey]);

  return fontsLoaded;
};
