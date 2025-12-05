"use server";

import { Choice } from "@/features/store/choices/schemas";
import { createClient } from "@/lib/supabase/server";

export async function readChoiceById(choiceId: string): Promise<{
  choice: Choice | null;
  choiceError: any | null;
}> {
  const supabase = createClient();

  const { data: choice, error: choiceError } = await supabase
    .from("product_choices")
    .select(
      `
        *,
        prices:product_choice_prices (*)
      `,
    )
    .eq("id", choiceId)
    .single();

  return { choice, choiceError };
}
