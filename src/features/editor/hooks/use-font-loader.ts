"use client";

import { useEffect, useRef } from "react";

export const useFontLoader = (onFontsLoaded?: () => void) => {
  const callbackRef = useRef(onFontsLoaded);
  callbackRef.current = onFontsLoaded;

  useEffect(() => {
    let mounted = true;

    const loadLocalFonts = async () => {
      try {
        const response = await fetch("/api/fonts");
        if (!response.ok) return;

        const fontFiles = await response.json();
        if (!Array.isArray(fontFiles)) return;

        for (const file of fontFiles) {
          const fontName = file.replace(/\.[^/.]+$/, "");
          const fontUrl = `/fonts/${file}`;

          const isLoaded = Array.from(document.fonts).some(f => f.family === fontName);
          if (!isLoaded) {
            try {
              const fontFace = new FontFace(fontName, `url('${fontUrl}')`);
              await fontFace.load();
              document.fonts.add(fontFace);
            } catch {}
          }
        }
      } catch {}
    };

    const loadUploadedFonts = async () => {
      try {
        const response = await fetch("/api/uploaded-fonts");
        if (!response.ok) return;

        const uploadedFonts = await response.json();
        if (!Array.isArray(uploadedFonts)) return;

        for (const font of uploadedFonts) {
          const fontName = font.displayName;
          const isLoaded = Array.from(document.fonts).some(f => f.family === fontName);
          if (!isLoaded) {
            try {
              const fontFace = new FontFace(fontName, `url('${font.publicUrl}')`);
              await fontFace.load();
              document.fonts.add(fontFace);
            } catch {}
          }
        }
      } catch {}
    };

    const loadAll = async () => {
      await Promise.all([loadLocalFonts(), loadUploadedFonts()]);
      if (mounted) {
        callbackRef.current?.();
      }
    };

    loadAll();

    return () => { mounted = false; };
  }, []);
};
