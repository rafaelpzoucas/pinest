"use client";

import { ShoppingCart } from "lucide-react";
import { useReadCart } from "@/features/store/cart-session/hooks";
import { useCart } from "@/stores/cart-store";
import { CartProduct } from "./cart-product";

export function CartProducts({ storeSlug }: { storeSlug: string }) {
  const { cart } = useCart();

  useReadCart({ subdomain: storeSlug });

  return (
    <div className="lg:h-[370px] p-1 pr-2">
      {cart && cart.length > 0 ? (
        cart.map((product) => (
          <CartProduct
            key={product.id}
            cartProduct={product}
            storeSlug={storeSlug}
          />
        ))
      ) : (
        <div
          className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto h-full
            text-muted py-4"
        >
          <ShoppingCart className="w-20 h-20" />
          <p className="text-center text-muted-foreground">
            Você não possui produtos no carrinho
          </p>
        </div>
      )}
    </div>
  );
}
