"use client";

import { useEffect, useState } from "react";

type FontDescriptor = {
  family: string;
  url: string;
};

const normalizeFamily = (family: string) => family.trim().toLowerCase();

let localFontManifestPromise: Promise<FontDescriptor[]> | null = null;
let uploadedFontManifestPromise: Promise<FontDescriptor[]> | null = null;

const getLocalFontManifest = () => {
  if (!localFontManifestPromise) {
    localFontManifestPromise = fetch("/api/fonts", { cache: "force-cache" })
      .then(async (response) => response.ok ? response.json() : [])
      .then((files) => Array.isArray(files)
        ? files.map((file: string) => ({
            family: file.replace(/\.[^/.]+$/, ""),
            url: `/fonts/${file}`,
          }))
        : [])
      .catch(() => []);
  }

  return localFontManifestPromise;
};

const getUploadedFontManifest = () => {
  if (!uploadedFontManifestPromise) {
    uploadedFontManifestPromise = fetch("/api/uploaded-fonts")
      .then(async (response) => response.ok ? response.json() : [])
      .then((fonts) => Array.isArray(fonts)
        ? fonts.map((font: { displayName: string; publicUrl: string }) => ({
            family: font.displayName,
            url: font.publicUrl,
          }))
        : [])
      .catch(() => []);
  }

  return uploadedFontManifestPromise;
};

const isFontLoaded = (family: string) => Array.from(document.fonts).some(
  (face) => normalizeFamily(face.family) === normalizeFamily(family) && face.status === "loaded",
);

const loadFontFace = async ({ family, url }: FontDescriptor) => {
  const existing = Array.from(document.fonts).find(
    (face) => normalizeFamily(face.family) === normalizeFamily(family),
  );
  if (existing?.status === "loaded") return;
  if (existing) {
    try {
      await existing.loaded;
      return;
    } catch {}
  }

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
      const required = requiredKey.split("|").filter(Boolean);
      let missing = required.filter((family) => !isFontLoaded(family));

      if (missing.length > 0) {
        const localFonts = await getLocalFontManifest();
        const localMatches = localFonts.filter((font) =>
          missing.includes(normalizeFamily(font.family)),
        );
        await Promise.all(localMatches.map(loadFontFace));
        missing = missing.filter((family) => !isFontLoaded(family));
      }

      // Authentication, plan lookup and Supabase Storage listing are only
      // needed when a required family was not found among bundled fonts.
      if (missing.length > 0) {
        const uploadedFonts = await getUploadedFontManifest();
        const uploadedMatches = uploadedFonts.filter((font) =>
          missing.includes(normalizeFamily(font.family)),
        );
        await Promise.all(uploadedMatches.map(loadFontFace));
      }

      if (mounted) setFontsLoaded(true);
    };

    setFontsLoaded(false);
    void discoverFonts();

    return () => { mounted = false; };
  }, [requiredKey]);

  return fontsLoaded;
};
