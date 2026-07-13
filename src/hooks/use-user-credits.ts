import { useQuery } from "@tanstack/react-query";

export interface UserCreditsData {
  plan: string;
  creditsBalance: number;
  creditsPerMonth: number;
  totalCredits: number;
  usedCredits: number;
  templateCount: number;
  templateLimit: number;
}

export const useUserCredits = (enabled = true) =>
  useQuery({
    queryKey: ["user-credits"],
    queryFn: async () => {
      const response = await fetch("/api/user-credits");
      if (!response.ok) throw new Error("Failed to load user credits");
      return response.json() as Promise<UserCreditsData>;
    },
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
