"use server";

import { OrderItem } from "@/features/admin/orders/schemas";
import { Table } from "@/features/tables/schemas";
import { cashProcedure } from "@/lib/zsa-procedures";
import { PaymentType } from "@/models/payment";

function processSalesReport(orders: any[], payments: PaymentType[]) {
  const groupedPaymentTypes = payments.reduce<Record<string, number>>(
    (acc, payment) => {
      if (payment.type !== "INCOME") return acc;
      acc[payment.payment_type] =
        (acc[payment.payment_type] || 0) + payment.amount;
      return acc;
    },
    {},
  );

  const totalAmount = Object.values(groupedPaymentTypes).reduce(
    (acc, amount) => acc + amount,
    0,
  );

  const deliveriesCount = orders.filter(
    (order) => order.type === "DELIVERY",
  ).length;

  const productsSold = orders.reduce<
    { name: string; quantity: number; totalAmount: number }[]
  >((acc, order) => {
    order.order_items?.forEach((item: OrderItem) => {
      const product = item.products;
      if (!product) return;

      const existingProduct = acc.find((p) => p.name === product.name);

      if (existingProduct) {
        existingProduct.quantity += item.quantity;
        existingProduct.totalAmount += item.quantity * product.price;
      } else {
        acc.push({
          name: product.name,
          quantity: item.quantity,
          totalAmount: item.quantity * product.price,
        });
      }
    });

    return acc;
  }, []);

  return {
    salesReport: {
      totalAmount,
      paymentTypes: groupedPaymentTypes,
      deliveriesCount,
    },
    productsSold,
  };
}

export const getSalesReportByCashSessionId = cashProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cashSession } = ctx;

    const [ordersResult, tablesResult, paymentsResult] = await Promise.all([
      supabase
        .from("orders")
        .select(
          `
            id, payment_type, type, created_at, total, cash_session_id,
            order_items (
              quantity,
              products ( id, name, price )
            )
          `,
        )
        .eq("store_id", store?.id)
        .eq("cash_session_id", cashSession.id),

      supabase
        .from("tables")
        .select(
          `
        id,
        created_at,
        order_items (
          quantity,
          products ( id, name, price )
        )
      `,
        )
        .eq("store_id", store?.id)
        .eq("cash_session_id", cashSession.id),

      supabase
        .from("payments")
        .select(
          `id, amount, payment_type, order_id, table_id, type, discount, status`,
        )
        .eq("store_id", store?.id)
        .eq("cash_session_id", cashSession.id)
        .neq("payment_type", null),
    ]);

    const { data: orders, error: ordersError } = ordersResult;
    const { data: tables, error: tablesError } = tablesResult;
    const { data: payments, error: paymentsError } = paymentsResult;

    if (ordersError || tablesError || paymentsError) {
      console.error("Error fetching report data:", {
        ordersError,
        tablesError,
        paymentsError,
      });
      return;
    }

    // Transformar dados das tables para o mesmo formato de orders
    const tableOrdersFormatted = ((tables as unknown as Table[]) ?? []).map(
      (table) => ({
        id: table.id,
        payment_type: "TABLE",
        type: "TABLE",
        created_at: table.created_at,
        total: {
          total_amount: table.order_items.reduce(
            (sum, item) => sum + item.quantity * (item?.products?.price || 0),
            0,
          ),
        },
        order_items: table.order_items,
      }),
    );

    const allOrders = [...(orders ?? []), ...tableOrdersFormatted];

    return processSalesReport(allOrders, payments as unknown as PaymentType[]);
  });
