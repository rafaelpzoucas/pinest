"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "zsa";
import { createClient } from "@/lib/supabase/server";
import { stringToNumber } from "@/lib/utils";
import { newChoiceFormSchema } from "./schemas";

export const createChoice = createServerAction()
  .input(newChoiceFormSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { choice, choice_price } = input;

    // Pegar store_id do usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Assumindo que você tem uma forma de pegar o store_id
    // Ajuste conforme sua estrutura
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store?.id) {
      throw new Error("Loja não encontrada");
    }

    const { data: createdChoice, error } = await supabase
      .from("product_choices")
      .insert({
        ...choice,
        store_id: store.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar escolha:", error);
      return { error };
    }

    const { error: priceError } = await supabase
      .from("product_choice_prices")
      .insert({
        ...choice_price,
        price: stringToNumber(choice_price.price),
        choice_id: createdChoice.id,
      })
      .select()
      .single();

    if (priceError) {
      throw new Error("Erro ao criar preço: ", priceError);
    }

    revalidatePath("/dashboard/choices");
    return { createdChoice };
  });

export const updateChoice = createServerAction()
  .input(
    z.object({
      choiceId: z.string().uuid(),
      priceId: z.string().uuid(),
      data: newChoiceFormSchema,
    }),
  )
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("product_choices")
      .update(input.data.choice)
      .eq("id", input.choiceId);

    if (error) {
      console.error("Erro ao atualizar escolha:", error);
      return { error };
    }

    const { error: updatePriceError } = await supabase
      .from("product_choice_prices")
      .update({
        ...input.data.choice_price,
        price: stringToNumber(input.data.choice_price.price),
      })
      .eq("id", input.priceId); // ← usar priceId aqui

    if (updatePriceError) {
      console.error("Erro ao atualizar preço:", updatePriceError);
      return { updatePriceError };
    }

    revalidatePath("/dashboard/choices");
  });

export const deleteChoice = createServerAction()
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("product_choices")
      .delete()
      .eq("id", input.id);

    if (error) {
      console.error("Erro ao deletar escolha:", error);
      return { error };
    }

    revalidatePath("/dashboard/choices");
    return { data: { success: true } };
  });
