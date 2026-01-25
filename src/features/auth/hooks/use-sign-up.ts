import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.users["$post"]>;
type RequestType = InferRequestType<typeof client.api.users["$post"]>["json"];

export const useSignUp = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.users.$post({ json });

      if (!response.ok) {
        let errorMessage = "Something went wrong";
        try {
          const data = await response.json() as { error?: string };
          if (data?.error) {
            errorMessage = data.error;
          }
        } catch (e) {
          // Ignore JSON parse error, use default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("User created");
    }
  });

  return mutation;
};
