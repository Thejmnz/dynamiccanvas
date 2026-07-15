import { supabase } from "@/lib/supabaseClient";

const createApiKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Math.random().toString(36).substring(2, 10)}`;

export const apiKeyQueryKey = (userId: string) => ["api-key", { userId }] as const;
export const playgroundTemplatesQueryKey = (userId: string) => ["playground-templates", { userId }] as const;
export const rendersQueryKey = (userId: string) => ["renders", { userId }] as const;
export const adminOverviewQueryKey = ["admin-overview"] as const;

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

export const fetchPlaygroundTemplates = async (userId: string) => {
  const { data, error } = await supabase
    .from("dynamic_canvas_templates")
    .select("*")
    .eq("user_id", userId)
    .order("lastModified", { ascending: false });

  if (error) throw error;
  return data ?? [];
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
