import { z } from "zod";

export const openCashSessionSchema = z.object({
  opening_balance: z.string(),
});

export const closeCashSessionSchema = z.object({
  closing_balance: z.string(),
  cash_balance: z.string(),
  credit_balance: z.string(),
  debit_balance: z.string(),
  pix_balance: z.string(),
});
