"use client";

import { readAdminCategories } from "@/actions/admin/categories/actions";
import { readAdminExtras } from "@/actions/admin/extras/actions";
import { readAdminObservations } from "@/actions/admin/observations/actions";
import { readAdminProducts } from "@/actions/admin/products/actions";
import { ExtrasInput } from "@/components/extras-input";
import { ObservationsInput } from "@/components/observations-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { stringToNumber } from "@/lib/utils";
import { ProductType } from "@/models/product";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { createOrderFormSchema } from "../schemas";
import { ProductsCombobox } from "./combobox";

export function SelectedProducts({
  form,
  storeId,
}: {
  form: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
  storeId?: string;
}) {
  const { control, setValue } = form;
  const { append, remove } = useFieldArray({
    control,
    name: "order_items",
  });

  const selectedProducts = form.watch("order_items") ?? [];

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => readAdminProducts(storeId as string),
    enabled: !!storeId,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => readAdminCategories(storeId as string),
    enabled: !!storeId,
  });

  const { data: extras, isLoading: isLoadingExtras } = useQuery({
    queryKey: ["extras"],
    queryFn: () => readAdminExtras(storeId as string),
    enabled: !!storeId,
  });

  const { data: observations, isLoading: isLoadingObservations } = useQuery({
    queryKey: ["observations"],
    queryFn: () => readAdminObservations(storeId as string),
    enabled: !!storeId,
  });

  const handleQuantityChange = (
    product: ProductType,
    change: number,
    index: number,
  ) => {
    const currentProduct = selectedProducts[index];

    if (index === -1 && change > 0) {
      append({
        product_id: product.id,
        quantity: 1,
        product_price: product.price,
        observations: [],
        extras: [],
      });
    } else if (index !== -1) {
      const newQuantity = currentProduct.quantity + change;

      if (newQuantity > 0) {
        setValue(`order_items.${index}.quantity`, newQuantity);
      } else {
        remove(index);
      }
    }
  };

  return (
    <ScrollArea className="w-full h-[calc(100vh_-_32px_-_77px_-_32px)]">
      <Card className="flex flex-col h-full">
        <CardContent className="p-4 space-y-6">
          <ProductsCombobox
            form={form}
            products={products}
            categories={categories}
            isLoading={isLoadingCategories || isLoadingProducts}
          />

          <div className="space-y-2">
            {selectedProducts.length > 0 ? (
              selectedProducts.map((item, index) => {
                const product = products?.find((p) => p.id === item.product_id);
                if (!product) return null;

                const quantity = item.quantity;

                return (
                  <Card key={index} className="bg-secondary/20 p-3">
                    <div className="grid grid-cols-[1fr_2fr_2fr_2fr_1fr] w-full items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={"secondary"}
                          size={"icon"}
                          onClick={() =>
                            handleQuantityChange(product, -1, index)
                          }
                          disabled={quantity === 0}
                          tabIndex={-1}
                        >
                          {quantity === 1 ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                        </Button>
                        <span className="w-6 text-center text-lg font-bold">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant={"secondary"}
                          size={"icon"}
                          onClick={() =>
                            handleQuantityChange(product, 1, index)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <strong className="text-lg">
                        {product.sku ? `#${product.sku}` : ""} {product.name}
                      </strong>

                      {product.allows_extras && (
                        <ExtrasInput
                          availableExtras={extras || []}
                          isLoading={isLoadingExtras}
                          value={item.extras}
                          onChange={(newExtras) =>
                            setValue(`order_items.${index}.extras`, newExtras)
                          }
                        />
                      )}

                      <ObservationsInput
                        observations={observations}
                        isLoading={isLoadingObservations}
                        storeId={storeId}
                        value={item.observations || []}
                        onChange={(newObs) =>
                          setValue(`order_items.${index}.observations`, newObs)
                        }
                      />

                      <div className="flex items-center ml-auto gap-1">
                        <Input
                          maskType="currency"
                          className="w-full max-w-28"
                          value={item.product_price}
                          onChange={(e) =>
                            setValue(
                              `order_items.${index}.product_price`,
                              stringToNumber(e.target.value),
                            )
                          }
                          tabIndex={-1}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setValue(
                                  `order_items.${index}.product_price`,
                                  product.price,
                                );
                              }}
                              tabIndex={-1}
                            >
                              <RotateCcw />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Restaurar valor</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div
                className="flex flex-col gap-4 items-center justify-center text-muted-foreground text-sm
                  w-full"
              >
                <Boxes className="w-32 h-32 opacity-10" />
                <p>Nenhum produto selecionado.</p>
                <FormField
                  control={form.control}
                  name="order_items"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
