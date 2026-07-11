import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/use-user-role";
import { useRouter } from "next/navigation";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserRole();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (json: any) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to create a project");
      }

      const projectData = {
        name: json.name || "Untitled Project",
        width: json.width || 800,
        height: json.height || 600,
        json: json.json || JSON.stringify({ version: "2.0", objects: [] }),
      };

      const response = await fetch("/api/template-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create template");
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
