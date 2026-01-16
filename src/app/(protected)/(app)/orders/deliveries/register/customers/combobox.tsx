"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  cn,
  formatAddress,
  formatCurrencyBRL,
  formatPhoneBR,
} from "@/lib/utils";
import { StoreCustomerType } from "@/models/store-customer";
import { ChevronsUpDown, Edit, Loader2, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { createOrderFormSchema } from "../schemas";

type CustomersComboboxProps = {
  form: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
  storeCustomers?: StoreCustomerType[];
  isLoading: boolean;
  phoneQuery: string | null;
  setPhoneQuery: (value: string | null) => void;
  setCustomerForm: (value: string | null) => void;
};

export function CustomersCombobox({
  storeCustomers,
  form,
  phoneQuery,
  setPhoneQuery,
  isLoading,
  setCustomerForm,
}: CustomersComboboxProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [open, setOpen] = useState(!orderId);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (phoneQuery) {
      setSearchValue(phoneQuery);
    }
  }, [phoneQuery]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (/^\d+$/.test(value)) {
      setPhoneQuery(value || null);
    } else if (phoneQuery) {
      setPhoneQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue && /^\d+$/.test(searchValue)) {
      const hasCustomers = storeCustomers?.some((customer) =>
        customer.customers.phone?.includes(searchValue),
      );

      if (!hasCustomers) {
        setCustomerForm("create");
        e.preventDefault();
      }
    }
  };

  const selectedCustomer = storeCustomers?.find(
    (storeCustomer) => storeCustomer.id === form.watch("customer_id"),
  );

  const hasPhone = selectedCustomer?.customers.phone;
  const hasAddress =
    selectedCustomer?.customers.address &&
    formatAddress(selectedCustomer.customers.address);

  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="rounded-lg focus:outline outline-primary">
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between h-fit cursor-pointer",
                  !field.value && "text-muted-foreground",
                )}
              >
                {field.value ? (
                  <div className="flex flex-col items-start lg:flex-row lg:gap-4">
                    <p>{selectedCustomer?.customers.name}</p>

                    {hasPhone && (
                      <>
                        <span className="hidden lg:block">&bull;</span>
                        <p>{selectedCustomer.customers.phone}</p>
                      </>
                    )}

                    {hasAddress && (
                      <>
                        <span className="hidden lg:block">&bull;</span>
                        <p className="text-wrap text-left">
                          {formatAddress(selectedCustomer.customers.address)}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  "Selecione um cliente"
                )}
                <ChevronsUpDown className="w-4 h-4 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-screen max-w-xs lg:max-w-md p-0"
            >
              <Command>
                <CommandInput
                  placeholder="Pesquisar cliente por nome ou telefone..."
                  className="h-9"
                  value={searchValue}
                  onValueChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                />
                <div className="p-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setCustomerForm("create")}
                  >
                    <Plus /> Criar cliente
                  </Button>
                </div>

                <CommandList>
                  <CommandEmpty>
                    {isLoading ? (
                      <div className="flex flex-row gap-2 items-center justify-center">
                        <Loader2 className="animate-spin" />
                        <span>Carregando clientes...</span>
                      </div>
                    ) : (
                      "Nenhum cliente encontrado."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {storeCustomers?.map((storeCustomer) => {
                      const customerHasPhone = storeCustomer.customers.phone;
                      const customerHasAddress =
                        storeCustomer.customers.address &&
                        formatAddress(storeCustomer.customers.address);

                      return (
                        <CommandItem
                          value={`${storeCustomer.customers.name} ${storeCustomer.customers.phone || ""} ${storeCustomer.customers.address?.street || ""}`}
                          key={storeCustomer.id}
                          onSelect={() => {
                            setPhoneQuery(null);
                            setSearchValue("");
                            form.reset({
                              ...form.getValues(),
                              customer_id: storeCustomer.id,
                              delivery: {
                                ...form.getValues().delivery,
                                address: {
                                  street:
                                    storeCustomer.customers.address?.street ||
                                    "",
                                  number:
                                    storeCustomer.customers.address?.number ||
                                    "",
                                  neighborhood:
                                    storeCustomer.customers.address
                                      ?.neighborhood || "",
                                  complement:
                                    storeCustomer.customers.address
                                      ?.complement || "",
                                  observations:
                                    storeCustomer.customers.address
                                      ?.observations || "",
                                },
                              },
                            });
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex flex-row items-start">
                              <span className="max-w-[335px] line-clamp-1">
                                {storeCustomer.customers.name}
                              </span>
                              <div className="ml-auto flex flex-row gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCustomerForm("update");
                                    setPhoneQuery(null);
                                    form.setValue(
                                      "customer_id",
                                      storeCustomer.id,
                                    );
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {customerHasPhone && (
                              <p className="text-muted-foreground">
                                {formatPhoneBR(storeCustomer.customers.phone)}
                              </p>
                            )}

                            {customerHasAddress && (
                              <p className="text-muted-foreground">
                                {formatAddress(storeCustomer.customers.address)}
                              </p>
                            )}

                            {storeCustomer.balance < 0 && (
                              <p className="text-muted-foreground">
                                Saldo:{" "}
                                {formatCurrencyBRL(storeCustomer.balance)}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
