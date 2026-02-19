import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";

export type ResponseType = InferResponseType<typeof client.api.templates.$get, 200>;
type RequestType = InferRequestType<typeof client.api.templates.$get>["query"];

export const useGetTemplates = (apiQuery: RequestType) => {
  const query = useQuery({
    queryKey: [
      "templates",
      {
        page: apiQuery.page,
        limit: apiQuery.limit,
        category: apiQuery.category,
      },
    ],
    queryFn: async () => {
      try {
        const response = await client.api.templates.$get({
          query: apiQuery,
        });

        if (!response.ok) {
          console.error("Templates API error:", response.status);
          // Devolver array vacío en caso de error
          return [];
        }

        const { data } = await response.json();
        return data;
      } catch (error) {
        console.error("Templates fetch error:", error);
        // Devolver array vacío en caso de cualquier error
        return [];
      }
    },
    staleTime: 0, // No guardar cache - siempre refrescar
    gcTime: 0, // Limpiar cache inmediatamente
  });

  return query;
};
