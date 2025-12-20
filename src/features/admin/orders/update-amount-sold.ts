"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateAmountSoldAndStock(
  productId: string,
  quantityDiff: number, // Pode ser positivo ou negativo
) {
  const supabase = createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, amount_sold, stock")
    .eq("id", productId)
    .single();

  if (productError) {
    console.error("Erro ao buscar produto", productError);
    return;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      amount_sold: (product?.amount_sold ?? 0) + quantityDiff,
      stock:
        product?.stock !== null ? product.stock - quantityDiff : product.stock,
    })
    .eq("id", productId);

  if (updateError) {
    console.error(
      `Erro ao atualizar produto ${product?.id} - ${product?.name}`,
      updateError,
    );
  }
}
