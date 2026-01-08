"use server";

import { authenticatedProcedure } from "@/lib/zsa-procedures";
import { z } from "zod";

export const updateStorePixKey = authenticatedProcedure
  .createServerAction()
  .input(z.object({ pix_key: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { error } = await supabase
      .from("stores")
      .update(input)
      .eq("user_id", user?.id);

    if (error) {
      throw new Error(`Could not update pix key, cause: ${error.message}`);
    }
  });
