import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const USER_UPLOADS_QUERY_KEY = "user-uploads";

export interface UserImage {
  id: string;
  name: string;
  path: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
  };
  user: {
    name: string;
  };
  alt_description: string;
}

export const useGetImages = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const query = useQuery({
    queryKey: [USER_UPLOADS_QUERY_KEY, userId],
    queryFn: async (): Promise<UserImage[]> => {
      const response = await fetch("/api/user-uploads", { cache: "no-store" });
      const body = await response.json() as {
        data?: Array<{ id: string; name: string; path: string; url: string }>;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || "Failed to fetch images");

      return (body.data ?? []).map((file): UserImage => {
        return {
          id: file.id,
          name: file.name,
          path: file.path,
          urls: {
            regular: file.url,
            small: file.url,
            thumb: file.url,
          },
          links: {
            html: file.url,
          },
          user: {
            name: "Uploaded",
          },
          alt_description: file.name,
        };
      });
    },
    enabled: status !== "loading" && Boolean(userId),
  });

  return query;
};
