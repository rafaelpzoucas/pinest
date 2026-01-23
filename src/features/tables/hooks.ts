"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readOpenTables } from "./read-open";
import { cancelTable } from "./cancel";
import { createTable } from "./create";
import { updateTable } from "./update";
import { toast } from "sonner";
import { Table, createTableSchema } from "./schemas";
import type { z } from "zod";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type CreateTableInput = z.infer<typeof createTableSchema>;
type UpdateTableInput = CreateTableInput & { id: string; is_edit: boolean };

export const tablesKeys = {
  all: ["tables"] as const,
  open: ["tables", "open"] as const,
};

// ✅ Hook otimizado com enabled
export const useReadOpenTables = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: tablesKeys.open,
    queryFn: async () => {
      const [data, error] = await readOpenTables();
      if (error) throw error;
      return (data?.openTables as Table[]) || [];
    },
    enabled: options?.enabled ?? true, // 👈 Aceita enabled como parâmetro
    staleTime: 1000 * 30,
    refetchInterval: options?.enabled ? 1000 * 60 : false, // 👈 Só refaz polling se enabled
  });

  useEffect(() => {
    // ✅ Só conecta realtime se a query estiver habilitada
    if (options?.enabled === false) return;

    const channel = supabase
      .channel("realtime:tables")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "tables",
        },
        () => {
          // Estratégia simples e segura:
          // sempre refetch quando algo mudar
          queryClient.invalidateQueries({
            queryKey: tablesKeys.open,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase, options?.enabled]); // 👈 Adiciona enabled nas dependências

  return query;
};

interface UseCancelTableOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCancelTable = (options?: UseCancelTableOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tableId: string) => {
      const [data, error] = await cancelTable({ tableId });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tablesKeys.open,
        exact: false,
      });
      toast.success("Mesa cancelada com sucesso");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar mesa");
      options?.onError?.(error);
    },
  });
};

interface UseCreateTableOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateTable = (options?: UseCreateTableOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTableInput) => {
      await createTable(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tablesKeys.open,
        exact: false,
      });
      toast.success("Mesa criada com sucesso");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar mesa");
      options?.onError?.(error);
    },
  });
};

interface UseUpdateTableOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useUpdateTable = (options?: UseUpdateTableOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTableInput) => {
      await updateTable(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tablesKeys.open,
        exact: false,
      });
      toast.success("Mesa atualizada com sucesso");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar mesa");
      options?.onError?.(error);
    },
  });
};
