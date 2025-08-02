import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If we get a 401, treat as not authenticated but not loading
  const isUnauthorized = error?.message?.includes('401');
  
  return {
    user: isUnauthorized ? null : user,
    isLoading: isLoading && !isUnauthorized,
    isAuthenticated: !!user && !isUnauthorized,
  };
}
