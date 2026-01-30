"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AdminCustomerType } from "@/models/store-customer";
import { useState, useEffect } from "react";
import { readAdminCustomers } from "./read";
import { createAdminCustomer } from "./create";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const customersKeys = {
  all: ["admin", "customers"] as const,
  lists: () => [...customersKeys.all, "list"] as const,
  list: (storeId: string, search?: string) =>
    [...customersKeys.lists(), { storeId, search }] as const,
  details: () => [...customersKeys.all, "detail"] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
};

// ============================================================================
// HOOK: BUSCA DE CLIENTES COM DEBOUNCE
// ============================================================================

/**
 * Hook para busca de clientes com debounce usando React Query + Server Action
 *
 * @param storeId - ID da loja
 * @param enabled - Se a busca está habilitada
 * @param initialSearchTerm - Termo de busca inicial (ex: phoneQuery)
 */
export function useCustomersSearch(
  storeId: string,
  enabled: boolean = true,
  initialSearchTerm: string = "",
) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(initialSearchTerm);

  // Debounce do termo de busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query que chama diretamente a server action
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: customersKeys.list(storeId, debouncedSearchTerm),
    queryFn: async () => {
      const [result, err] = await readAdminCustomers({
        storeId,
        search: debouncedSearchTerm || undefined,
      });

      if (err) {
        throw err;
      }

      return result.customers as AdminCustomerType[];
    },
    enabled: enabled && !!storeId && debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    retry: 1,
  });

  return {
    customers: data ?? [],
    isLoading: isLoading || isFetching,
    error,
    searchTerm,
    setSearchTerm,
    hasSearchTerm: debouncedSearchTerm.length >= 2,
  };
}

// ============================================================================
// HOOK: CRIAR CLIENTE
// ============================================================================

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Parameters<typeof createAdminCustomer>[0]) => {
      const [result, error] = await createAdminCustomer(values);

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      // Invalidar todas as listas de clientes
      queryClient.invalidateQueries({
        queryKey: customersKeys.lists(),
      });

      return data;
    },
    retry: false,
  });
}

// ============================================================================
// HOOK: LISTAR TODOS OS CLIENTES (SEM BUSCA)
// ============================================================================

/**
 * Hook para listar todos os clientes de uma loja (use apenas quando necessário)
 * Para busca, use useCustomersSearch
 */
export function useCustomers(storeId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: customersKeys.list(storeId),
    queryFn: async () => {
      const [result, error] = await readAdminCustomers({
        storeId,
      });

      if (error) {
        throw error;
      }

      return result.customers as AdminCustomerType[];
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}
