import { Card, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CategoryType } from "@/models/category";
import { newProductFormSchema } from "./form";

export function ProductInfo({
  form,
  categories,
}: {
  form: UseFormReturn<z.infer<typeof newProductFormSchema>>;
  categories: CategoryType[] | null;
}) {
  const kitchenObservations = form.watch("kitchen_observations") || [];

  const addObservation = () => {
    const current = form.getValues("kitchen_observations") || [];
    form.setValue("kitchen_observations", [...current, ""]);
  };

  const removeObservation = (index: number) => {
    const current = form.getValues("kitchen_observations") || [];
    form.setValue(
      "kitchen_observations",
      current.filter((_, i) => i !== index),
    );
  };

  const updateObservation = (index: number, value: string) => {
    const current = form.getValues("kitchen_observations") || [];
    const updated = [...current];
    updated[index] = value;
    form.setValue("kitchen_observations", updated);
  };

  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardTitle>Informações do produto</CardTitle>

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories &&
                  categories.map((category) => (
                    <SelectItem value={category.id} key={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Insira o nome do produto..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Insira uma descrição para o produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço</FormLabel>
            <FormControl>
              <Input
                type="string"
                maskType="currency"
                placeholder="Insira o preço do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="promotional_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço promocional (opcional)</FormLabel>
            <FormControl>
              <Input
                type="string"
                maskType="currency"
                placeholder="Insira o preço promocional do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estoque</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Insira o estoque do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU (opcional)</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Insira o estoque do produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="kitchen_observations"
        render={() => (
          <FormItem>
            <FormLabel>Observações para a cozinha (opcional)</FormLabel>
            <div className="space-y-2">
              {kitchenObservations.map((observation, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={observation}
                    onChange={(e) => updateObservation(index, e.target.value)}
                    placeholder="Ex: Salmão, Cream cheese, Cebolinha..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeObservation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObservation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar observação
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
