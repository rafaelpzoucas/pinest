"use client";

import { useEffect } from "react";
import type { Product } from "@/features/store/products/schemas";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { useProduct } from "@/stores/product-store";

export function ProductInfo({ product }: { product?: Product }) {
  const { setProduct } = useProduct();

  const isPromotional = !!product?.promotional_price;

  const productPrice = product?.promotional_price ?? product?.price;

  useEffect(() => {
    if (product) {
      setProduct(product);
    }
  }, [product, setProduct]);

  if (!product) {
    return null;
  }

  return (
    <section className="space-y-4 lg:space-y-12 p-4">
      <h1 className="text-2xl lg:text-xl capitalize font-bold">
        {product.name}
      </h1>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="leading-4">
        {product.promotional_price && (
          <p
            className={cn(
              "font-bold text-primary",
              isPromotional &&
                "font-light text-xs text-muted-foreground line-through",
            )}
          >
            {formatCurrencyBRL(product?.price ?? 0)}
          </p>
        )}

        <p className={cn("font-bold text-primary text-xl lg:text-3xl")}>
          {formatCurrencyBRL(productPrice ?? 0)}
        </p>
      </div>
    </section>
  );
}
