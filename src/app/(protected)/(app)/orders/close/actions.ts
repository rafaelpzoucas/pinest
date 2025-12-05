"use server";

import { stringToNumber } from "@/lib/utils";
import { adminProcedure, cashProcedure } from "@/lib/zsa-procedures";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { closeSaleSchema, createPaymentSchema } from "./schemas";

export const readPayments = adminProcedure
  .createServerAction()
  .input(
    z.object({
      table_id: z.string().optional(),
      order_id: z.string().optional(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    let query = supabase.from("payments").select("*");

    if (input.table_id) {
      query = query.eq("table_id", input.table_id);
    }

    if (input.order_id) {
      query = query.eq("order_id", input.order_id);
    }

    const { data: payments, error } = await query;

    if (error || !payments) {
      console.error("Error reading payments", error);
      return;
    }

    return { payments };
  });

export const readPaymentsCached = cache(readPayments);

export const createPayment = cashProcedure
  .createServerAction()
  .input(createPaymentSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, cashSession } = ctx;

    const customerId = input.customer_id;
    const amount = stringToNumber(input.amount);
    const discount = stringToNumber(input.discount);

    const { data: createdPayment, error } = await supabase
      .from("payments")
      .insert({
        ...input,
        amount,
        discount,
        status: input.payment_type === "DEFERRED" ? "pending" : input.status,
        store_id: store.id,
        cash_session_id: cashSession.id,
        description: "Venda",
      })
      .select();

    if (error) {
      console.error("Error creating payment transaction.", error);
      return;
    }

    const { data: customerToUpdate, error: customerToUpdateError } =
      await supabase
        .from("store_customers")
        .select("*")
        .eq("id", customerId)
        .single();

    if (customerToUpdateError) {
      console.error(
        "Error fetching customer for balance update.",
        customerToUpdateError,
      );
      return;
    }

    if (customerId) {
      const { error: updateCustomerBalance } = await supabase
        .from("store_customers")
        .update({ balance: customerToUpdate?.balance - amount })
        .eq("id", customerId);

      if (updateCustomerBalance) {
        console.error(
          "Error updating customer balance.",
          updateCustomerBalance,
        );
        return;
      }
    }

    if (input.items && input.items.length > 0) {
      const itemIds = input.items.map((item) => item.id);
      const { error: updateItemsError } = await supabase
        .from("order_items")
        .update({ is_paid: true })
        .in("id", itemIds);
      if (updateItemsError) {
        console.error("Error updating order item status.", updateItemsError);
      }
    }

    revalidatePath("/orders/close");

    return { createdPayment };
  });

export const closeBills = cashProcedure
  .createServerAction()
  .input(closeSaleSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, cashSession } = ctx;

    if (input.table_id) {
      const { data: createdPayment, error } = await supabase
        .from("tables")
        .update({ status: "closed", cash_session_id: cashSession.id })
        .eq("id", input.table_id);

      if (error || !createdPayment) {
        console.error("Error closing table bills.", error);
        return;
      }
    }

    if (input.order_id) {
      const { data: createdPayment, error } = await supabase
        .from("orders")
        .update({
          is_paid: true,
          cash_session_id: cashSession.id,
        })
        .eq("id", input.order_id)
        .select();

      if (error || !createdPayment) {
        console.error("Error closing order bills.", error);
      }
    }

    revalidatePath("/orders");
  });
