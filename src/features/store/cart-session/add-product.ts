"use server";

import { createServerAction, ZSAError } from "zsa";
import { createCartProduct } from "./create";
import { getStoreCartSession } from "./get-cart-session";
import { AddToCartSchema } from "./schemas";

export const addProductToCart = createServerAction()
  .input(AddToCartSchema)
  .handler(async ({ input }) => {
    const { newItem } = input;

    console.log({ newItem });

    const cartSession = await getStoreCartSession(input.subdomain);

    const [_, error] = await createCartProduct({
      newItem,
      session_id: cartSession?.value,
    });

    if (error) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", error.message);
    }
  });
