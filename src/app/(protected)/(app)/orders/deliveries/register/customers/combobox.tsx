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
import { ChevronsUpDown, Edit, Loader2, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { createOrderFormSchema } from "../schemas";
import { useCustomersSearch } from "@/features/customers/hooks";

type CustomersComboboxProps = {
  form: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
  storeId?: string;
  phoneQuery: string | null;
  setPhoneQuery: (value: string | null) => void;
  setCustomerForm: (value: string | null) => void;
};

export function CustomersCombobox({
  form,
  storeId,
  phoneQuery,
  setPhoneQuery,
  setCustomerForm,
}: CustomersComboboxProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [open, setOpen] = useState(!orderId);
  const [selectedCustomer, setSelectedCustomer] = useState<
    (typeof searchResults)[number] | null
  >(null);

  // Hook customizado para busca com debounce
  const {
    customers: searchResults,
    isLoading,
    searchTerm,
    setSearchTerm,
    hasSearchTerm,
  } = useCustomersSearch(storeId ?? "", !!storeId, phoneQuery ?? "");

  useEffect(() => {
    if (phoneQuery) {
      setSearchTerm(phoneQuery);
    }
  }, [phoneQuery, setSearchTerm]);

  const normalizePhone = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const normalizedValue = normalizePhone(value);
    if (normalizedValue) {
      setPhoneQuery(normalizedValue);
    } else if (phoneQuery) {
      setPhoneQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm) {
      const normalizedSearch = normalizePhone(searchTerm);
      const hasCustomers = searchResults?.some((customer) => {
        const normalizedCustomerPhone = normalizePhone(
          customer?.customers?.phone || "",
        );
        return normalizedCustomerPhone.includes(normalizedSearch);
      });

      if (!hasCustomers) {
        setCustomerForm("create");
        e.preventDefault();
      }
    }
  };

  const hasPhone = selectedCustomer?.customers?.phone;
  const hasAddress =
    selectedCustomer?.customers?.address &&
    formatAddress(selectedCustomer?.customers?.address);

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
                    <p>{selectedCustomer?.customers?.name}</p>

                    {hasPhone && (
                      <>
                        <span className="hidden lg:block">&bull;</span>
                        <p>
                          {formatPhoneBR(selectedCustomer?.customers?.phone)}
                        </p>
                      </>
                    )}

                    {hasAddress && (
                      <>
                        <span className="hidden lg:block">&bull;</span>
                        <p className="text-wrap text-left">
                          {formatAddress(selectedCustomer?.customers?.address)}
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
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Digite o nome ou telefone do cliente..."
                  className="h-9"
                  value={searchTerm}
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
                    {!hasSearchTerm ? (
                      <div className="flex flex-col gap-2 items-center justify-center py-6 text-muted-foreground">
                        <Search className="w-8 h-8" />
                        <p className="text-sm">
                          Digite pelo menos 2 caracteres para buscar
                        </p>
                      </div>
                    ) : isLoading ? (
                      <div className="flex flex-row gap-2 items-center justify-center py-6">
                        <Loader2 className="animate-spin" />
                        <span>Buscando clientes...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-6">
                        <p>Nenhum cliente encontrado.</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setCustomerForm("create")}
                        >
                          <Plus className="w-4 h-4" /> Criar novo cliente
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {searchResults?.map((storeCustomer) => {
                      const customerHasPhone = storeCustomer?.customers?.phone;
                      const customerHasAddress =
                        storeCustomer?.customers?.address &&
                        formatAddress(storeCustomer?.customers?.address);

                      return (
                        <CommandItem
                          value={storeCustomer.id}
                          key={storeCustomer.id}
                          onSelect={() => {
                            setSelectedCustomer(storeCustomer);

                            form.setValue("customer_id", storeCustomer.id);

                            setPhoneQuery(null);
                            setSearchTerm("");
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
                                {formatPhoneBR(storeCustomer?.customers?.phone)}
                              </p>
                            )}

                            {customerHasAddress && (
                              <p className="text-muted-foreground">
                                {formatAddress(
                                  storeCustomer?.customers?.address,
                                )}
                              </p>
                            )}

                            {storeCustomer.balance < 0 && (
                              <p className="text-muted-foreground">
                                Saldo:{" "}
                                {formatCurrencyBRL(storeCustomer?.balance)}
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
