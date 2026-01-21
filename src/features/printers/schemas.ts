import { z } from "zod";
import { PrinterProfileSchema } from "./profiles/schemas";

export const printerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome da impressora é obrigatório"),
  nickname: z.string().min(1, "Apelido é obrigatório"),
  sectors: z.array(z.string()).default([]),
  profile_id: z.string().default("generic-escpos"), // NOVO
  profile: PrinterProfileSchema.optional(),
  store_id: z.string().optional(),
});

export type PrinterType = z.infer<typeof printerSchema>;
