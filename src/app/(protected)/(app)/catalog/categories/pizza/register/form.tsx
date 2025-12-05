"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CategoryType } from "@/models/category";
import { createCategory, updateCategory } from "../../actions";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";

export const newCategoryFormSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  size: z.array(
    z.object({
      name: z.string(),
      slices: z.number(),
      flavors: z.number(),
    }),
  ),
});

export function PizzaCategoryForm({
  category,
}: {
  category: CategoryType | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathnameParts = pathname.split("/");
  pathnameParts.pop();
  pathnameParts.pop();
  const redirectTo = pathnameParts.join("/");

  const back = searchParams.get("back");
  const defaultId = searchParams.get("id");

  const form = useForm<z.infer<typeof newCategoryFormSchema>>({
    resolver: zodResolver(newCategoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  const formState = form.formState;

  async function onSubmit(values: z.infer<typeof newCategoryFormSchema>) {
    if (defaultId) {
      const { error } = await updateCategory(defaultId, values);

      if (error) {
        console.error(error);
        return null;
      }

      return router.back();
    }

    const { error } = await createCategory(values);

    if (error) {
      console.error(error);
      return null;
    }

    if (back) {
      return router.push(`${redirectTo}/products/register`);
    }

    return router.back();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da categoria</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da categoria..." {...field} />
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
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite uma descrição para a categoria..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="space-y-4 p-4">
          <h3 className="text-2xl strong">Tamanhos</h3>
          <div className="grid grid-cols-3 gap-2">
            <FormLabel>Nome</FormLabel>
            <FormLabel>Qtd. Pedaços</FormLabel>
            <FormLabel>Qtd. Sabores</FormLabel>

            <Input />
            <Input />

            <div className="flex flex-row gap-2">
              <ButtonGroup>
                <Button variant="outline" size="icon">
                  1
                </Button>
                <Button variant="outline" size="icon">
                  2
                </Button>
                <Button variant="outline" size="icon">
                  3
                </Button>
                <Button variant="outline" size="icon">
                  4
                </Button>
              </ButtonGroup>

              <Button variant={"ghost"} size={"icon"}>
                <Trash />
              </Button>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          className="ml-auto"
          disabled={
            formState.isSubmitting ||
            formState.isSubmitted ||
            !form.formState.isDirty ||
            !formState.isValid
          }
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {defaultId ? "Salvar" : "Criar categoria de pizza"}
        </Button>
      </form>
    </Form>
  );
}
