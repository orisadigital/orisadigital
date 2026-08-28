import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Long enough that moving between admin pages and back is instant, short
// enough that a list left open corrects itself within a working session.
const STALE_TIME = 5 * 60 * 1000;

/**
 * Cached read of an entity list.
 *
 * `setData` deliberately mirrors a useState setter, so the create/update/delete
 * handlers that already do setX(prev => ...) keep working unchanged — they now
 * write to the query cache instead of component state, which is what makes the
 * data survive navigating away and back.
 */
export function useEntityList(entity, sort) {
  const queryClient = useQueryClient();
  const queryKey = ["entity", entity, sort ?? null];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => base44.entities[entity].list(sort),
    staleTime: STALE_TIME,
  });

  const setData = useCallback(
    (updater) =>
      queryClient.setQueryData(queryKey, (prev) =>
        typeof updater === "function" ? updater(prev ?? []) : updater
      ),
    // queryKey is derived from these two, so listing them is equivalent
    [queryClient, entity, sort]
  );

  return {
    data: data ?? [],
    setData,
    isLoading,
    loadError: error ? error.message || "Unknown error" : null,
    refetch,
  };
}
