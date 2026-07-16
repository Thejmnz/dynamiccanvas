import { supabase } from "@/lib/supabaseClient";

const createApiKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Math.random().toString(36).substring(2, 10)}`;

export const apiKeyQueryKey = (userId: string) => ["api-key", { userId }] as const;
export const playgroundTemplatesQueryKey = (userId: string) => ["playground-templates", { userId }] as const;
export const rendersQueryKey = (userId: string) => ["renders", { userId }] as const;
export const adminOverviewQueryKey = ["admin-overview"] as const;

type DashboardTemplateRow = {
  id: string;
  name: string;
  width: number;
  height: number;
  json: string;
  elements?: unknown[] | null;
  background_color?: string | null;
  lastModified?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  [key: string]: unknown;
};

export const fetchOrCreateApiKey = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_api_keys")
    .select("api_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data?.api_key) return data.api_key as string;

  const apiKey = createApiKey();
  const now = new Date().toISOString();
  const { error: saveError } = await supabase
    .from("user_api_keys")
    .upsert(
      { user_id: userId, api_key: apiKey, createdAt: now, updatedAt: now },
      { onConflict: "user_id" },
    );

  if (saveError) throw saveError;
  return apiKey;
};

export const fetchPlaygroundTemplates = async (userId: string): Promise<DashboardTemplateRow[]> => {
  const response = await fetch("/api/user-templates?offset=0&limit=101");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to load templates");
  return (result.data ?? []) as DashboardTemplateRow[];
};

export const fetchRenders = async () => {
  const response = await fetch("/api/renders");
  if (!response.ok) throw new Error("Failed to load renders");
  const result = await response.json();
  return result.data ?? [];
};

export const fetchAdminOverview = async () => {
  const [usersResponse, statsResponse, newsResponse, feedbackResponse] = await Promise.all([
    fetch("/api/admin/users"),
    fetch("/api/admin/stats"),
    fetch("/api/news"),
    fetch("/api/feedback", { cache: "no-store" }),
  ]);

  if (!usersResponse.ok || !statsResponse.ok || !newsResponse.ok || !feedbackResponse.ok) {
    throw new Error("Failed to load admin overview");
  }

  const [users, stats, news, feedback] = await Promise.all([
    usersResponse.json(),
    statsResponse.json(),
    newsResponse.json(),
    feedbackResponse.json(),
  ]);

  return { users, stats, news: news.data ?? [], feedback: feedback.data ?? [] };
};
