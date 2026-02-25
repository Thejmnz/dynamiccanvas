import { Loader, RefreshCw, Search } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

// Categorías de Pixabay
const PIXABAY_CATEGORIES = [
  { id: "varied", name: "Varied", nameEs: "Variado", query: "nature,landscape,people,animals,food,technology" },
  { id: "animals", name: "Animals", nameEs: "Animales", query: "animals" },
  { id: "nature", name: "Nature", nameEs: "Naturaleza", query: "nature,landscape,flowers" },
  { id: "people", name: "People", nameEs: "Personas", query: "people,portrait,woman,man" },
  { id: "food", name: "Food", nameEs: "Comida", query: "food,restaurant,cooking" },
  { id: "technology", name: "Technology", nameEs: "Tecnología", query: "technology,computer,tech" },
  { id: "business", name: "Business", nameEs: "Negocios", query: "business,office,work" },
  { id: "architecture", name: "Architecture", nameEs: "Arquitectura", query: "architecture,building,city" },
  { id: "travel", name: "Travel", nameEs: "Viajes", query: "travel,beach,mountain,city" },
  { id: "space", name: "Space", nameEs: "Espacio", query: "space,galaxy,stars,universe" },
];

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  webformatWidth: number;
  webformatHeight: number;
}

interface PixabayResponse {
  hits: PixabayImage[];
  totalHits: number;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const { t, language } = useLanguage();

