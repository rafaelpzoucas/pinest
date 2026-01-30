import { z } from "zod";
import { orderItemsSchema } from "../../schemas";
import { addressSchema } from "@/actions/admin/customers/schemas";

export const orderTypeEnum = z.enum(["DELIVERY", "TAKEOUT"], {
  message: "Escolha o tipo do pedido.",
});

export const paymentTypeEnum = z.enum(["CARD", "PIX", "CASH", "PAID"], {
  message: "Escolha a forma de pagamento.",
});

const statusEnum = z.enum([
  "pending",
  "pending",
  "preparing",
  "readyToPickup",
  "shipped",
  "delivered",
  "cancelled",
]);

const totalSchema = z.object({
  subtotal: z.number(),
  shipping_price: z.number(),
  discount: z.string().optional(),
  change_value: z.string().optional(),
  total_amount: z.number(),
});

const deliverySchema = z.object({
  time: z.string().optional(),
  address: addressSchema.optional(),
});

export const createOrderFormSchema = z.object({
  customer_id: z.string().min(1, "Selecione o cliente."),
  order_items: orderItemsSchema,
  type: orderTypeEnum,
  payment_type: paymentTypeEnum,
  status: statusEnum,
  observations: z.string().optional(),
  total: totalSchema,
  delivery: deliverySchema,
  is_ifood: z.boolean().optional(),
  ifood_order_data: z.any().optional(),
});

export const updateOrderFormSchema = z.object({
  id: z.string(),
  order_items: orderItemsSchema,
  type: orderTypeEnum,
  payment_type: paymentTypeEnum,
  observations: z.string().optional(),
  total: totalSchema,
  delivery: deliverySchema,
});
