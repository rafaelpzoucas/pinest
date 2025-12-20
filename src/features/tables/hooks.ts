"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readOpenTables } from "./read-open";
import { cancelTable } from "./cancel";
import { createTable } from "./create";
import { updateTable } from "./update";
import { toast } from "sonner";
import { Table, createTableSchema } from "./schemas";
import type { z } from "zod";

type CreateTableInput = z.infer<typeof createTableSchema>;
type UpdateTableInput = CreateTableInput & { id: string; is_edit: boolean };

export const tablesKeys = {
  all: ["tables"] as const,
  open: ["tables", "open"] as const,
};

export const useReadOpenTables = () => {
  return useQuery({
    queryKey: tablesKeys.open,
    queryFn: async () => {
      const [data, error] = await readOpenTables();
      if (error) {
        throw error;
      }
      return (data?.openTables as Table[]) || [];
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
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
      queryClient.invalidateQueries({ queryKey: tablesKeys.all, exact: false });
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
  return useMutation({
    mutationFn: async (input: CreateTableInput) => {
      // O redirect() vai lançar uma exceção especial do Next.js
      // que não é um erro real, então não precisa de try-catch
      await createTable(input);
    },
    onSuccess: () => {
      // O toast não vai aparecer porque o redirect acontece antes
      // Mas deixamos aqui caso o comportamento mude no futuro
      toast.success("Mesa criada com sucesso");
      options?.onSuccess?.();
    },
    onError: (error) => {
      // Só chega aqui se for um erro real (não o redirect)
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
  return useMutation({
    mutationFn: async (input: UpdateTableInput) => {
      // O redirect() vai lançar uma exceção especial do Next.js
      // que não é um erro real, então não precisa de try-catch
      await updateTable(input);
    },
    onSuccess: () => {
      // O toast não vai aparecer porque o redirect acontece antes
      // Mas deixamos aqui caso o comportamento mude no futuro
      toast.success("Mesa atualizada com sucesso");
      options?.onSuccess?.();
    },
    onError: (error) => {
      // Só chega aqui se for um erro real (não o redirect)
      toast.error(error.message || "Erro ao atualizar mesa");
      options?.onError?.(error);
    },
  });
};
