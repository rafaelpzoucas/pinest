import { ifoodOrderSchema } from "@/features/admin/integrations/ifood/schemas";
import { ProductVariationSchema } from "@/features/store/cart-session/schemas";
import {
  CustomerAddressSchema,
  CustomerSchema,
} from "@/features/store/customers/schemas";
import { selectedExtraSchema } from "@/features/store/extras/schemas";
import { productSchema } from "@/features/store/products/schemas";
import { z } from "zod";

// Order Items
export const orderItemSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  order_id: z.string().optional(),
  product_id: z.string().uuid().nullable(),
  quantity: z.number(),
  product_price: z.number(),
  products: productSchema.optional(),
  observations: z.array(z.string()),
  is_paid: z.boolean().optional(),
  printed: z.boolean().optional(),
  extras: z.array(selectedExtraSchema),
  description: z.string().optional(),
});

// Order Item Variations (corrigido para order_item_id)
export const orderItemVariationsSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  variation_id: z.string(),
  order_item_id: z.string(), // corrigido!
  product_variations: ProductVariationSchema,
});

export const orderTypeEnum = z.enum(["DELIVERY", "TAKEOUT"], {
  message: "Escolha o tipo do pedido.",
});

export const paymentTypeEnum = z.enum(["CARD", "PIX", "CASH", "PAID"], {
  message: "Escolha a forma de pagamento.",
});

// Order
export const orderSchema = z.object({
  id: z.string(),
  display_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  customer_id: z.string(),
  status: z.string(),
  store_id: z.string(),
  type: orderTypeEnum,
  payment_type: paymentTypeEnum,
  is_ifood: z.boolean().optional().default(false),
  is_paid: z.boolean().optional().default(false),
  ifood_order_data: ifoodOrderSchema.optional(),
  order_items: z.array(orderItemSchema),
  order_item_variations: z.array(orderItemVariationsSchema),
  store_customers: CustomerSchema,
  observations: z.string().optional(),
  coupon_id: z.string().optional(),
  coupon_code: z.string().optional(),
  total: z.object({
    shipping_price: z.number(),
    change_value: z.number(),
    discount: z.number(),
    total_amount: z.number(),
    subtotal: z.number(),
  }),
  delivery: z.object({
    time: z.number(),
    address: CustomerAddressSchema,
  }),
  products: productSchema.optional(),
});

export const createOrderItemSchema = orderItemSchema.omit({
  id: true,
  created_at: true,
  products: true,
});

export const updateOrderItemSchema = createOrderItemSchema.partial().extend({
  id: z.string(),
});

export const createOrderItemVariationSchema = orderItemVariationsSchema.omit({
  id: true,
  created_at: true,
  product_variations: true,
});

export const updateOrderItemVariationSchema = createOrderItemVariationSchema
  .partial()
  .extend({
    id: z.string(),
  });

export const createOrderSchema = orderSchema
  .omit({
    id: true,
    display_id: true,
    created_at: true,
    updated_at: true,
    store_customers: true,
    order_items: true,
    order_item_variations: true,
    is_ifood: true,
    ifood_order_data: true,
    is_paid: true,
  })
  .extend({
    cart_session_id: z.string().uuid().optional(),
    store_subdomain: z.string(),
    order_items: z.array(createOrderItemSchema),
    order_item_variations: z.array(createOrderItemVariationSchema).optional(),
  });

export const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItem = z.infer<typeof updateOrderItemSchema>;
export type CreateOrderItemVariation = z.infer<
  typeof createOrderItemVariationSchema
>;
export type UpdateOrderItemVariation = z.infer<
  typeof updateOrderItemVariationSchema
>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

export type OrderTypeEnum = z.infer<typeof orderTypeEnum>;
export type PaymentTypeEnum = z.infer<typeof paymentTypeEnum>;
