import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data: source, error: sourceError } = await supabase
        .from("dynamic_canvas_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (sourceError || !source) throw sourceError || new Error("Template not found");

      const now = new Date().toISOString();
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        lastModified: _lastModified,
        ...copy
      } = source;

      const { data, error } = await supabase
        .from("dynamic_canvas_templates")
        .insert({
          ...copy,
          name: `${source.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          lastModified: now,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Template duplicated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to duplicate project");
    }
  });

  return mutation;
};
