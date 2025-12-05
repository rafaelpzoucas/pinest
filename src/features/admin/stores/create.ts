"use server";

import { setStoreEdgeConfigVercel } from "@/app/(protected)/(app)/config/(options)/layout/register/store/actions";
import { generateSlug } from "@/lib/utils";
import { authenticatedProcedure } from "@/lib/zsa-procedures";
import { ZSAError } from "zsa";
import { AdminStore, createAdminStoreSchema } from "./schemas";

export const createAdminStore = authenticatedProcedure
  .createServerAction()
  .input(createAdminStoreSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const newColumns = {
      ...input,
      name: input?.name?.trim(),
      store_subdomain: generateSlug(input?.name?.trim() as string),
      user_id: user?.id,
    };

    const { data, error } = await supabase
      .from("stores")
      .insert(newColumns)
      .select("id, name, description, store_subdomain, logo_url")
      .single();

    if (error) {
      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        `Could not create store, cause: ${error.message}`,
      );
    }

    setStoreEdgeConfigVercel({
      name: data.name,
      description: data.description,
      subdomain: data.store_subdomain,
      logoUrl: data.logo_url,
    });

    return { createdAdminStore: data as AdminStore };
  });
