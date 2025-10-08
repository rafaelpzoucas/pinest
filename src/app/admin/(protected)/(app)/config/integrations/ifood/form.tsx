"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useServerAction } from "zsa-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertIfoodMerchantId } from "./actions";
import { InsertMerchantIdFormSchema } from "./schemas";

export function MerchantIdForm({ merchantId }: { merchantId: string }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof InsertMerchantIdFormSchema>>({
    resolver: zodResolver(InsertMerchantIdFormSchema),
    defaultValues: {
      merchant_id: merchantId ?? undefined,
    },
  });

  const { execute, isPending } = useServerAction(insertIfoodMerchantId, {
    onSuccess: () => {
      router.refresh();
      console.info("Merchant ID inserido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar Merchant ID:", error);
    },
  });

  async function onSubmit(data: z.infer<typeof InsertMerchantIdFormSchema>) {
    await execute(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!merchantId ? (
          <>
            <FormField
              control={form.control}
              name="merchant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant UUID</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={!!merchantId}
                      placeholder="Insira o seu Merchant UUID do iFood..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              {isPending ? "Integrando ao iFood" : "Integrar ao iFood"}
            </Button>
          </>
        ) : (
          <Card
            className="px-2 py-1 bg-emerald-600 text-primary-foreground flex flex-row items-center
              gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <strong>Sua conta está integrada ao iFood</strong>
          </Card>
        )}
      </form>
    </Form>
  );
}
