"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { SheetFooter } from "@/components/ui/sheet";
import { StoreCustomerType } from "@/models/store-customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { createOrderFormSchema } from "../schemas";
import { updateCustomer } from "./actions";
import { CreateCustomerSchema } from "@/features/store/customers/schemas";
import { createAdminCustomer } from "@/actions/admin/customers/actions";

type CustomersFormProps = {
  selectedCustomer?: StoreCustomerType;
  closeSheet: () => void;
  orderForm: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
  phoneQuery: string | null;
  setPhoneQuery: (value: string | null) => void;
  storeId: string;
  customerForm: string | null;
};

export function CustomersForm({
  selectedCustomer,
  closeSheet,
  orderForm,
  phoneQuery,
  setPhoneQuery,
  storeId,
  customerForm,
}: CustomersFormProps) {
  const queryClient = useQueryClient();

  const isUpdate =
    !phoneQuery && !!selectedCustomer && customerForm === "update";

  const form = useForm<z.infer<typeof CreateCustomerSchema>>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: {
        street: "",
        number: "",
        neighborhood: "",
        complement: "",
        observations: "",
      },
    },
  });

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: createAdminCustomer,
    onSuccess: ({ createdStoreCustomer }) => {
      const newCustomer = createdStoreCustomer;
      setPhoneQuery(null);

      queryClient.setQueryData<StoreCustomerType[]>(["customers"], (old) =>
        old ? [...old, newCustomer] : [newCustomer],
      );

      orderForm.setValue("customer_id", newCustomer.id);
      closeSheet();
    },
    onError: ({ message }) => {
      console.error("Não foi possível criar o cliente.", message);
      toast.error("Não foi possível criar o cliente.");
    },
  });

  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updateCustomer,
    {
      onSuccess: () => {
        toast.success("Cliente atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        closeSheet();
      },
      onError: ({ err }) => {
        console.error("Não foi possível atualizar o cliente.", err);
        toast.error("Não foi possível atualizar o cliente.");
      },
    },
  );

  function onSubmit(values: z.infer<typeof CreateCustomerSchema>) {
    if (isUpdate) {
      executeUpdate({ ...values, id: selectedCustomer.customers.id });
    } else {
      createCustomer({ ...values, storeId });
    }
  }

  useEffect(() => {
    if (!isUpdate && phoneQuery) {
      form.setValue("phone", `+55${phoneQuery}`);
    }
  }, [phoneQuery, isUpdate, form]);

  useEffect(() => {
    if (isUpdate) {
      orderForm.setValue("customer_id", selectedCustomer.id);

      form.reset({
        name: selectedCustomer.customers.name || "",
        phone: selectedCustomer.customers.phone || "",
        address: {
          street: selectedCustomer.customers.address?.street || "",
          number: selectedCustomer.customers.address?.number || "",
          neighborhood: selectedCustomer.customers.address?.neighborhood || "",
          complement: selectedCustomer.customers.address?.complement || "",
          observations: selectedCustomer.customers.address?.observations || "",
        },
      });
    }
  }, [isUpdate, selectedCustomer, orderForm, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="h-[calc(100dvh_-_132px)] overflow-auto">
          <div className="flex flex-col w-full space-y-4 px-4 pb-16">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o nome..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <PhoneInput {...field} />
                  </FormControl>
                  <FormDescription>
                    O número de WhatsApp. (DDD + número)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o endereço..." {...field} />
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
                  <FormLabel>Número (opcional)</FormLabel>
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
                  <FormLabel>Bairro (opcional)</FormLabel>
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
          </div>
        </div>

        <SheetFooter className="p-4">
          <Button
            type="submit"
            className="ml-auto w-full"
            disabled={isCreating || isUpdating}
          >
            {(isCreating || isUpdating) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isUpdate ? "Atualizar" : "Cadastrar"} cliente
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
