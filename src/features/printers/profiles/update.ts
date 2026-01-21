"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction } from "zsa";
import { UpdatePrinterProfileSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export const updatePrinterProfileAction = createServerAction()
  .input(UpdatePrinterProfileSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    // Verificar se não é um perfil built-in
    const { data: profile } = await supabase
      .from("printer_profiles")
      .select("is_built_in")
      .eq("id", input.id)
      .single();

    if (profile?.is_built_in) {
      throw new Error("Não é possível editar perfis padrão");
    }

    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.manufacturer !== undefined)
      updateData.manufacturer = input.manufacturer;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.cols !== undefined) updateData.cols = input.cols;
    if (input.encoding !== undefined) updateData.encoding = input.encoding;
    if (input.capabilities !== undefined) {
      updateData.capabilities = JSON.stringify(input.capabilities);
    }
    if (input.quirks !== undefined) {
      updateData.quirks = JSON.stringify(input.quirks);
    }

    const { data, error } = await supabase
      .from("printer_profiles")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/settings/printers");

    return {
      id: data.id,
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model ?? undefined,
      cols: data.cols,
      encoding: data.encoding,
      capabilities:
        typeof data.capabilities === "string"
          ? JSON.parse(data.capabilities)
          : data.capabilities,
      quirks:
        typeof data.quirks === "string" ? JSON.parse(data.quirks) : data.quirks,
      version: data.version,
      isBuiltIn: data.is_built_in,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  });
