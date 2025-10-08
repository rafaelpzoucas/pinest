"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/utils";
import { useCart } from "@/stores/cart-store";

type ProductChoice = {
  id: string;
  name: string;
  description: string | null;
  size: string;
  price: number;
  choice_id: string;
  product_choices: {
    id: string;
    name: string;
    is_active: boolean;
    category_id: string | null;
    description: string | null;
  };
};

type SelectedChoice = {
  choice_id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

type ChoicesSectionProps = {
  choices: ProductChoice[];
  choiceLimit: number;
};

export function ChoicesSection({ choices, choiceLimit }: ChoicesSectionProps) {
  const { currentCartItem, setChoices, updateChoiceQuantity } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  // Garante que o componente só renderiza após hidratação
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Mescla os sabores disponíveis com os do carrinho
  const mergedChoices = useMemo(() => {
    if (!choices || !isHydrated) return [];

    return choices.map((choice) => {
      const cartChoice = currentCartItem.choices?.find(
        (c) => c.choice_id === choice.id,
      );

      return {
        choice_id: choice.id,
        name: choice.product_choices.name,
        size: choice.size,
        price: choice.price,
        quantity: cartChoice?.quantity || 0,
      } as SelectedChoice;
    });
  }, [choices, currentCartItem.choices, isHydrated]);

  // Calcula o total de sabores selecionados
  const totalSelected = useMemo(() => {
    return mergedChoices.reduce((sum, choice) => sum + choice.quantity, 0);
  }, [mergedChoices]);

  // Verifica se atingiu o limite
  const hasReachedLimit = totalSelected >= choiceLimit;

  function increase(choiceId: string) {
    if (hasReachedLimit) return;

    const choice = mergedChoices.find((c) => c.choice_id === choiceId);
    if (choice) {
      const newQuantity = choice.quantity + 1;
      updateChoiceQuantity(choiceId, newQuantity);
      updateFilteredChoices(choiceId, newQuantity);
    }
  }

  function decrease(choiceId: string) {
    const choice = mergedChoices.find((c) => c.choice_id === choiceId);
    if (choice && choice.quantity > 0) {
      const newQuantity = choice.quantity - 1;
      updateChoiceQuantity(choiceId, newQuantity);
      updateFilteredChoices(choiceId, newQuantity);
    }
  }

  function updateFilteredChoices(changedChoiceId: string, newQuantity: number) {
    const updatedMergedChoices = mergedChoices.map((choice) =>
      choice.choice_id === changedChoiceId
        ? { ...choice, quantity: newQuantity }
        : choice,
    );

    // Filtra apenas os sabores com quantity > 0
    const filteredChoices = updatedMergedChoices.filter(
      (choice) => choice.quantity > 0,
    );
    setChoices(filteredChoices);
  }

  // Se não há choices disponíveis, não renderiza nada
  if (!choices?.length) return null;

  // Mostra skeleton enquanto não hidrata
  if (!isHydrated) {
    return (
      <section className="p-4">
        <div className="h-6 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
            <div key={i} className="flex justify-between items-center py-2">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-32" />
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
              </div>
              <div className="w-10 h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">
          Escolha {choiceLimit === 1 ? "o sabor" : "os sabores"}
        </h2>
        <div className="text-sm text-muted-foreground">
          {totalSelected}/{choiceLimit}
        </div>
      </div>

      {mergedChoices.map((choice) => {
        const isDisabled = hasReachedLimit && choice.quantity === 0;

        return (
          <div
            key={choice.choice_id}
            className={`flex flex-row items-center justify-between border-b last:border-0 py-2
            transition-opacity ${isDisabled ? "opacity-50" : "opacity-100"}`}
          >
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {choice.name}
              </span>
              <strong className="text-sm">
                {formatCurrencyBRL(choice.price)}
              </strong>
            </div>

            <div className="flex flex-row items-center gap-3">
              {choice.quantity > 0 ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => decrease(choice.choice_id)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-6 text-center">{choice.quantity}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => increase(choice.choice_id)}
                    disabled={hasReachedLimit}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => increase(choice.choice_id)}
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isDisabled}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
