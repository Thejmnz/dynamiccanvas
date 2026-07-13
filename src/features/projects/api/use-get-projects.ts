import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useUserRole } from "@/hooks/use-user-role";

export const useGetProjects = (enabled = true) => {
  const { userId } = useUserRole();
  const LIMIT = 8;

  const query = useInfiniteQuery({
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    queryKey: ["projects", { userId }],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { data: [], nextPage: null };

      const from = (pageParam as number) * LIMIT;
      // Request one extra row so we know whether another page truly exists.
      const to = from + LIMIT;

      const { data, error } = await supabase
        .from('dynamic_canvas_templates')
        .select('*')
        .eq('user_id', userId)
        .order('lastModified', { ascending: false, nullsFirst: false })
        .range(from, to);

      if (error) {
        console.error("Fetch projects error:", error);
        throw new Error("Failed to fetch projects");
      }

      const pageData = (data || []).slice(0, LIMIT);
      const mappedData = pageData.map((item) => ({
        ...item,
        updatedAt: item.updated_at || item.lastModified ? new Date(item.updated_at || item.lastModified) : new Date(),
        // Ensure standard fields
        width: item.width || 800,
        height: item.height || 600,
        name: item.name || "Untitled Project",
        id: item.id,
        // The JSON is in the 'json' field (Konva 2.0 format)
        json: item.json || (item.elements ? JSON.stringify({ version: "2.0", workspace: { width: item.width || 800, height: item.height || 600, background: "#ffffff" }, elements: item.elements }) : ""),
        thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || null,
      }));

      return {
        data: mappedData,
        nextPage: data && data.length > LIMIT ? (pageParam as number) + 1 : null,
      };
    },
    enabled: enabled && !!userId,
  });

  return query;
};
