// features/printer/profiles/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import {
  getAllPrinterProfilesAction,
  getBuiltInProfilesAction,
  getCustomProfilesAction,
  getPrinterProfileByIdAction,
} from "./read";
import { createPrinterProfileAction } from "./create";
import { deletePrinterProfileAction } from "./delete";
import { updatePrinterProfileAction } from "./update";

// Query Keys
export const printerProfilesKeys = {
  all: ["printer-profiles"] as const,
  lists: () => [...printerProfilesKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...printerProfilesKeys.lists(), { filters }] as const,
  details: () => [...printerProfilesKeys.all, "detail"] as const,
  detail: (id: string) => [...printerProfilesKeys.details(), id] as const,
  builtIn: () => [...printerProfilesKeys.all, "built-in"] as const,
  custom: () => [...printerProfilesKeys.all, "custom"] as const,
};

// Read Hooks
export function useAllPrinterProfiles() {
  return useQuery({
    queryKey: printerProfilesKeys.list(),
    queryFn: async () => {
      const [data, error] = await getAllPrinterProfilesAction();
      if (error) throw error;
      return data;
    },
  });
}

export function usePrinterProfile(id: string) {
  return useQuery({
    queryKey: printerProfilesKeys.detail(id),
    queryFn: async () => {
      const [data, error] = await getPrinterProfileByIdAction({ id });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useBuiltInProfiles() {
  return useQuery({
    queryKey: printerProfilesKeys.builtIn(),
    queryFn: async () => {
      const [data, error] = await getBuiltInProfilesAction();
      if (error) throw error;
      return data;
    },
  });
}

export function useCustomProfiles() {
  return useQuery({
    queryKey: printerProfilesKeys.custom(),
    queryFn: async () => {
      const [data, error] = await getCustomProfilesAction();
      if (error) throw error;
      return data;
    },
  });
}

// Create Hook
export function useCreatePrinterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Parameters<typeof createPrinterProfileAction>[0],
    ) => {
      const [data, error] = await createPrinterProfileAction(input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerProfilesKeys.all });
      toast.success("Perfil de impressora criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar perfil de impressora");
    },
  });
}

// Update Hook
export function useUpdatePrinterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Parameters<typeof updatePrinterProfileAction>[0],
    ) => {
      const [data, error] = await updatePrinterProfileAction(input);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: printerProfilesKeys.all });
      queryClient.invalidateQueries({
        queryKey: printerProfilesKeys.detail(data.id),
      });
      toast.success("Perfil de impressora atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar perfil de impressora");
    },
  });
}

// Delete Hook
export function useDeletePrinterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Parameters<typeof deletePrinterProfileAction>[0],
    ) => {
      const [data, error] = await deletePrinterProfileAction(input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerProfilesKeys.all });
      toast.success("Perfil de impressora deletado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao deletar perfil de impressora");
    },
  });
}
