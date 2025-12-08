import { z } from "zod";

// Schema base da tabela
export const tableSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  number: z.number().nullable(),
  store_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  status: z.enum(["open", "occupied", "reserved", "closed"]).default("open"),
  cash_session_id: z.string().uuid().nullable(),
});

// Tipo inferido do schema
export type Table = z.infer<typeof tableSchema>;

// Schema para criar uma nova mesa
export const createTableSchema = z.object({
  number: z
    .number({
      required_error: "Número da mesa é obrigatório",
    })
    .positive("Número deve ser positivo"),
  store_id: z.string(),
  description: z.string().optional(),
  status: z.enum(["open", "occupied", "reserved", "closed"]).default("open"),
  cash_session_id: z.string().uuid().optional(),
});

export type CreateTable = z.infer<typeof createTableSchema>;

// Schema para atualizar uma mesa
export const updateTableSchema = z.object({
  number: z.number().positive("Número deve ser positivo").optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["open", "occupied", "reserved", "closed"]).optional(),
  cash_session_id: z.string().uuid().nullable().optional(),
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
