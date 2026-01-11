import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createTableSchema } from "@/features/tables/schemas";
import { formatCurrencyBRL } from "@/lib/utils";
import { TableType } from "@/models/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export function Summary({
  form,
  table,
  isCreatePending,
  isUpdatePending,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof createTableSchema>>;
  table: TableType;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  onSubmit: (values: z.infer<typeof createTableSchema>) => void;
}) {
  const router = useRouter();

  const orderItems = form.watch("order_items");

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  );

  return (
    <Card
      className="flex flex-col lg:flex-row justify-between gap-4 p-0 lg:p-4 border-0 w-full
        lg:border bg-transparent lg:bg-card"
    >
      <Button
        type="button"
        onClick={() => router.back()}
        variant="ghost"
        size="icon"
        className="hidden lg:block"
      >
        <ArrowLeft />
      </Button>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_4fr] gap-4">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mesa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nº"
                  inputMode="numeric"
                  {...field}
                  autoFocus
                />
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
                  placeholder="Insira uma descrição para a mesa"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-full lg:max-w-xs space-y-2">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between w-full">
            <span>Total da venda</span>
            <strong>{formatCurrencyBRL(totalAmount ?? 0)}</strong>
          </div>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={isCreatePending || isUpdatePending}
          onClick={() => form.handleSubmit(onSubmit)()}
        >
          {isCreatePending || isUpdatePending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>{table?.id ? "Atualizando" : "Criando"} mesa</span>
            </>
          ) : (
            <span>{table?.id ? "Atualizar" : "Criar"} mesa</span>
          )}
        </Button>
      </div>
    </Card>
  );
}
