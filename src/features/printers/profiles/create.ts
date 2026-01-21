"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction } from "zsa";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { CreatePrinterProfileSchema } from "./schemas";

export const createPrinterProfileAction = createServerAction()
  .input(CreatePrinterProfileSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const id = nanoid();

    const { data, error } = await supabase
      .from("printer_profiles")
      .insert({
        id,
        name: input.name,
        manufacturer: input.manufacturer,
        model: input.model,
        cols: input.cols,
        encoding: input.encoding,
        capabilities: JSON.stringify(input.capabilities),
        quirks: JSON.stringify(input.quirks),
        version: 1,
        is_built_in: false,
      })
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
