"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EditableFabricImage,
  setImageHdLoading,
} from "@/features/editor/image-effects";
import {
  fetchPixabayPage,
  getPixabayThumbnailUrl,
  PixabayImage,
  preloadPixabayImages,
} from "@/features/editor/pixabay-cache";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const { t, language } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadImages = useCallback(async ({
    query,
    nextPage,
    append,
  }: {
    query: string;
    nextPage: number;
    append: boolean;
  }) => {
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError("");

    try {
      const data = await fetchPixabayPage({
        query,
        page: nextPage,
        language: language === "es" ? "es" : "en",
      });

      setImages((current) => append ? [...current, ...data.hits] : data.hits);
      preloadPixabayImages(data.hits, 24);
      setTotalHits(data.totalHits || 0);
      setPage(nextPage);
      setHasLoaded(true);
    } catch (loadError) {
      console.error(loadError);
      setError(language === "es"
        ? "No se pudieron cargar las imágenes de Pixabay."
        : "Could not load Pixabay images.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [language]);

  useEffect(() => {
    if (activeTool === "images" && !hasLoaded && !isLoading) {
      void loadImages({ query: "", nextPage: 1, append: false });
    }
  }, [activeTool, hasLoaded, isLoading, loadImages]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    setAppliedQuery(query);
    void loadImages({ query, nextPage: 1, append: false });
  };

  const handleImport = async (image: PixabayImage) => {
    if (!editor || importingId !== null) return;
    setImportingId(image.id);

    try {
      // The gallery preview is already in the browser cache, so it can be
      // placed on the canvas immediately while the HD asset is persisted.
      // Use Pixabay's stable CDN thumbnail for the immediate canvas object.
      // The signed webformat URL can expire; the fresh HD asset replaces this
      // source in the background without changing its visual dimensions.
      const canvasImage = await editor.addImage(getPixabayThumbnailUrl(image));
      if (!canvasImage) throw new Error("Could not decode image");
      setImageHdLoading(
        canvasImage as EditableFabricImage,
        true,
        language === "es" ? "CARGANDO HD…" : "LOADING HD…",
      );
      setImportingId(null);
      toast.success(language === "es" ? "Imagen agregada al lienzo" : "Image added to canvas");

      void (async () => {
        try {
          const response = await fetch("/api/pixabay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: image.id, imageUrl: image.largeImageURL }),
          });
          const data = await response.json() as { url?: string; error?: string };
          if (!response.ok || !data.url) throw new Error(data.error || "Import failed");
          await editor.replaceImageObjectSource(canvasImage, data.url);
        } catch (persistError) {
          console.error("Could not upgrade Pixabay image to HD:", persistError);
          toast.error(language === "es"
            ? "La imagen se agregó, pero no se pudo guardar la versión HD."
            : "The image was added, but its HD version could not be saved.");
        } finally {
          setImageHdLoading(canvasImage as EditableFabricImage, false);
        }
      })();
    } catch (importError) {
      console.error(importError);
      toast.error(language === "es"
        ? "No se pudo agregar la imagen."
        : "Could not add the image.");
      setImportingId(null);
    }
  };

  const canLoadMore = images.length > 0 && images.length < totalHits;

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[320px] h-full flex flex-col shrink-0",
        activeTool === "images" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Imágenes" : "Images"}
        description={t("sidebar_images_gallery_desc") || "Search images from Pixabay"}
      />

      <form onSubmit={handleSearch} className="p-3 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("search_images") || "Search images..."}
              className="h-9 pl-8 text-xs"
              maxLength={100}
            />
          </div>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? <Loader className="size-4 animate-spin" /> : t("search")}
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-between border-b px-3 py-2">
        <a
          href="https://pixabay.com/"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-muted-foreground hover:underline"
        >
          {t("powered_by_pixabay") || "Powered by Pixabay"}
        </a>
        {totalHits > 0 && (
          <span className="text-[10px] text-muted-foreground">{totalHits}</span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {isLoading && images.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangle className="size-6 text-amber-500" />
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadImages({
                  query: appliedQuery,
                  nextPage: 1,
                  append: false,
                })}
              >
                <RefreshCw className="mr-2 size-3.5" />
                {language === "es" ? "Reintentar" : "Try again"}
              </Button>
            </div>
          )}

          {!isLoading && !error && images.length === 0 && (
            <p className="py-12 text-center text-xs text-muted-foreground">
              {t("no_results_found") || "No images found"}
            </p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image) => (
                <div key={image.id} className="group overflow-hidden rounded-md border bg-muted">
                  <button
                    type="button"
                    disabled={importingId !== null}
                    onClick={() => void handleImport(image)}
                    className="relative block h-28 w-full overflow-hidden text-left hover:opacity-90 disabled:cursor-wait"
                  >
                    <img
                      src={getPixabayThumbnailUrl(image)}
                      alt={image.tags}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                      {importingId === image.id ? (
                        <Loader className="size-6 animate-spin text-white" />
                      ) : (
                        <Plus className="size-6 text-white opacity-0 drop-shadow group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {canLoadMore && (
            <Button
              variant="outline"
              className="mt-3 w-full"
              disabled={isLoadingMore}
              onClick={() => void loadImages({
                query: appliedQuery,
                nextPage: page + 1,
                append: true,
              })}
            >
              {isLoadingMore ? (
                <Loader className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {language === "es" ? "Cargar más" : "Load more"}
            </Button>
          )}
        </div>
      </ScrollArea>

      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
