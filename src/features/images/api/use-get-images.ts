import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useGetImages = () => {
  const query = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .storage
        .from('media') // Bucket
        .list('uploads', { // Folder
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw new Error("Failed to fetch images");
      }

      // Generate public URLs
      const images = data.map((file) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('media')
          .getPublicUrl(`uploads/${file.name}`);

        return {
          id: file.id,
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
            name: "Uploaded" // Placeholder
          },
          alt_description: file.name
        };
      });

      return images;
    },
  });

  return query;
};
