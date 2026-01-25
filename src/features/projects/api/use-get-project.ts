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
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Failed to fetch project:", error);
        throw new Error("Failed to fetch project");
      }

      // Prepare canvas JSON for the editor
      let canvasJson;

      if (!data.elements || data.elements.length === 0) {
        // Create initial workspace for new/empty projects
        canvasJson = JSON.stringify({
          version: "5.3.0",
          objects: [
            {
              type: "rect",
              version: "5.3.0",
              name: "clip",
              left: 0,
              top: 0,
              width: data.width || 900,
              height: data.height || 1200,
              fill: data.backgroundColor || "#ffffff",
              stroke: null,
              strokeWidth: 0,
              selectable: false,
              evented: false,
            }
          ]
        });
      } else {
        // Use existing elements
        canvasJson = JSON.stringify({
          version: "5.3.0",
          objects: data.elements
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
