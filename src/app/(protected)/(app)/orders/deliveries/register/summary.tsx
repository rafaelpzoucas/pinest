import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyBRL, stringToNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { createOrderFormSchema } from "./schemas";

export function Summary({
  form,
  isPending,
  onSubmit,
}: {
  form: any;
  isPending: boolean;
  onSubmit: (values: z.infer<typeof createOrderFormSchema>) => void;
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const subtotal = form.watch("total.subtotal") ?? 0;
  const discount = stringToNumber(form.watch("total.discount")) ?? 0;
  const totalAmount = form.watch("total.total_amount");

  return (
    <Card
      className="flex flex-col lg:flex-row justify-between gap-4 p-0 lg:p-4 border-0 w-full
        lg:border bg-transparent lg:bg-card"
    >
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <FormField
        control={form.control}
        name="total.shipping_price"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <FormField
        control={form.control}
        name="total.subtotal"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <div className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Tipo de pedido</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="DELIVERY" />
                    </FormControl>
                    <FormLabel className="font-normal">Entrega</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="TAKEOUT" />
                    </FormControl>
                    <FormLabel className="font-normal">Retirada</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Forma de pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="PIX" />
                    </FormControl>
                    <FormLabel className="font-normal">PIX</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="CREDIT" />
                    </FormControl>
                    <FormLabel className="font-normal">Cartão</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="CASH" />
                    </FormControl>
                    <FormLabel className="font-normal">Dinheiro</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="PAID" />
                    </FormControl>
                    <FormLabel className="font-normal">Pago</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("payment_type") === "CASH" && (
          <FormField
            control={form.control}
            name="total.change_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Troco para (opcional)</FormLabel>
                <FormControl>
                  <Input
                    maskType="currency"
                    placeholder="Insira o valor..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="total.discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto (opcional)</FormLabel>
              <FormControl>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor do desconto..."
                  tabIndex={-1}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Insira observações..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-full lg:max-w-xs space-y-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="space-y-1">
            <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
              <span>Subtotal</span>
              <strong>{formatCurrencyBRL(subtotal)}</strong>
            </div>

            {form.watch("type") === "DELIVERY" && (
              <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
                <span>Entrega</span>
                <strong>
                  {formatCurrencyBRL(form.watch("total.shipping_price") ?? 0)}
                </strong>
              </div>
            )}

            {discount > 0 && (
              <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
                <span>Desconto</span>
                <strong className="text-green-600">
                  {formatCurrencyBRL(discount * -1)}
                </strong>
              </div>
            )}

            <hr />

            <div className="flex flex-row items-center justify-between w-full">
              <span>Total da venda</span>
              <strong>{formatCurrencyBRL(totalAmount ?? 0)}</strong>
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="w-full ring-offset-2 ring-offset-transparent"
          disabled={isPending || totalAmount <= 0}
          onClick={() => form.handleSubmit(onSubmit)()}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>{orderId ? "Atualizando" : "Criando"} pedido</span>
            </>
          ) : (
            <span>{orderId ? "Atualizar" : "Criar"} pedido</span>
          )}
        </Button>
      </div>
    </Card>
  );
}
