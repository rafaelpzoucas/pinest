import { z } from 'zod'

export const printingSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  auto_print: z.boolean().optional(),
  kitchen_font_size: z.number().optional(),
  font_size: z.number().optional(),
})

export const printerSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  name: z.string(),
  nickname: z.string(),
  sectors: z.array(z.string()),
})

export const printQueueSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  store_id: z.string().optional(),
  text: z.string(),
  printed: z.boolean().optional(),
  font_size: z.number().optional().default(1),
  printer_name: z.string(),
})

export type PrintingSettingsType = z.infer<typeof printingSettingsSchema>
export type PrinterType = z.infer<typeof printerSchema>
export type PrintQueueType = z.infer<typeof printQueueSchema>
