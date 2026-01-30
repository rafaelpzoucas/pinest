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

export const createTransactionFormSchema = z.object({
  amount: z.string({ message: "Insira o valor da transação." }),
  payment_type: z.enum(["PIX", "CASH", "CREDIT_CARD", "DEBIT_CARD"], {
    message: "Selecione o método de pagamento.",
  }),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Selecione o tipo de transação.",
  }),
  description: z.string({ message: "Insira uma descrição." }),
});

export const createCashReceiptsSchema = z.array(
  z.object({
    id: z.string().optional(),
    created_at: z.string().optional(),
    session_id: z.string().uuid().optional(),
    type: z.enum([
      "cash_005",
      "cash_010",
      "cash_025",
      "cash_050",
      "cash_1",
      "cash_2",
      "cash_5",
      "cash_10",
      "cash_20",
      "cash_50",
      "cash_100",
      "cash_200",
      "pix",
      "credit",
      "debit",
    ]),
    value: z.number(),
    amount: z.number(),
    total: z.number(),
  }),
);

export type CreateCashSessionTransactionType = z.infer<
  typeof createTransactionFormSchema
>;
