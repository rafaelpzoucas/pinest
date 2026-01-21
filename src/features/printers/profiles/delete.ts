"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction } from "zsa";
import { DeletePrinterProfileSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export const deletePrinterProfileAction = createServerAction()
  .input(DeletePrinterProfileSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    // Verificar se não é um perfil built-in
    const { data: profile } = await supabase
      .from("printer_profiles")
      .select("is_built_in")
      .eq("id", input.id)
      .single();

    if (profile?.is_built_in) {
      throw new Error("Não é possível deletar perfis padrão");
    }

    // Verificar se alguma impressora está usando este perfil
    const { data: printers } = await supabase
      .from("printers")
      .select("id")
      .eq("profile_id", input.id)
      .limit(1);

    if (printers && printers.length > 0) {
      throw new Error(
        "Este perfil está sendo usado por impressoras. Remova-o das impressoras primeiro.",
      );
    }

    const { error } = await supabase
      .from("printer_profiles")
      .delete()
      .eq("id", input.id);

    if (error) throw new Error(error.message);

    revalidatePath("/settings/printers");

    return { success: true };
  });
