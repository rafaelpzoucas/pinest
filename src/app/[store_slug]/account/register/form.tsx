"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseCookies } from "nookies";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Card } from "@/components/ui/card";
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
import { PhoneInput } from "@/components/ui/input-phone";
import {
  useCreateStoreCustomer,
  useUpdateStoreCustomer,
} from "@/features/store/customers/hooks";
import {
  CreateCustomerSchema,
  type Customer,
  type StoreCustomer,
} from "@/features/store/customers/schemas";
import { createPath } from "@/utils/createPath";

export function CustomerRegisterForm({
  customer,
  storeCustomer,
  storeSlug,
}: {
  customer?: Customer;
  storeCustomer?: StoreCustomer | null;
  storeSlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = parseCookies();

  const qCheckout = searchParams.get("checkout");

  const phone = cookies[`${storeSlug}_customer_phone`];

  const form = useForm<z.infer<typeof CreateCustomerSchema>>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      subdomain: storeSlug ?? "",
      name: customer?.name ?? "",
      phone: customer?.phone ?? phone ?? "",
      address: {
        street: customer?.address.street ?? "",
        number: customer?.address.number ?? "",
        neighborhood: customer?.address.neighborhood ?? "",
        complement: customer?.address.complement ?? "",
        observations: customer?.address.observations ?? "",
      },
    },
  });

  const { mutate: createCustomer, isPending: isCreatingCustomer } =
    useCreateStoreCustomer();
  const { mutate: updateCustomer, isPending: isUpdatingCustomer } =
    useUpdateStoreCustomer();

  const isPending = isCreatingCustomer || isUpdatingCustomer;

  async function onSubmit(values: z.infer<typeof CreateCustomerSchema>) {
    if (customer && storeCustomer) {
      updateCustomer({
        ...values,
        id: customer.id,
      });
    } else {
      createCustomer({
        ...values,
        customerId: customer?.id,
      });
    }

    if (qCheckout) {
      return router.push(createPath(`/checkout?step=pickup`, storeSlug));
    }

    return router.push(createPath("/orders", storeSlug));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-md mx-auto space-y-6"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormDescription>O número de WhatsApp.</FormDescription>
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
                <Input placeholder="Digite o seu nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-4 space-y-6">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input placeholder="Insira a sua rua..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Insira o número..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Insira o bairro..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira o complemento se tiver..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Insira uma observação..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <footer className="fixed bottom-[68px] left-0 right-0">
          <button
            type="submit"
            className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
              text-primary-foreground p-4 font-bold uppercase hover:opacity-80
              active:scale-[0.98] transition-all duration-75"
            disabled={isPending}
          >
            <span className="flex flex-row items-center">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <span>Continuar</span>
            </span>
            <ArrowRight />
          </button>
        </footer>
      </form>
    </Form>
  );
}
