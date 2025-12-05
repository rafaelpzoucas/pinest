"use server";

import { readStoreByUserId } from "@/app/(protected)/(app)/catalog/products/register/actions";
import { createClient } from "@/lib/supabase/server";
import { AddressType } from "@/models/address";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addressSchema } from "./form";

export async function readAddress(): Promise<{
  address: AddressType;
  readAddressError: any;
}> {
  const supabase = createClient();

  const { store, storeError } = await readStoreByUserId();

  if (storeError) {
    console.error("Erro ao buscar a loja.", storeError);
  }

  const { data: address, error: readAddressError } = await supabase
    .from("addresses")
    .select("*")
    .eq("store_id", store?.id)
    .single();

  return { address, readAddressError };
}

export async function createAddress(columns: z.infer<typeof addressSchema>) {
  const supabase = createClient();

  const { store, storeError } = await readStoreByUserId();

  if (storeError) {
    console.error("Erro ao buscar a loja.", storeError);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...columns, store_id: store?.id });

  revalidatePath("account");

  return { data, error };
}

export async function updateAddress(columns: z.infer<typeof addressSchema>) {
  const supabase = createClient();

  const { data: session } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("addresses")
    .update(columns)
    .eq("user_id", session.user?.id);

  revalidatePath("account");

  return { data, error };
}
