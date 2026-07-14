export type PixabayImage = {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  webformatWidth: number;
  webformatHeight: number;
  user: string;
  userId: number;
};

export type PixabayResponse = {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
  error?: string;
};

const CACHE_TTL = 2 * 60 * 1000;
const pageCache = new Map<string, { expiresAt: number; promise: Promise<PixabayResponse> }>();
const preloadedUrls = new Set<string>();

export const getPixabayPreviewUrl = (image: PixabayImage) =>
  `/api/pixabay?imageUrl=${encodeURIComponent(image.webformatURL || image.previewURL)}`;

// Pixabay's webformat/large URLs are signed and can expire. The CDN preview
// URL is stable, so gallery thumbnails should never depend on a signed URL.
export const getPixabayThumbnailUrl = (image: PixabayImage) =>
  `/api/pixabay?imageUrl=${encodeURIComponent(image.previewURL || image.webformatURL)}`;

export const preloadPixabayImages = (images: PixabayImage[], limit = 16) => {
  if (typeof window === "undefined") return;

  images.slice(0, limit).forEach((image, index) => {
    const urls = [getPixabayThumbnailUrl(image)];
    // Warm only the first few canvas-sized assets. Preloading every HD image
    // makes opening the gallery slower and wastes bandwidth.
    if (index < Math.min(6, limit)) {
      urls.push(getPixabayPreviewUrl(image));
    }

    urls.forEach((url) => {
      if (preloadedUrls.has(url)) return;
      preloadedUrls.add(url);
      const preload = new window.Image();
      preload.decoding = "async";
      preload.src = url;
    });
  });
};

export const fetchPixabayPage = ({
  query = "",
  page = 1,
  language = "en",
}: {
  query?: string;
  page?: number;
  language?: "es" | "en";
}) => {
  const key = `${language}:${query.trim().toLowerCase()}:${page}`;
  const cached = pageCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const params = new URLSearchParams({ page: String(page), lang: language });
  if (query.trim()) params.set("q", query.trim());

  const promise = fetch(`/api/pixabay?${params}`, { cache: "no-store" })
    .then(async (response) => {
      const data = await response.json() as PixabayResponse;
      if (!response.ok) throw new Error(data.error || "Pixabay request failed");
      preloadPixabayImages(data.hits);
      return data;
    })
    .catch((error) => {
      pageCache.delete(key);
      throw error;
    });

  pageCache.set(key, { expiresAt: Date.now() + CACHE_TTL, promise });
  return promise;
};

export const prefetchPixabayGallery = (language: "es" | "en") => {
  void fetchPixabayPage({ language }).catch(() => {});
};
