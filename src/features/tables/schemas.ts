import { z } from "zod";
import { productSchema } from "../admin/orders/schemas";

export const tableItemsSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      product_id: z.string().nullable(),
      quantity: z.number(),
      product_price: z.number(),
      observations: z.array(z.string()).optional().default([]),
      products: productSchema.optional(),
      extras: z.array(
        z.object({
          name: z.string(),
          price: z.number(),
          extra_id: z.string(),
          quantity: z.number(),
        }),
      ),
    }),
  )
  .min(1, "O pedido precisa de pelo menos 1 item.");

// Schema base da tabela
export const tableSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  number: z.number().nullable(),
  store_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  status: z.enum(["open", "occupied", "reserved", "closed"]).default("open"),
  cash_session_id: z.string().uuid().nullable(),
  order_items: tableItemsSchema,
});

// Tipo inferido do schema
export type Table = z.infer<typeof tableSchema>;

// Schema para criar uma nova mesa
export const createTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: "Insira o número da mesa." }),
  description: z.string().optional(),
  order_items: tableItemsSchema,
});

export type CreateTable = z.infer<typeof createTableSchema>;

// Schema para atualizar uma mesa
export const updateTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: "Insira o número da mesa." }),
  description: z.string().optional(),
  order_items: tableItemsSchema,
  is_edit: z.boolean(),
});

export type UpdateTable = z.infer<typeof updateTableSchema>;

// Schema para filtros de listagem
export const listTablesSchema = z.object({
  store_id: z.string().uuid().optional(),
  status: z.enum(["open", "occupied", "reserved", "closed"]).optional(),
  cash_session_id: z.string().uuid().optional(),
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional(),
});

export type ListTablesFilters = z.infer<typeof listTablesSchema>;
