import { useQuery } from "@tanstack/react-query";
import { readStoreBySlug, readStoreIdBySlug } from "./read";
import { readStoreCustomer } from "./read-customer";
import type { ReadStoreCustomer } from "./schemas";

interface UseReadStoreParams {
  storeSlug: string;
}

export function useReadStore({ storeSlug }: UseReadStoreParams) {
  return useQuery({
    queryKey: ["store", storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error("storeSlug are required");
      }

      const [data, error] = await readStoreBySlug({
        storeSlug,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  });
}

export function useReadStoreId({ storeSlug }: UseReadStoreParams) {
  return useQuery({
    queryKey: ["store-id", storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error("storeSlug are required");
      }

      const [data, error] = await readStoreIdBySlug({
        storeSlug,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  });
}

export function useReadStoreCustomer({
  storeId,
  customerId,
}: ReadStoreCustomer) {
  return useQuery({
    queryKey: ["store-customer", storeId, customerId],
    queryFn: async () => {
      // ZSA retorna [data, error]
      const [data, error] = await readStoreCustomer({
        customerId,
        storeId,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!storeId && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
