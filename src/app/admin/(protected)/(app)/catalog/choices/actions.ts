"use server";

import { revalidatePath } from "next/cache";
import type { Choice } from "@/features/store/choices/schemas";
import { createClient } from "@/lib/supabase/server";

export async function readChoicesByStore(storeId?: string): Promise<{
  data: Choice[] | null;
  error: any | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_choices")
    .select(
      `
        *,
        prices:product_choice_prices(*)
      `,
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function deleteChoice(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("product_choices")
    .delete()
    .eq("id", id);

  revalidatePath("/catalog");

  return { error };
}
