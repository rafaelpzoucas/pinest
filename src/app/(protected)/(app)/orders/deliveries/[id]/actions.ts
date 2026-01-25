"use server";

import { createClient } from "@/lib/supabase/server";
import { adminProcedure } from "@/lib/zsa-procedures";
import { OrderType } from "@/models/order";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { getValidIfoodAccessToken } from "../../../config/integrations/ifood/actions";
import { ZSAError } from "zsa";

function logError(scope: string, error: unknown, extra?: unknown) {
  console.error(`[${scope}]`, error, extra);
}

async function verifyIsIfood({ orderId }: { orderId: string }) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("is_ifood")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    logError("verifyIsIfood", error ?? "Pedido não encontrado");
    return null;
  }

  return order.is_ifood;
}

export const readOrderById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: order, error } = await supabase
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

    if (error || !order) {
      logError("readOrderById", error ?? "Pedido não encontrado");
      return null;
    }

    return { order: order as OrderType };
  });

export const readOrderByIdCached = cache(readOrderById);

export const acceptOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const isIfood = await verifyIsIfood({ orderId: input.orderId });

    if (isIfood) {
      console.log("NAO É AIFODE CARALHO", isIfood);
      await updateIfoodOrderStatus({
        orderId: input.orderId,
        newStatus: "accept",
      });

      return;
    }

    const { supabase } = ctx;

    const { error } = await supabase
      .from("orders")
      .update({ status: "preparing" })
      .eq("id", input.orderId);

    if (error) {
      logError("acceptOrder:update", error);
      throw new ZSAError("ERROR", error.message);
    }
  });

export const cancelOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", input.orderId);

    if (error) {
      logError("cancelOrder", error);
    }

    revalidatePath("/orders");
  });

export const updateOrderPrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from("order_items")
      .update({ printed: true })
      .eq("order_id", input.orderId);

    if (error) {
      logError("updateOrderPrintedItems", error);
      return null;
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
    logError("updateDiscount", error);
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
    const isIfood = await verifyIsIfood({ orderId: input.orderId });

    if (!isIfood) {
      const { supabase } = ctx;

      const { error } = await supabase
        .from("orders")
        .update({ status: input.newStatus })
        .eq("id", input.orderId);

      if (error) {
        logError("updateOrderStatus", error);
      }
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

    const isIfood = await verifyIsIfood({ orderId });

    if (!isIfood) return null;

    const [accessTokenData] = await getValidIfoodAccessToken();

    if (!accessTokenData?.success) {
      logError(
        "updateIfoodOrderStatus:token",
        accessTokenData?.message ?? "Token inválido",
      );
      throw new Error("Falha ao obter token de acesso do iFood");
    }

    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        logError("updateIfoodOrderStatus:route", {
          status: response.status,
          error: errorData,
        });

        throw new Error(
          `Erro ao atualizar status no iFood (${response.status})`,
        );
      }

      return response.json();
    } catch (error) {
      logError("updateIfoodOrderStatus:fetch", error);
      throw error;
    }
  });
