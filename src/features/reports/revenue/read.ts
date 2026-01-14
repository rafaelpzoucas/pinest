"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { z } from "zod";

export const readRevenue = adminProcedure
  .createServerAction()
  .input(
    z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { supabase, store } = ctx;

    const { data, error } = await supabase
      .from("monthly_revenue")
      .select(
        "month, revenue, expenses, net_revenue, total_transactions, avg_transaction",
      )
      .eq("store_id", store.id)
      .gte("month", input.from)
      .lte("month", input.to)
      .order("month", { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar dados de faturamento: ${error.message}`);
    }

    // Formatar os dados para o formato esperado pelo componente
    return data.map((row) => ({
      month: new Date(row.month).toLocaleDateString("pt-BR", {
        month: "long",
        year: data.length > 12 ? "numeric" : undefined,
      }),
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0,
      netRevenue: Number(row.net_revenue) || 0,
      totalTransactions: row.total_transactions || 0,
      avgTransaction: Number(row.avg_transaction) || 0,
    }));
  });
