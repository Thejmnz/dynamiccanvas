import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["project", { id }],
    mutationFn: async (json: any) => {

      const updates: any = {
        lastModified: new Date().toISOString(),
      };

      if (json.name) updates.name = json.name;
      if (json.width) updates.width = json.width;
      if (json.height) updates.height = json.height;

      // Map 'json' (Fabric string) to 'elements' (Supabase JSONB)
      if (json.json) {
        try {
          const parsed = JSON.parse(json.json);
          updates.elements = parsed.objects || [];
        } catch (e) {
          console.error("Failed to parse canvas json", e);
        }
      }

      // Update project first
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update project");
      }

      // Generate and save thumbnail asynchronously (don't await)
      generateAndSaveThumbnail(id).catch(err => {
        console.error("Thumbnail generation failed (non-critical):", err);
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
    },
    onError: () => {
      toast.error("Failed to update project");
    }
  });

  return mutation;
};

async function generateAndSaveThumbnail(templateId: string) {
  try {
    console.log('🎨 Starting thumbnail generation for:', templateId);

    // Get user and API key
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('✅ User found:', user.id);

    const { data: apiKeyData } = await supabase
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .single();

    if (!apiKeyData?.api_key) {
      console.log('❌ No API key found');
      return;
    }

    console.log('✅ API key found');

    // Generate thumbnail using render API
    const response = await fetch('/api/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyData.api_key}`,
      },
      body: JSON.stringify({
        templateId,
        format: 'png',
      }),
    });

    if (!response.ok) {
      console.log('❌ Render API failed:', response.status, await response.text());
      return;
    }

    console.log('✅ Thumbnail generated');

    // Get the response JSON which contains the imageUrl
    const result = await response.json();
    console.log('✅ API response:', result);

    if (!result.imageUrl) {
      console.log('❌ No imageUrl in response');
      return;
    }

    const publicUrl = result.imageUrl;
    console.log('✅ Image URL:', publicUrl);

    // Update template with thumbnail URL
    const { error: updateError } = await supabase
      .from('templates')
      .update({ thumbnail_url: publicUrl })
      .eq('id', templateId);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      return;
    }

    console.log('🎉 Thumbnail saved successfully!');

  } catch (error) {
    console.error("❌ Thumbnail generation error:", error);
  }
}
