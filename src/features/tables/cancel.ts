"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createServerAction, ZSAError } from "zsa";

export const cancelTable = createServerAction()
  .input(z.object({ tableId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("tables")
      .update({ status: "cancelled" })
      .eq("id", input.tableId);

    if (error) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Could not cancel table");
    }
  });
