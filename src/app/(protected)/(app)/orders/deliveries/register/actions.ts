"use server";

import { stringToNumber } from "@/lib/utils";
import { adminProcedure } from "@/lib/zsa-procedures";
import { redirect } from "next/navigation";
import {
  printOrderReceipt,
  readPrintingSettings,
} from "../../../config/printing/actions";
import { createOrderFormSchema, updateOrderFormSchema } from "./schemas";

import { StoreType } from "@/models/store";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getNextDisplayId = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx;

    const { data, error } = await supabase.rpc("get_next_display_id", {
      input_store_id: store?.id,
    });

    if (error || typeof data !== "number") {
      throw new Error(error?.message || "Erro ao gerar display_id");
    }

    return data;
  });

export const createOrder = adminProcedure
  .createServerAction()
  .input(createOrderFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx;

    try {
      // 1. Monte total e itens **antes** de tocar no DB
      const total = {
        subtotal: input.total.subtotal,
        total_amount: input.total.total_amount,
        shipping_price:
          input.type !== "TAKEOUT" ? input.total.shipping_price : 0,
        change_value: input.total.change_value
          ? stringToNumber(input.total.change_value)
          : null,
        discount: input.total.discount
          ? stringToNumber(input.total.discount)
          : null,
      };

      const deliveryFee =
        input.type === "DELIVERY"
          ? {
              description: "Taxa de entrega",
              product_id: null,
              quantity: 1,
              product_price: input.total.shipping_price,
              observations: [],
              extras: [],
            }
          : null;

      const items = input.order_items
        .map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price,
          observations: item.observations,
          extras: item.extras,
        }))
        .concat(deliveryFee ? [deliveryFee] : []);

      const [displayId] = await getNextDisplayId();

      // 2. Crie o pedido
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          display_id: displayId,
          customer_id: input.customer_id,
          status: input.status,
          store_id: store.id,
          type: input.type,
          payment_type: input.payment_type,
          observations: input.observations,
          total,
          delivery: {
            time: input.type === "DELIVERY" ? store.delivery_time : null,
            address: input.delivery.address,
          },
        })
        .select("id")
        .single();

      if (orderError || !orderData) {
        console.error("Erro criando order", orderError);
        throw new Error("Erro ao criar pedido");
      }
      const orderId = orderData.id;

      // 3. Dispare em paralelo
      const insertItems = supabase
        .from("order_items")
        .insert(items.map((it) => ({ ...it, order_id: orderId })))
        .select("id,product_id,quantity");

      const readPrintSettings = readPrintingSettings();

      const [{ data: createdItems, error: itemsError }, [printSettingsData]] =
        await Promise.all([insertItems, readPrintSettings]);

      if (itemsError || !createdItems) {
        console.error("Erro inserindo items", itemsError);
        throw new Error("Erro ao inserir itens do pedido");
      }

      // 4. Atualize estoque
      await Promise.all(
        createdItems.map(({ product_id: productId, quantity }) =>
          updateAmountSoldAndStock(productId, quantity),
        ),
      );

      // 5. Se auto_print, AGUARDE a impressão completar antes do redirect
      const autoPrint =
        printSettingsData?.printingSettings?.auto_print ?? false;
      if (autoPrint) {
        try {
          await printOrderReceipt({
            orderId,
            orderType: input.type,
            reprint: false,
          });
        } catch (err) {
          console.error("Erro ao gerar impressão automática:", err);
          // Continua mesmo com erro na impressão
        }
      }

      // 6. Redirect final - só executa se não houver erro
      redirect("/orders?tab=deliveries");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw error; // Re-lança o erro para o React Query capturar
    }
  });

export const updateOrder = adminProcedure
  .createServerAction()
  .input(updateOrderFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx;

    try {
      // 1. Monte total e itens
      const total = {
        subtotal: input.total.subtotal,
        total_amount: input.total.total_amount,
        shipping_price:
          input.type !== "TAKEOUT" ? input.total.shipping_price : 0,
        change_value: input.total.change_value
          ? stringToNumber(input.total.change_value)
          : 0,
        discount: input.total.discount
          ? stringToNumber(input.total.discount)
          : 0,
      };

      const alreadyHasDeliveryFee = input.order_items.some(
        (item) =>
          !item.product_id &&
          item.product_price === input.total.shipping_price &&
          (!item.extras || item.extras.length === 0),
      );

      const deliveryFee =
        input.type === "DELIVERY" && !alreadyHasDeliveryFee
          ? {
              product_id: null,
              quantity: 1,
              product_price: input.total.shipping_price,
              observations: [],
              extras: [],
            }
          : null;

      const itemsPayload = input.order_items
        .map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price,
          observations: item.observations,
          extras: item.extras,
        }))
        .concat(deliveryFee ? [deliveryFee] : []);

      // 2. Delete e update
      const { error: deleteErr } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", input.id);

      if (deleteErr) {
        console.error("Erro ao deletar itens:", deleteErr);
        throw new Error("Erro ao deletar itens do pedido");
      }

      const { data: updated, error: updateErr } = await supabase
        .from("orders")
        .update({
          store_id: store.id,
          type: input.type,
          payment_type: input.payment_type,
          observations: input.observations,
          total,
          delivery: {
            time: input.type === "DELIVERY" ? store.delivery_time : null,
            address: input.delivery.address,
          },
        })
        .eq("id", input.id)
        .select("id")
        .single();

      if (updateErr || !updated) {
        console.error("Erro ao atualizar order:", updateErr);
        throw new Error("Erro ao atualizar pedido");
      }
      const orderId = updated.id;

      // 3. Dispare em paralelo
      const insertItems = supabase
        .from("order_items")
        .insert(itemsPayload.map((it) => ({ ...it, order_id: orderId })))
        .select("product_id,quantity");

      const readSettings = readPrintingSettings();

      const [{ data: newItems, error: itemsErr }, [settingsData]] =
        await Promise.all([insertItems, readSettings]);

      if (itemsErr || !newItems) {
        console.error("Erro ao inserir novos itens:", itemsErr);
        throw new Error("Erro ao inserir novos itens do pedido");
      }

      // 4. Atualize estoque
      await Promise.all(
        newItems.map(({ product_id: productId, quantity }) =>
          updateAmountSoldAndStock(productId, quantity),
        ),
      );

      // 5. Se auto_print, AGUARDE a impressão completar antes do redirect
      const autoPrint = settingsData?.printingSettings?.auto_print ?? false;
      if (autoPrint) {
        try {
          await printOrderReceipt({
            orderId,
            orderType: input.type,
            reprint: true,
          });
        } catch (err) {
          console.error("Erro ao gerar impressão automática:", err);
          // Continua mesmo com erro na impressão
        }
      }

      // 6. Redirect final - só executa se não houver erro
      redirect("/orders?tab=deliveries");
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      throw error; // Re-lança o erro para o React Query capturar
    }
  });

export const readStoreData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx;

    return {
      store: store as StoreType,
    };
  });

export async function updateAmountSoldAndStock(
  productId: string,
  quantityDiff: number,
) {
  const supabase = createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, amount_sold, stock")
    .eq("id", productId)
    .single();

  if (productError) {
    console.error("Erro ao buscar produto", productError);
    return;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      amount_sold: (product?.amount_sold ?? 0) + quantityDiff,
      stock:
        product?.stock !== null ? product.stock - quantityDiff : product.stock,
    })
    .eq("id", productId);

  if (updateError) {
    console.error(
      `Erro ao atualizar produto ${product?.id} - ${product?.name}`,
      updateError,
    );
  }
}

export const readStoreDataCached = cache(readStoreData);
