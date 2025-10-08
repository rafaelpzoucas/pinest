"use client";

import { AlertCircle, Loader2, MessageCircle, Minus, Plus } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddToCart,
  useReadCartItem,
  useUpdateCartProduct,
} from "@/features/store/cart-session/hooks";
import { formatCurrencyBRL } from "@/lib/utils";
import { useCart } from "@/stores/cart-store";
import { useProduct } from "@/stores/product-store";
import { useBottomAction } from "./hooks";

export function AddToCart() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { config } = useBottomAction();
  const { product } = useProduct();

  const cartItemId = searchParams.get("cp_id");

  const isUpdate = !!cartItemId;

  const {
    currentCartItem,
    increaseQuantity,
    decreaseQuantity,
    setCurrentCartItem,
    setObservations,
  } = useCart();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const observations = currentCartItem.observations[0];

  const basePrice = product?.price ?? 0;

  // Calcular o preço da pizza baseado na choice mais cara
  const pizzaPrice = useMemo(() => {
    const hasChoices = currentCartItem.choices.length > 0;

    if (!hasChoices) {
      return basePrice;
    }

    // Encontrar o preço mais alto entre as choices selecionadas
    const choicePrices = currentCartItem.choices.map(
      (choice) => choice.price ?? 0,
    );

    return Math.max(...choicePrices, basePrice); // Garante que nunca será menor que o preço base
  }, [currentCartItem.choices, basePrice]);

  // Calcular o total dos extras
  const extrasTotal = useMemo(() => {
    return currentCartItem.extras.reduce(
      (sum, extra) => sum + (extra.price ?? 0) * extra.quantity,
      0,
    );
  }, [currentCartItem.extras]);

  // Calcular o preço total - usando o maior valor das choices
  const totalPrice = useMemo(() => {
    return (pizzaPrice + extrasTotal) * currentCartItem.quantity;
  }, [pizzaPrice, extrasTotal, currentCartItem.quantity]);

  const totalChoicesSelected = useMemo(() => {
    return currentCartItem.choices.reduce(
      (sum, choice) => sum + choice.quantity,
      0,
    );
  }, [currentCartItem.choices]);

  const needsChoices = product?.need_choices ?? false;
  const choiceLimit = product?.choice_limit ?? 0;
  const hasRequiredChoices = needsChoices
    ? totalChoicesSelected === choiceLimit
    : true;

  const canAddToCart = !needsChoices || hasRequiredChoices;

  useReadCartItem({ cartItemId: cartItemId ?? "" });

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      router.back();
      setIsDrawerOpen(false);
    },
  });

  const { mutate: updateCartProduct, isPending: isUpdatingCartProduct } =
    useUpdateCartProduct({
      onSuccess: () => {
        router.back();
        setIsDrawerOpen(false);
      },
    });

  const isLoading = isAddingToCart || isUpdatingCartProduct;

  function handleMutation() {
    if (!canAddToCart) return;

    if (isUpdate) {
      updateCartProduct(currentCartItem);
      return;
    }

    addToCart({
      newItem: currentCartItem,
      subdomain: params.store_slug as string,
    });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: no needed
  useEffect(() => {
    if (product && !isUpdate) {
      setCurrentCartItem({
        id: currentCartItem?.id,
        product_id: product?.id,
        products: { ...product, price: product?.price ?? 0 },
        product_price: product?.price ?? 0,
      });
    }
  }, [product, isUpdate, setCurrentCartItem]);

  const isVisible = !!config.showAddToCart && !!product;

  return (
    <div
      className="flex flex-col bg-background translate-y-full absolute opacity-0
        data-[visible=true]:translate-y-0 data-[visible=true]:static
        data-[visible=true]:opacity-100 transition-all duration-200 z-30"
      data-visible={isVisible}
    >
      {/* Alerta quando choices não foram selecionadas */}
      {needsChoices && !hasRequiredChoices && (
        <div
          className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border-t
            border-amber-200 dark:border-amber-800"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            Selecione {choiceLimit} {choiceLimit === 1 ? "sabor" : "sabores"}{" "}
            para continuar
          </span>
        </div>
      )}

      <div className="flex flex-row">
        <div className="flex flex-row items-center gap-2 p-4 bg-secondary/40">
          <Button
            type="button"
            variant={"secondary"}
            size={"icon"}
            onClick={decreaseQuantity}
            disabled={currentCartItem.quantity === 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <input
            type="text"
            readOnly
            className="text-center w-5 bg-transparent"
            value={currentCartItem.quantity}
          />
          <Button
            type="button"
            variant={"secondary"}
            size={"icon"}
            onClick={() => increaseQuantity(product?.stock ?? 0)}
            disabled={currentCartItem.quantity === product?.stock}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
                text-primary-foreground p-4 font-bold uppercase hover:opacity-80
                active:scale-[0.98] transition-all duration-75 disabled:opacity-50
                disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:active:scale-100"
              type="submit"
              disabled={!canAddToCart}
            >
              <span>{isUpdate ? "Salvar" : "Adicionar"}</span>
              <span>{formatCurrencyBRL(totalPrice)}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="px-6 pb-16 space-y-4">
            <DrawerHeader>
              <span className="flex flex-row gap-3 items-center mx-auto">
                <MessageCircle />
                <DrawerTitle>
                  {isUpdate ? "Editar" : "Alguma"} observação?
                </DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </span>
            </DrawerHeader>

            <Textarea
              placeholder="Ex: Tirar cebola..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />

            <DrawerFooter className="w-full px-0">
              <Button
                onClick={handleMutation}
                disabled={isLoading || !canAddToCart}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>
                      {isUpdate
                        ? "Salvando alterações"
                        : "Adicionando ao carrinho"}{" "}
                    </span>
                  </>
                ) : (
                  <span>
                    {isUpdate ? "Salvar alterações" : "Adicionar ao carrinho"}
                  </span>
                )}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
