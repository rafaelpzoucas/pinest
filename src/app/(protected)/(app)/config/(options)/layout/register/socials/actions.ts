"use server";

import { createClient } from "@/lib/supabase/server";
import { SocialMediaType } from "@/models/social";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { readStoreByUserId } from "../../../account/actions";
import { socialFormSchema } from "./form";

export async function readSocials(): Promise<{
  socials: SocialMediaType[] | null;
  readSocialsError: any | null;
}> {
  const supabase = createClient();

  const { store, storeError } = await readStoreByUserId();

  if (storeError) {
    console.error(storeError);
  }

  const { data: socials, error: readSocialsError } = await supabase
    .from("store_socials")
    .select("*")
    .eq("store_id", store?.id);

  return { socials, readSocialsError };
}

export async function createSocialMedias(
  values: z.infer<typeof socialFormSchema>,
) {
  const supabase = createClient();

  const { store, storeError } = await readStoreByUserId();

  if (storeError) {
    console.error(storeError);
  }

  const socialsToAdd = values.socials.map((social) => ({
    ...social,
    store_id: store?.id,
  }));

  const { data: socials, error: createSocialError } = await supabase
    .from("store_socials")
    .insert(socialsToAdd);

  revalidatePath("/config/account");

  return { socials, createSocialError };
}

export async function updateSocialMedia(
  values: z.infer<typeof socialFormSchema>,
) {
  const supabase = createClient();

  const socials = values.socials;

  for (const social of socials) {
    await supabase
      .from("store_socials")
      .update({
        link: social.link,
      })
      .eq("id", social.id);
  }
}

export async function deleteSocialMedia(socialId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("store_socials")
    .delete()
    .eq("id", socialId);

  return { error };
}
