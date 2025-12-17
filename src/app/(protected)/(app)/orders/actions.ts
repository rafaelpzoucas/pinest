"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { ObservationType } from "@/models/observation";
import { cache } from "react";
import { z } from "zod";

export const insertObservation = adminProcedure
  .createServerAction()
  .input(z.object({ observation: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx;

    const { data, error: selectError } = await supabase
      .from("observations")
      .select("id")
      .eq("store_id", store.id)
      .eq("observation", input.observation.toLowerCase())
      .single();

    if (selectError && selectError.code !== "PGRST100") {
      console.error("Erro ao verificar duplicação da observação:", selectError);
    }

    if (data) {
      console.log("Observação já existe:", input.observation);
      return;
    }

    const { error } = await supabase
      .from("observations")
      .insert([
        { store_id: store.id, observation: input.observation.toLowerCase() },
      ]);

    if (error) {
      console.error("Erro ao salvar a observação:", error);
    }
  });

export const readObservations = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx;

    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("store_id", store.id);

    if (error) {
      console.error("Erro ao buscar observações", error);
      return;
    }

    return { observations: data as ObservationType[] };
  });

export const readObservationsCached = cache(readObservations);
