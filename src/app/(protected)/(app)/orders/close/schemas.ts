import { z } from "zod";
import { paymentTypeSchema } from "@/features/admin/orders/schemas";

export const createPaymentSchema = z.object({
  customer_id: z.string().optional(),
  amount: z.string({ message: "Insira o valor a ser pago." }),
  payment_type: paymentTypeSchema,
  status: z.string(),
  discount: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  table_id: z.string().optional(),
  order_id: z.string().optional(),
});

export const closeSaleSchema = z.object({
  table_id: z.string().optional(),
  order_id: z.string().optional(),
});
