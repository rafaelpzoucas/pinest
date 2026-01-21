// types/printer-profile.ts
import { z } from "zod";

// Schema de capacidades
export const PrinterCapabilitiesSchema = z.object({
  bold: z.boolean(),
  underline: z.boolean(),
  cut: z.boolean(),
  partialCut: z.boolean(),
  beep: z.boolean(),
  qrCode: z.boolean(),
  barcode: z.boolean(),
  logo: z.boolean(),
  cashdrawer: z.boolean(),
  doubleWidth: z.boolean(),
  doubleHeight: z.boolean(),
  invert: z.boolean(),
  align: z.boolean(),
});

// Schema de quirks
export const PrinterQuirksSchema = z.object({
  // Quirks comuns
  needsExtraFeedBeforeCut: z.number().optional(),
  brokenBoldCommand: z.boolean().optional(),
  alternativeCutCommand: z.string().optional(),
  maxLineLength: z.number().optional(),
  needsInitBeforeEveryPrint: z.boolean().optional(),
  customCharset: z.string().optional(),
  slowPrintDelay: z.number().optional(),

  // Quirks específicos por marca
  bematechDoubleFeed: z.boolean().optional(),
  elginNeedsCRLF: z.boolean().optional(),
  epsonLegacyMode: z.boolean().optional(),
});

// Schema principal do profile
export const PrinterProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  model: z.string().optional(),
  cols: z.number().int().positive(),
  encoding: z.string(),
  capabilities: PrinterCapabilitiesSchema,
  quirks: PrinterQuirksSchema,
  version: z.number().int().positive(),
  isBuiltIn: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema para criação (sem id, createdAt, updatedAt, version)
export const PrinterProfileCreateSchema = PrinterProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
}).extend({
  version: z.number().int().positive().default(1),
  isBuiltIn: z.boolean().default(false),
});

// Schema para dados vindos do banco (JSONB vem como string)
export const PrinterProfileDatabaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  model: z.string().nullable(),
  cols: z.number(),
  encoding: z.string(),
  capabilities: z.union([
    PrinterCapabilitiesSchema,
    z.string().transform((str) => JSON.parse(str)),
  ]),
  quirks: z.union([
    PrinterQuirksSchema,
    z.string().transform((str) => JSON.parse(str)),
  ]),
  version: z.number(),
  is_built_in: z.boolean(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

// Schema para inserção no banco
export const InsertPrinterProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().optional(),
  cols: z.number().int().positive().default(48),
  encoding: z.string().default("cp850"),
  capabilities: PrinterCapabilitiesSchema,
  quirks: PrinterQuirksSchema.default({}),
  version: z.number().int().positive().default(1),
  is_built_in: z.boolean().default(false),
});

// Schema para atualização
export const UpdatePrinterProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  manufacturer: z.string().min(1).optional(),
  model: z.string().optional(),
  cols: z.number().int().positive().optional(),
  encoding: z.string().optional(),
  capabilities: PrinterCapabilitiesSchema.optional(),
  quirks: PrinterQuirksSchema.optional(),
});

export const CreatePrinterProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  manufacturer: z.string().min(1, "Fabricante é obrigatório"),
  model: z.string().optional(),
  cols: z.number().int().positive().default(48),
  encoding: z.string().default("cp850"),
  capabilities: PrinterCapabilitiesSchema,
  quirks: PrinterQuirksSchema.default({}),
});

export const DeletePrinterProfileSchema = z.object({
  id: z.string(),
});

export const GetPrinterProfileSchema = z.object({
  id: z.string(),
});

// Inferir tipos dos schemas

export type PrinterCapabilities = z.infer<typeof PrinterCapabilitiesSchema>;
export type PrinterQuirks = z.infer<typeof PrinterQuirksSchema>;
export type PrinterProfile = z.infer<typeof PrinterProfileSchema>;
export type PrinterProfileCreate = z.infer<typeof PrinterProfileCreateSchema>;
export type PrinterProfileDatabase = z.infer<
  typeof PrinterProfileDatabaseSchema
>;
export type InsertPrinterProfile = z.infer<typeof InsertPrinterProfileSchema>;
export type UpdatePrinterProfile = z.infer<typeof UpdatePrinterProfileSchema>;
