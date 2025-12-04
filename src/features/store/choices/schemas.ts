import { z } from "zod";

export const ChoiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  is_active: z.boolean(),
  category_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  prices: z.array(
    z.object({
      id: z.string(),
      size: z.string(),
      price: z.number(),
      choice_id: z.string(),
      product_id: z.string(),
    }),
  ),
});

export type Choice = z.infer<typeof ChoiceSchema>;