  // Categoría activa
  const [activeCategory, setActiveCategory] = useState<string>("varied");

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PixabayImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estado para paginación de categorías
  const [categoryImages, setCategoryImages] = useState<PixabayImage[]>([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [hasMoreCategory, setHasMoreCategory] = useState(true);
  const [totalCategoryHits, setTotalCategoryHits] = useState(0);

  // Estado para paginación de búsqueda
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [totalSearchHits, setTotalSearchHits] = useState(0);

  // Ref para evitar cargas múltiples
  const isLoadingMoreRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number>(0);
  const isRestoringScrollRef = useRef(false);

  const IMAGES_PER_PAGE = 10;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  // Fetch images from Pixabay
  const fetchImages = async (
    query: string,
    page: number
  ): Promise<{ images: PixabayImage[]; totalHits: number } | null> => {
    try {
      const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${IMAGES_PER_PAGE}&page=${page}&safesearch=true`
      );
      const data: PixabayResponse = await response.json();
      return {
        images: data.hits || [],
        totalHits: data.totalHits || 0,
      };
    } catch (error) {
      console.error("Error fetching Pixabay images:", error);
      return null;
    }
  };

  // Cargar imágenes de categoría (carga inicial)
  const loadCategoryImages = useCallback(async (categoryId: string, page: number, reset: boolean = false) => {
    const category = PIXABAY_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    setIsLoadingCategory(true);
    isLoadingMoreRef.current = true;

    const result = await fetchImages(category.query, page);

    if (result) {
      if (reset) {
        setCategoryImages(result.images);
        setCategoryPage(1);
      } else {
        setCategoryImages(result.images);
      }
      setTotalCategoryHits(result.totalHits);
      setHasMoreCategory(result.images.length < result.totalHits);
    }

    setIsLoadingCategory(false);
    setTimeout(() => {
      isLoadingMoreRef.current = false;
    }, 300);
  }, []);

  // Cargar más imágenes de categoría
  const loadMoreCategoryImages = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreCategory || isLoadingCategory) return;

    const category = PIXABAY_CATEGORIES.find(c => c.id === activeCategory);
    if (!category) return;

    isLoadingMoreRef.current = true;
    const nextPage = categoryPage + 1;

    const result = await fetchImages(category.query, nextPage);

    if (result && result.images.length > 0) {
      setCategoryImages(prev => [...prev, ...result.images]);
      setCategoryPage(nextPage);
      setHasMoreCategory(categoryImages.length + result.images.length < result.totalHits);
    } else {
      setHasMoreCategory(false);
    }

    setTimeout(() => {
      isLoadingMoreRef.current = false;
    }, 300);
  }, [hasMoreCategory, categoryPage, activeCategory, categoryImages.length, isLoadingCategory]);

  // Cargar más resultados de búsqueda
  const loadMoreSearchResults = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreSearch || isSearching || !searchQuery.trim()) return;

    isLoadingMoreRef.current = true;
    const nextPage = searchPage + 1;

    const result = await fetchImages(searchQuery, nextPage);

    if (result && result.images.length > 0) {
      setSearchResults(prev => [...prev, ...result.images]);
      setSearchPage(nextPage);
      setHasMoreSearch(searchResults.length + result.images.length < result.totalHits);
    } else {
      setHasMoreSearch(false);
    }

    setTimeout(() => {
      isLoadingMoreRef.current = false;
    }, 300);
  }, [hasMoreSearch, searchPage, searchQuery, searchResults.length, isSearching]);

  // Cambiar categoría
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setShowSearchResults(false);
    isLoadingMoreRef.current = false;
    loadCategoryImages(categoryId, 1, true);
  };

  // Búsqueda
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    setSearchPage(1);
    setSearchResults([]);
    setHasMoreSearch(true);
    isLoadingMoreRef.current = true;

    const result = await fetchImages(searchQuery, 1);

    if (result) {
      setSearchResults(result.images);
      setTotalSearchHits(result.totalHits);
      setHasMoreSearch(result.images.length < result.totalHits);
    }

    setIsSearching(false);
    setTimeout(() => {
      isLoadingMoreRef.current = false;
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchPage(1);
    setHasMoreSearch(true);
    isLoadingMoreRef.current = false;
  };

  const handleAddPixabayImage = (imageUrl: string) => {
    editor?.addImage(imageUrl);
  };

  // Cargar categoría inicial
  useEffect(() => {
    loadCategoryImages("varied", 1);
  }, []);

  // Manejar scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isRestoringScrollRef.current) return;
    
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Si está cerca del final (a 200px) y no está ya cargando
    if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingMoreRef.current) {
      // Guardar posición actual del scroll
      savedScrollPositionRef.current = scrollTop;
      
      if (showSearchResults && hasMoreSearch) {
        loadMoreSearchResults();
      } else if (!showSearchResults && hasMoreCategory) {
        loadMoreCategoryImages();
      }
    }
  }, [showSearchResults, hasMoreSearch, hasMoreCategory, loadMoreCategoryImages, loadMoreSearchResults]);

  // Restaurar posición del scroll después de cargar más imágenes
  useEffect(() => {
    if (!isLoadingCategory && !isSearching && savedScrollPositionRef.current > 0 && scrollContainerRef.current) {
      isRestoringScrollRef.current = true;
      scrollContainerRef.current.scrollTop = savedScrollPositionRef.current;
      setTimeout(() => {
        isRestoringScrollRef.current = false;
      }, 100);
    }
  }, [categoryImages, searchResults, isLoadingCategory, isSearching]);

  // Componente para renderizar grid de imágenes
  const ImageGrid = ({ images }: { images: PixabayImage[] }) => (
    <div className="grid grid-cols-2 gap-2 pr-1">
      {images.map((image, index) => (
        <button
          onClick={() => handleAddPixabayImage(image.largeImageURL)}
          key={`${image.id}-${index}`}
          className={cn(
            "relative w-full group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border",
            index % 6 === 1 && "row-span-2",
            index % 6 === 3 && "col-span-2"
          )}
          style={{
            height: index % 6 === 1 ? '140px' : index % 6 === 3 ? '70px' : '90px'
          }}
        >
          <img
            src={image.webformatURL}
            alt={image.tags}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[9px] truncate text-white p-1 bg-black/50 text-left">
            {image.tags.split(',')[0]}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title={t("sidebar_images_title")}
        description={t("sidebar_images_gallery_desc") || "Search images from Pixabay gallery"}
      />

      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-3 py-2 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_images")}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-3 py-2 bg-[#135bec] text-white text-xs font-medium rounded-md hover:bg-[#0d4bc9] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? <Loader className="size-3.5 animate-spin" /> : t("search")}
          </button>
        </div>
        {showSearchResults && (
          <button
            type="button"
            onClick={clearSearch}
            className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 transition"
          >
            {t("clear_search")}
          </button>
        )}
      </form>

      {/* Category buttons */}
      {!showSearchResults && (
        <div className="px-3 py-2 border-b">
          <p className="text-[10px] text-gray-400 mb-2">{t("powered_by_pixabay")}</p>
          <div className="flex flex-wrap gap-1.5">
            {PIXABAY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium rounded-full transition",
                  activeCategory === category.id
                    ? "bg-[#135bec] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {language === "es" ? category.nameEs : category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="p-3">
          {/* Search Results */}
          {showSearchResults && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">
                  {t("search_results")} ({searchResults.length}/{totalSearchHits})
                </span>
              </div>
              {isSearching && searchResults.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="size-5 text-muted-foreground animate-spin" />
                </div>
              )}
              {!isSearching && searchResults.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">{t("no_results_found")}</p>
              )}
              {searchResults.length > 0 && (
                <ImageGrid images={searchResults} />
              )}
              {/* Loading more indicator */}
              {hasMoreSearch && (
                <div className="flex items-center justify-center py-4">
                  <Loader className="size-5 text-muted-foreground animate-spin" />
                </div>
              )}
              {!hasMoreSearch && searchResults.length > 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  {language === "es" ? "No hay más imágenes" : "No more images"}
                </p>
              )}
            </div>
          )}

          {/* Category Images */}
          {!showSearchResults && (
            <div>
              {/* Initial loading */}
              {isLoadingCategory && categoryImages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="size-5 text-muted-foreground animate-spin" />
                </div>
              )}

              {/* Images grid */}
              {categoryImages.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-500">
                      {categoryImages.length}/{totalCategoryHits}
                    </span>
                    <button
                      onClick={() => {
                        isLoadingMoreRef.current = false;
                        loadCategoryImages(activeCategory, 1, true);
                      }}
                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition"
                    >
                      <RefreshCw className="size-3" />
                      {t("refresh")}
                    </button>
                  </div>
                  <ImageGrid images={categoryImages} />
                </>
              )}

              {/* Loading more indicator */}
              {hasMoreCategory && categoryImages.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader className="size-5 text-muted-foreground animate-spin" />
                </div>
              )}

              {/* No more images */}
              {!hasMoreCategory && categoryImages.length > 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  {language === "es" ? "No hay más imágenes" : "No more images"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
