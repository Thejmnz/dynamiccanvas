import { useQuery, useQueryClient } from "@tanstack/react-query";

export type ResponseType = {
  id: string;
  name: string;
  json: string;
  width: number;
  height: number;
  userId: string;
  updatedAt: Date;
  isTemplate?: boolean;
  elements?: any[];
  [key: string]: any;
};

export const useGetProject = (id: string) => {
  const queryClient = useQueryClient();

  const getCachedProject = () => {
    const projectLists = queryClient.getQueriesData<any>({
      queryKey: ["projects"],
    });

    for (const [, cached] of projectLists) {
      const pages = Array.isArray(cached?.pages) ? cached.pages : [];
      for (const page of pages) {
        const project = page?.data?.find((item: any) => item?.id === id);
        if (project) return project;
      }
    }

    return undefined;
  };

  const query = useQuery({
    enabled: !!id,
    queryKey: ["project", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/user-templates/${id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch project");
      const data = result.data;

      // Prepare canvas JSON for the editor
      let canvasJson;

      try {
        const parsedJson = data.json ? JSON.parse(data.json) : undefined;
        console.log("[Project format]", JSON.stringify({
          id,
          jsonVersion: parsedJson?.version,
          jsonObjects: Array.isArray(parsedJson?.objects) ? parsedJson.objects.length : undefined,
          jsonElements: Array.isArray(parsedJson?.elements) ? parsedJson.elements.length : undefined,
          legacyElements: Array.isArray(data.elements) ? data.elements.length : undefined,
        }));
      } catch {
        console.log("[Project format]", JSON.stringify({
          id,
          jsonVersion: "invalid",
          legacyElements: Array.isArray(data.elements) ? data.elements.length : undefined,
        }));
      }

      // Primero intentar usar el campo 'json' (formato Konva 2.0)
      if (data.json) {
        try {
          const parsed = JSON.parse(data.json);
          // Si ya es formato 2.0, usarlo directamente
          if (parsed.version === "2.0") {
            canvasJson = data.json;
          } else {
            // Si es formato antiguo, convertir o usar como está
            canvasJson = data.json;
          }
        } catch (e) {
          console.error("Error parsing json field:", e);
          canvasJson = JSON.stringify({ version: "2.0", workspace: { width: data.width || 900, height: data.height || 1200, background: data.backgroundColor || "#ffffff" }, elements: [] });
        }
      } else if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
        // Fallback: usar campo 'elements' (formato antiguo Fabric.js)
        canvasJson = JSON.stringify({
          version: "2.0",
          workspace: { width: data.width || 900, height: data.height || 1200, background: data.backgroundColor || "#ffffff" },
          elements: data.elements
        });
      } else {
        // Create initial workspace for new/empty projects
        canvasJson = JSON.stringify({
          version: "2.0",
          workspace: { width: data.width || 900, height: data.height || 1200, background: data.backgroundColor || "#ffffff" },
          elements: []
        });
      }

      // Map fields to match what the editor expects
      return {
        ...data,
        updatedAt: data.lastModified ? new Date(data.lastModified) : new Date(),
        json: canvasJson,
      };
    },
    // The dashboard already fetched the complete project row. Reusing it
    // removes a second Supabase round trip when opening the editor.
    initialData: getCachedProject,
    staleTime: 60 * 1000,
  });

  return query;
};
