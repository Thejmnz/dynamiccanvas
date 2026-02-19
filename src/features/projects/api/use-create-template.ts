import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  return mutation;
};
