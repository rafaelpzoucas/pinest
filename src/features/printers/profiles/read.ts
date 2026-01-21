"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction } from "zsa";
import { GetPrinterProfileSchema, PrinterProfile } from "./schemas";

function parseDatabaseRow(row: any): PrinterProfile {
  return {
    id: row.id,
    name: row.name,
    manufacturer: row.manufacturer,
    model: row.model ?? undefined,
    cols: row.cols,
    encoding: row.encoding,
    capabilities:
      typeof row.capabilities === "string"
        ? JSON.parse(row.capabilities)
        : row.capabilities,
    quirks:
      typeof row.quirks === "string" ? JSON.parse(row.quirks) : row.quirks,
    version: row.version,
    isBuiltIn: row.is_built_in,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

export const getAllPrinterProfilesAction = createServerAction().handler(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("printer_profiles")
      .select("*")
      .order("is_built_in", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map(parseDatabaseRow);
  },
);

export const getPrinterProfileByIdAction = createServerAction()
  .input(GetPrinterProfileSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("printer_profiles")
      .select("*")
      .eq("id", input.id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Perfil não encontrado");

    return parseDatabaseRow(data);
  });

export const getBuiltInProfilesAction = createServerAction().handler(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("printer_profiles")
      .select("*")
      .eq("is_built_in", true)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map(parseDatabaseRow);
  },
);

export const getCustomProfilesAction = createServerAction().handler(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("printer_profiles")
      .select("*")
      .eq("is_built_in", false)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map(parseDatabaseRow);
  },
);
