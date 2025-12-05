import { createAdminClient } from "@/lib/supabase/admin";
import { createServerActionProcedure } from "zsa";

export const webhookProcedure = createServerActionProcedure().handler(
  async () => {
    const supabase = createAdminClient();
    return { supabase };
  },
);
