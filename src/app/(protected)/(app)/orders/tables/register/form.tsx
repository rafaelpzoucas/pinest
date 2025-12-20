"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TableType } from "@/models/table";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SelectedProducts } from "./products/selected-products";

import { Summary } from "./summary";
import { useCreateTable, useUpdateTable } from "@/features/tables/hooks";
import { createTableSchema } from "@/features/tables/schemas";

export function CreateSaleForm({
  storeId,
  table,
}: {
  storeId?: string;
  table: TableType;
}) {
  const searchParams = useSearchParams();
  const isEdit = !!searchParams.get("id");

  // Define your form
  const form = useForm<z.infer<typeof createTableSchema>>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      number: table?.number.toString() ?? undefined,
      description: table?.description ?? undefined,
      order_items: isEdit ? table.order_items : [],
    },
  });

  const orderItems = form.watch("order_items");

  // Hooks do React Query
  const { mutateAsync: createTableMutation, isPending: isCreatePending } =
    useCreateTable();

  const { mutateAsync: updateTableMutation, isPending: isUpdatePending } =
    useUpdateTable();

  // Submit handler
  async function onSubmit(values: z.infer<typeof createTableSchema>) {
    try {
      if (table?.id) {
        await updateTableMutation({
          id: table.id,
          is_edit: isEdit,
          ...values,
        });
      } else {
        await createTableMutation(values);
      }
    } catch (error) {
      console.error("Erro ao processar mesa:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onSubmitCapture={(e) => {
          // se o submit veio do Enter e não do botão submit
          const submitter = (e.nativeEvent as SubmitEvent).submitter;
          if (!submitter) {
            e.preventDefault();
          }
        }}
        className="flex flex-col items-start gap-4 w-full h-full"
      >
        <Card className="flex lg:hidden flex-col gap-4 p-4 fixed bottom-2 left-2 right-2">
          <p>{orderItems.length} Produto(s) selecionado(s)</p>
          <Sheet>
            <SheetTrigger
              className={buttonVariants()}
              disabled={orderItems.length === 0}
            >
              Continuar
            </SheetTrigger>
            <SheetContent className="p-0">
              <ScrollArea className="h-dvh p-4">
                <SheetTitle>
                  <SheetClose>
                    <X />
                  </SheetClose>
                </SheetTitle>
                <Summary
                  form={form}
                  isCreatePending={isCreatePending}
                  isUpdatePending={isUpdatePending}
                  table={table}
                  onSubmit={onSubmit}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </Card>
        <div className="hidden lg:flex w-full">
          <Summary
            form={form}
            isCreatePending={isCreatePending}
            isUpdatePending={isUpdatePending}
            table={table}
            onSubmit={onSubmit}
          />
        </div>
        <SelectedProducts form={form} storeId={storeId} />
      </form>
    </Form>
  );
}
