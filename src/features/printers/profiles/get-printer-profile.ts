// lib/printer/get-printer-profile.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { PrinterProfile } from "./schemas";
import { getDefaultProfile } from "./base-profiles";

export async function getPrinterProfileByPrinterName(
  printerName: string,
): Promise<PrinterProfile> {
  try {
    const supabase = createClient();

    // Buscar a impressora pelo nome
    const { data: printer, error: printerError } = await supabase
      .from("printers")
      .select("profile_id")
      .eq("name", printerName)
      .single();

    if (printerError || !printer?.profile_id) {
      console.warn(
        `Profile não encontrado para impressora ${printerName}, usando profile padrão`,
      );
      return getDefaultProfile();
    }

    // Buscar o profile
    const { data: profile, error: profileError } = await supabase
      .from("printer_profiles")
      .select("*")
      .eq("id", printer.profile_id)
      .single();

    if (profileError || !profile) {
      console.warn(
        `Profile ${printer.profile_id} não encontrado, usando profile padrão`,
      );
      return getDefaultProfile();
    }

    // Parsear o profile do banco
    return {
      id: profile.id,
      name: profile.name,
      manufacturer: profile.manufacturer,
      model: profile.model ?? undefined,
      cols: profile.cols,
      encoding: profile.encoding,
      capabilities:
        typeof profile.capabilities === "string"
          ? JSON.parse(profile.capabilities)
          : profile.capabilities,
      quirks:
        typeof profile.quirks === "string"
          ? JSON.parse(profile.quirks)
          : profile.quirks,
      version: profile.version,
      isBuiltIn: profile.is_built_in,
      createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
      updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar profile da impressora:", error);
    return getDefaultProfile();
  }
}

// Versão que busca pelo profile_id diretamente
export async function getPrinterProfileById(
  profileId: string,
): Promise<PrinterProfile> {
  try {
    const supabase = createClient();

    const { data: profile, error } = await supabase
      .from("printer_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      console.warn(
        `Profile ${profileId} não encontrado, usando profile padrão`,
      );
      return getDefaultProfile();
    }

    return {
      id: profile.id,
      name: profile.name,
      manufacturer: profile.manufacturer,
      model: profile.model ?? undefined,
      cols: profile.cols,
      encoding: profile.encoding,
      capabilities:
        typeof profile.capabilities === "string"
          ? JSON.parse(profile.capabilities)
          : profile.capabilities,
      quirks:
        typeof profile.quirks === "string"
          ? JSON.parse(profile.quirks)
          : profile.quirks,
      version: profile.version,
      isBuiltIn: profile.is_built_in,
      createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
      updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar profile:", error);
    return getDefaultProfile();
  }
}
