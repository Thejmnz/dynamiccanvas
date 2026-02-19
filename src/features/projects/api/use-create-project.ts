import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (json: any) => {
      if (!user) {
        throw new Error("You must be logged in to create a project");
      }

      // Prepare data for Supabase 'templates' table
      // Note: 'json' contains the FabricJS object. We map it to 'elements' or store it as is.
      // Assuming 'templates' table has columns: user_id, name, width, height, elements (jsonb)

      const projectData = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: json.name || "Untitled Project",
        width: json.width || 800,
        height: json.height || 600,
        elements: json.json ? JSON.parse(json.json) : [],
        json: json.json || JSON.stringify({ version: "2.0", objects: [] }),
        backgroundColor: "#ffffff",
        preset: "", // Required field - empty string for custom projects
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPro: false
      };

      // Handle case where json.json is already an object or string
      if (typeof json.json === 'object') {
        projectData.elements = json.json;
      }

      const { data, error } = await supabase
        .from('dynamic_canvas_templates')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Redirect to editor if we have an ID, otherwise go to dashboard
      if (data && data.id) {
        router.push(`/editor/${data.id}`);
      } else {
        router.push("/"); // Go to dashboard to see the new project
      }
    },
    onError: (error) => {
      console.error("Create project error:", error);
      toast.error(
        "Failed to create project: " + (error as Error).message
      );
    },
  });

  return mutation;
};
