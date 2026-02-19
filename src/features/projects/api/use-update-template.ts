import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useUpdateTemplate = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", { id }] });
    },
  });

  return mutation;
};
