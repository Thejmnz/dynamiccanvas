import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface UserImage {
  id: string;
  name: string;
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
  const query = useQuery({
    queryKey: ["images"],
    queryFn: async (): Promise<UserImage[]> => {
      const { data, error } = await supabase
        .storage
        .from('media')
        .list('uploads', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw new Error("Failed to fetch images");
      }

      const images = (data ?? []).map((file): UserImage => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('media')
          .getPublicUrl(`uploads/${file.name}`);

        return {
          id: file.id ?? file.name,
          name: file.name,
          urls: {
            regular: publicUrl,
            small: publicUrl,
            thumb: publicUrl
          },
          links: {
            html: publicUrl
          },
          user: {
            name: "Uploaded"
          },
          alt_description: file.name
        };
      });

      return images;
    },
  });

  return query;
};
