"use server";

import { createClient } from "@/lib/supabase/server";
import { adminProcedure } from "@/lib/zsa-procedures";
import { OrderType } from "@/models/order";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { getValidIfoodAccessToken } from "../../../config/integrations/ifood/actions";

export const verifyIsIfood = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;
    const { orderId } = input;

    const { data: order, error: readOrderError } = await supabase
      .from("orders")
      .select("is_ifood")
      .eq("id", orderId)
      .single();

    if (readOrderError || !order) {
      console.error("Erro ao buscar o pedido", readOrderError);
      return;
    }

    return order.is_ifood;
  });

export const readOrderById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;
    const { data: order, error: readOrderError } = await supabase
      .from("orders")
      .select(
        `
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            ),
            order_item_variations (
              *,
              product_variations (*)
            )
          ),
          store_customers (
            *,
            customers (*)
          )
        `,
      )
      .eq("id", input.id)
      .single();

    if (readOrderError) {
      console.error("Error reading order.", readOrderError);
      return;
    }

    return { order: order as OrderType };
  });

export const readOrderByIdCached = cache(readOrderById);

export const acceptOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;
    const { orderId } = input;

    await updateIfoodOrderStatus({ orderId, newStatus: "preparing" });

    const { error: updateStatusError } = await supabase
      .from("orders")
      .update({ status: "preparing" })
      .eq("id", orderId);

    if (updateStatusError) {
      console.error(updateStatusError);
    }

    revalidatePath("/orders");
  });

export const cancelOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { error: updateStatusError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", input.orderId);

    if (updateStatusError) {
      console.error(updateStatusError);
    }

    revalidatePath("/orders");
  });

export const updateOrderPrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    // Update em lote: marca todos os itens do pedido como impressos de uma vez
    const { error } = await supabase
      .from("order_items")
      .update({ printed: true })
      .eq("order_id", input.orderId);

    if (error) {
      console.error("Error updating printed status of order items.", error);
      return;
    }

    revalidatePath("/");
  });

export async function updateDiscount(orderId: string, discount: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({ discount })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao atualizar o desconto: ", error);
  }

  revalidatePath("/orders");
}

export const updateOrderStatus = adminProcedure
  .createServerAction()
  .input(
    z.object({
      newStatus: z.string(),
      orderId: z.string(),
      isIfood: z.boolean(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { error: updateStatusError } = await supabase
      .from("orders")
      .update({ status: input.newStatus })
      .eq("id", input.orderId);

    if (updateStatusError) {
      console.error("Erro ao atualizar o status.", updateStatusError);
    }

    revalidatePath("/orders");

    if (!input.isIfood) return null;
    await updateIfoodOrderStatus({
      orderId: input.orderId,
      newStatus: input.newStatus,
    });
  });

export const updateIfoodOrderStatus = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), newStatus: z.string() }))
  .handler(async ({ input }) => {
    const { orderId, newStatus } = input;

    console.log(
      `[UPDATE-IFOOD-STATUS] Iniciando para orderId: ${orderId}, status: ${newStatus}`,
    );

    const isIfood = await verifyIsIfood({ orderId });

    // Verifica se o pedido é do iFood
    if (!isIfood) {
      console.log(
        `[UPDATE-IFOOD-STATUS] Pedido ${orderId} não é do iFood, pulando atualização`,
      );
      return;
    }

    const [accessTokenData] = await getValidIfoodAccessToken();

    if (!accessTokenData?.success) {
      console.error(
        "[UPDATE-IFOOD-STATUS] Erro ao buscar access_token no banco.",
        accessTokenData?.message,
      );
      throw new Error("Falha ao obter token de acesso do iFood");
    }

    console.log(`[UPDATE-IFOOD-STATUS] Token obtido, chamando route handler`);

    try {
      // Usa a route handler dedicada em vez de fetch direto
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/ifood/update-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            newStatus,
            accessToken: accessTokenData.accessToken,
          }),
        },
      );

      console.log(`[UPDATE-IFOOD-STATUS] Resposta recebida:`, {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "[UPDATE-IFOOD-STATUS] Erro na route handler:",
          errorData,
        );
        throw new Error(
          `Erro ao atualizar status no iFood: ${errorData.error || response.statusText}`,
        );
      }

      const data = await response.json();
      console.log(`[UPDATE-IFOOD-STATUS] Status atualizado com sucesso:`, data);

      return data;
    } catch (error) {
      console.error("[UPDATE-IFOOD-STATUS] Erro ao chamar route handler:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
