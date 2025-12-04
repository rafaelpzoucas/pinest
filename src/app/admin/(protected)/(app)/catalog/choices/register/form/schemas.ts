import { z } from "zod";

export const newChoiceFormSchema = z.object({
  choice: z.object({
    name: z
      .string({
        required_error: "Por favor, preencha o nome da escolha.",
      })
      .min(1, "O nome é obrigatório"),
    description: z.string().optional(),
    category_id: z
      .string({
        required_error: "Por favor, selecione uma categoria.",
      })
      .uuid("Categoria inválida"),
    is_active: z.boolean().default(true),
  }),
  choice_price: z.object({
    size: z.string().optional(),
    price: z.string({ message: "Por favor, insira o preço." }),
    product_id: z.string({ message: "Por favor selecione o produto" }),
  }),
});
