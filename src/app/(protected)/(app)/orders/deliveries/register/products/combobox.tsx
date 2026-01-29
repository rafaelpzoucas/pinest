import { ChevronsUpDown, Loader2, Plus, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormField } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { CategoryType } from "@/models/category";
import { ProductType } from "@/models/product";
import { createOrderFormSchema } from "../schemas";

export function ProductsCombobox({
  form,
  categories,
  products,
  isLoading,
}: {
  form: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
  categories?: CategoryType[];
  products?: ProductType[];
  isLoading: boolean;
}) {
  const { append } = useFieldArray({
    control: form.control,
    name: "order_items",
  });

  const [open, setOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCategories, setShowCategories] = useState(false);

  const selectedProducts = form.watch("order_items") ?? [];
  const orderType = form.watch("type");
  const shippingPrice = form.watch("total.shipping_price") ?? 0;
  const discount = form.watch("total.discount") || "0";
  const parsedDiscount = parseFloat(discount);

  const deliveryFee = orderType === "DELIVERY" ? shippingPrice : 0;

  const handleAddProduct = (product: ProductType) => {
    append({
      product_id: product.id,
      quantity: 1,
      product_price: product.price,
      observations: [],
      extras: [],
    });

    setOpen(false);
  };

  // Filtra produtos baseado na categoria selecionada
  const filteredProducts = products?.filter((product) => {
    if (!categoryFilter) return true;
    return product.category_id === categoryFilter;
  });

  // Calcula o valor total da compra
  const selectedProductsAmount = selectedProducts
    .filter((item) => item.product_id)
    .reduce((total, item) => {
      const product = products?.find((p) => p.id === item.product_id);
      return total + (product ? item.product_price * item.quantity : 0);
    }, 0);

  const totalAmount = selectedProductsAmount + deliveryFee - parsedDiscount;

  // Atualiza o valor total sempre que mudanças ocorrerem
  useEffect(() => {
    form.setValue("total.total_amount", totalAmount);
  }, [totalAmount]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between focus:outline outline-primary"
            >
              Selecionar produtos...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-screen max-w-xs lg:max-w-2xl p-0"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Busque por nome ou código..."
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex flex-row gap-2 items-center justify-center">
                      <Loader2 className="animate-spin" />
                      <span>Carregando produtos...</span>
                    </div>
                  ) : (
                    <p className="px-8 py-4 text-center">
                      {`Nenhum produto encontrado${categoryFilter ? ` na categoria ${categories?.find((cat) => cat.id === categoryFilter)?.name}` : ""}.`}
                    </p>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {categories && categories.length > 0 && (
                    <div className="space-y-2 p-1 pb-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategories(!showCategories)}
                        className="w-full justify-start"
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {showCategories
                          ? "Ocultar categorias"
                          : "Ver categorias"}
                      </Button>

                      {showCategories && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              categoryFilter === "" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCategoryFilter("")}
                          >
                            Todas
                          </Button>

                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              type="button"
                              variant={
                                categoryFilter === category.id
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setCategoryFilter(category.id)}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {filteredProducts?.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.sku}`}
                      onSelect={() => {
                        handleAddProduct(product);
                      }}
                      className={cn("flex items-center justify-between")}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {product.sku ? (
                            <span>#{product.sku} &bull;</span>
                          ) : (
                            ""
                          )}{" "}
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {formatCurrencyBRL(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Campo hidden para o total */}
      <FormField
        control={form.control}
        name="total.total_amount"
        render={({ field }) => <input type="hidden" {...field} />}
      />
    </div>
  );
}
