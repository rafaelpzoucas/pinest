"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useServerAction } from "zsa-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Choice } from "@/features/store/choices/schemas";
import { formatCurrencyBRL } from "@/lib/utils";
import type { ProductType } from "@/models/product";
import { createChoice, updateChoice } from "./actions";
import { newChoiceFormSchema } from "./schemas";

interface ChoiceFormProps {
  choice: Choice | null;
  categories?: Array<{ id: string; name: string }>;
  products?: ProductType[] | null;
}

export function ChoiceForm({ choice, categories, products }: ChoiceFormProps) {
  const router = useRouter();
  const choiceId = choice?.id;

  console.log({ choice });

  const form = useForm<z.infer<typeof newChoiceFormSchema>>({
    resolver: zodResolver(newChoiceFormSchema),
    defaultValues: {
      choice: {
        name: choice?.name ?? "",
        description: choice?.description ?? "",
        category_id: choice?.category_id ?? undefined,
        is_active: choice?.is_active ?? true,
      },
      choice_price: {
        price: formatCurrencyBRL(choice?.prices?.[0].price ?? 0) ?? undefined,
        size: choice?.prices?.[0].size ?? undefined,
        product_id: choice?.prices?.[0].product_id ?? undefined,
      },
    },
  });

  const { execute: executeCreate, isPending: isCreating } = useServerAction(
    createChoice,
    {
      onSuccess: () => {
        toast.success("Escolha criada com sucesso!");
        router.back();
      },
      onError: ({ err }) => {
        toast.error("Erro ao criar escolha", {
          description: err.message || "Tente novamente.",
        });
      },
    },
  );

  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updateChoice,
    {
      onSuccess: () => {
        toast.success("Escolha atualizada com sucesso!");
        router.back();
      },
      onError: ({ err }) => {
        toast.error("Erro ao atualizar escolha", {
          description: err.message || "Tente novamente.",
        });
      },
    },
  );

  const isSubmitting = isCreating || isUpdating;

  async function onSubmit(values: z.infer<typeof newChoiceFormSchema>) {
    if (!choiceId) {
      await executeCreate(values);
      return;
    }

    await executeUpdate({
      priceId: choice.prices?.[0].id,
      choiceId: choice.id,
      data: values,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6 pb-16"
      >
        <div className="flex flex-col w-full space-y-6">
          <Card className="flex flex-col gap-4 p-4">
            <CardTitle>Informações da escolha</CardTitle>

            <FormField
              control={form.control}
              name="choice.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Calabresa, Mussarela, Portuguesa..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome da escolha que aparecerá para os clientes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="choice.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os ingredientes ou características..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="choice_price.price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      type="string"
                      maskType="currency"
                      placeholder="Insira o preço da escolha..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="choice.category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Ex: Sabores de Pizza, Bordas Recheadas, Adicionais
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="choice_price.product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Ex: Sabores de Pizza, Bordas Recheadas, Adicionais
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="choice.is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Desative para ocultar esta escolha dos produtos
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Card>

          <footer className="fixed bottom-0 left-0 right-0 flex p-4 bg-background border-t">
            <div className="flex gap-2 w-full max-w-sm ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                )}
                {choiceId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </footer>
        </div>
      </form>
    </Form>
  );
}
