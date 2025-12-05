"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { StoreType } from "@/models/store";
import { UserType } from "@/models/user";
import { redirect } from "next/navigation";

export async function createOwner() {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    console.error(sessionError);
  }

  const { user } = await readOwner();

  if (user) {
    return { createOwnerError: null };
  }

  const { data: createdOwner, error: createOwnerError } = await supabase
    .from("users")
    .insert({
      id: session.user?.id,
      name: session.user?.user_metadata.name,
      phone: session.user?.user_metadata.phone ?? null,
      email: session.user?.email,
      role: "admin",
    })
    .select("*")
    .single();

  if (createdOwner) {
    const response = await createSeller(createdOwner.id, createdOwner.email);
    if (response) {
      console.log("Seller account created successfully");
    } else {
      console.error("Error creating seller account");
    }
  }

  return { createOwnerError };
}

export async function createSeller(userId: string, email?: string) {
  const supabase = createClient();

  const account = await stripe.accounts.create({
    email,
    type: "express",
    country: "BR",
    business_type: "individual",
  });

  const { data, error } = await supabase
    .from("users")
    .update({ stripe_account_id: account.id })
    .eq("id", userId);

  if (error) {
    console.error(error);
  }

  return data;
}

export async function readOwner(): Promise<{
  user: UserType | null;
  userError: any | null;
}> {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    console.error(sessionError);

    redirect("/sign-in");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user?.id)
    .single();

  return { user, userError };
}

export async function readStore(): Promise<{
  store: StoreType | null;
  storeError: any | null;
}> {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    console.error(sessionError);

    redirect("/sign-in");
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select(
      `
        *,
        addresses (*)
      `,
    )
    .eq("user_id", session.user?.id)
    .single();

  return { store, storeError };
}
