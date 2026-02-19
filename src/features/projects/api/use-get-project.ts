import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

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
  const query = useQuery({
    enabled: !!id,
    queryKey: ["project", { id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dynamic_canvas_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Failed to fetch project:", error);
        throw new Error("Failed to fetch project");
      }

      // Prepare canvas JSON for the editor
      let canvasJson;

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
  });

  return query;
};
