import { z } from "zod";

// Enums
export const orderTypeSchema = z.enum(["DELIVERY", "TAKEOUT"]);

export const orderStatusSchema = z.enum([
  "pending",
  "pending",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "readyToPickup",
]);

export const paymentTypeSchema = z.enum([
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PIX",
  "VOUCHER",
  "PAID",
  "DEFERRED",
]);

export const readOrdersSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Sub-schemas para JSONB
export const orderTotalSchema = z.object({
  subtotal: z.number(),
  discount: z.number().default(0),
  shipping_price: z.number().default(0),
  total_amount: z.number(),
  change_value: z.number().optional(),
});

export const orderDeliverySchema = z.object({
  address: z.string(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  complement: z.string().optional(),
  number: z.string().optional(),
  reference: z.string().optional(),
  shipping_price: z.number().default(0),
});

// Schema de extras/adicionais
export const orderItemExtraSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

// Schema de produto
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

// Schema de variação de produto
export const productVariationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().optional(),
});

// Schema de item de pedido
export const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number(),
  product_price: z.number(),
  observations: z.array(z.string()).default([]),
  extras: z.array(orderItemExtraSchema).default([]),
  products: productSchema.nullable().optional(),
});

// Schema de variação de item de pedido
export const orderItemVariationSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_variation_id: z.string().uuid(),
  product_variations: productVariationSchema,
});

// Schemas do iFood
export const ifoodItemOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const ifoodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  totalPrice: z.number(),
  observations: z.string().optional().nullable(),
  options: z.array(ifoodItemOptionSchema).optional().nullable(),
});

export const ifoodDeliveryAddressSchema = z.object({
  streetName: z.string(),
  streetNumber: z.string(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  complement: z.string().optional(),
  reference: z.string().optional(),
});

export const ifoodDeliverySchema = z.object({
  deliveryAddress: ifoodDeliveryAddressSchema,
  deliveryDateTime: z.string().or(z.date()),
  observations: z.string().optional().nullable(),
  pickupCode: z.string().optional().nullable(),
});

export const ifoodCardSchema = z.object({
  brand: z.string().optional(),
});

export const ifoodCashSchema = z.object({
  changeFor: z.number().optional(),
});

export const ifoodPaymentMethodSchema = z.object({
  method: z.enum(["CREDIT", "DEBIT", "CASH", "PIX", "ONLINE"]),
  card: ifoodCardSchema.optional().nullable(),
  cash: ifoodCashSchema.optional().nullable(),
});

export const ifoodPaymentsSchema = z.object({
  methods: z.array(ifoodPaymentMethodSchema),
});

export const ifoodBenefitSponsorshipValueSchema = z.object({
  name: z.string(),
  value: z.number(),
});

export const ifoodBenefitSchema = z.object({
  value: z.number(),
  sponsorshipValues: z.array(ifoodBenefitSponsorshipValueSchema),
});

export const ifoodTotalSchema = z.object({
  subTotal: z.number(),
  additionalFees: z.number().optional().nullable(),
  deliveryFee: z.number().optional(),
  benefits: z.number().optional(),
  orderAmount: z.number(),
});

export const ifoodCustomerSchema = z.object({
  documentNumber: z.string().optional().nullable(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const ifoodOrderDataSchema = z.any();

// Schema de customer
export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  address: z.any().optional().nullable(),
});

export const storeCustomerSchema = z.object({
  id: z.string().uuid(),
  customers: customerSchema.nullable(),
});

// Schema principal da tabela orders (database)
export const orderDatabaseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  store_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable(),
  cash_session_id: z.string().uuid().nullable(),
  coupon_id: z.string().uuid().nullable(),
  display_id: z.number().nullable(),
  type: orderTypeSchema,
  status: orderStatusSchema,
  payment_type: paymentTypeSchema.nullable(),
  is_paid: z.boolean().default(false),
  is_ifood: z.boolean().default(false),
  observations: z.string().nullable(),
  coupon_code: z.string().nullable(),
  total: orderTotalSchema.nullable(),
  delivery: orderDeliverySchema.nullable(),
  ifood_order_data: ifoodOrderDataSchema.nullable(),
});

// Schema para criar order (input)
export const createOrderSchema = z.object({
  store_id: z.string().uuid(),
  customer_id: z.string().uuid().optional(),
  cash_session_id: z.string().uuid().optional(),
  coupon_id: z.string().uuid().optional(),
  type: orderTypeSchema,
  status: orderStatusSchema.default("pending"),
  payment_type: paymentTypeSchema,
  is_paid: z.boolean().default(false),
  is_ifood: z.boolean().default(false),
  observations: z.string().optional(),
  coupon_code: z.string().optional(),
  total: orderTotalSchema,
  delivery: orderDeliverySchema.optional(),
  ifood_order_data: ifoodOrderDataSchema.optional(),
});

// Schema para atualizar order
export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid().optional(),
  status: orderStatusSchema.optional(),
  payment_type: paymentTypeSchema.optional(),
  is_paid: z.boolean().optional(),
  observations: z.string().optional(),
  total: orderTotalSchema.optional(),
  delivery: orderDeliverySchema.optional(),
});

// Schema com relacionamentos (para o select com joins)
export const orderWithRelationsSchema = orderDatabaseSchema.extend({
  order_items: z.array(orderItemSchema).optional(),
  order_item_variations: z.array(orderItemVariationSchema).optional(),
  store_customers: storeCustomerSchema.nullable(),
});

// Types exportados
export type ReadOrdersType = z.infer<typeof readOrdersSchema>;
export type OrderType = z.infer<typeof orderTypeSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type OrderTotal = z.infer<typeof orderTotalSchema>;
export type OrderDelivery = z.infer<typeof orderDeliverySchema>;
export type OrderItemExtra = z.infer<typeof orderItemExtraSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductVariation = z.infer<typeof productVariationSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderItemVariation = z.infer<typeof orderItemVariationSchema>;
export type IfoodItem = z.infer<typeof ifoodItemSchema>;
export type IfoodItemOption = z.infer<typeof ifoodItemOptionSchema>;
export type IfoodDeliveryAddress = z.infer<typeof ifoodDeliveryAddressSchema>;
export type IfoodDelivery = z.infer<typeof ifoodDeliverySchema>;
export type IfoodPaymentMethod = z.infer<typeof ifoodPaymentMethodSchema>;
export type IfoodPayments = z.infer<typeof ifoodPaymentsSchema>;
export type IfoodBenefit = z.infer<typeof ifoodBenefitSchema>;
export type IfoodTotal = z.infer<typeof ifoodTotalSchema>;
export type IfoodCustomer = z.infer<typeof ifoodCustomerSchema>;
export type IfoodOrderData = z.infer<typeof ifoodOrderDataSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type StoreCustomer = z.infer<typeof storeCustomerSchema>;
export type OrderDatabase = z.infer<typeof orderDatabaseSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type Order = z.infer<typeof orderWithRelationsSchema>;

// Export do schema padrão como Order (compatibilidade)
export { orderWithRelationsSchema as orderSchema };
