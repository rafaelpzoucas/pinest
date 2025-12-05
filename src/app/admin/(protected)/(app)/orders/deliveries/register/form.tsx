"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { readAdminCustomers } from "@/actions/admin/customers/actions";
import { readAdminShipping } from "@/actions/admin/shipping/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, formatCurrencyBRL, stringToNumber } from "@/lib/utils";
import { OrderType } from "@/models/order";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useServerAction } from "zsa-react";
import { createOrder, updateOrder } from "./actions";
import { CustomersCombobox } from "./customers/combobox";
import { CustomersForm } from "./customers/form";
import { SelectedProducts } from "./products/selected-products";
import { createOrderFormSchema } from "./schemas";
import { Summary } from "./summary";

export function CreateOrderForm({
  order,
  storeId,
}: {
  order?: OrderType;
  storeId?: string;
}) {
  const router = useRouter();

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => readAdminCustomers(storeId ?? ""),
    enabled: !!storeId,
  });
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [phoneQuery, setPhoneQuery] = useQueryState("phone");
  const [customerForm, setCustomerForm] = useQueryState("customerForm", {
    history: "replace",
  });
  const showCustomerForm =
    customerForm === "create" || customerForm === "update";

  const { data: shipping } = useQuery({
    queryKey: ["shipping"],
    queryFn: () => readAdminShipping(storeId as string),
    enabled: !!storeId,
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof createOrderFormSchema>>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      customer_id: order?.customer_id ?? "",
      order_items: order?.order_items ?? [],
      status: "preparing",
      type: order?.type ?? undefined,
      payment_type: order?.payment_type ?? undefined,
      observations: order?.observations ?? undefined,
      delivery: {
        time: order?.delivery?.time?.toString() ?? undefined,
        address: order?.delivery?.address
          ? {
              street: order.delivery.address.street,
              number: order.delivery.address.number,
              neighborhood: order.delivery.address.neighborhood ?? undefined,
              complement: order.delivery.address.complement ?? undefined,
              observations: undefined, // ou pegar de algum lugar se existir
            }
          : undefined,
      },
      total: {
        subtotal: order?.total?.subtotal ?? 0,
        change_value: order?.total?.change_value?.toString() ?? undefined,
        discount: order?.total?.discount?.toString() ?? undefined,
        total_amount: order?.total?.total_amount ?? 0,
        shipping_price: shipping?.price ?? 0,
      },
    },
  });

  const customerId = form.watch("customer_id");
  const selectedCustomer = customers?.find((c) => c.id === customerId);

  const isUpdateCustomer =
    !phoneQuery && !!selectedCustomer && customerForm === "update";

  const { execute: executeCreate, isPending: isCreating } =
    useServerAction(createOrder);
  const { execute: executeUpdate, isPending: isUpdating } =
    useServerAction(updateOrder);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createOrderFormSchema>) {
    if (order) {
      await executeUpdate({ ...values, id: order.id });

      return;
    }

    await executeCreate(values);
  }

  const orderItems = useWatch({
    control: form.control,
    name: "order_items",
  });
  const type = useWatch({ control: form.control, name: "type" });
  const shippingPrice = useWatch({
    control: form.control,
    name: "total.shipping_price",
  });
  const discount = useWatch({ control: form.control, name: "total.discount" });

  useEffect(() => {
    const subtotal = (orderItems ?? [])
      .filter((item) => item?.product_id)
      .reduce((acc, item) => {
        const itemTotal = (item?.product_price ?? 0) * (item?.quantity ?? 1);
        const extrasTotal = (item?.extras ?? []).reduce(
          (extraAcc, extra) =>
            extraAcc + (extra?.price ?? 0) * (extra?.quantity ?? 1),
          0,
        );

        return acc + itemTotal + extrasTotal;
      }, 0);

    const parsedDiscount = discount ? stringToNumber(discount) : 0;
    const isDelivery = type === "DELIVERY";

    form.setValue("total.subtotal", subtotal, { shouldValidate: true });
    form.setValue(
      "total.total_amount",
      subtotal + (isDelivery ? shippingPrice : 0) - parsedDiscount,
      {
        shouldValidate: true,
      },
    );
  }, [orderItems, type, shippingPrice, discount]);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    form.setValue("customer_id", selectedCustomer.id);
  }, [selectedCustomer]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex flex-col items-start gap-4 h-[calc(100dvh_-_2rem)] lg:pb-0"
        >
          <div className="flex flex-row gap-4">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft />
            </Button>

            <CustomersCombobox
              storeCustomers={customers}
              form={form}
              phoneQuery={phoneQuery}
              setPhoneQuery={setPhoneQuery}
              isLoading={isLoadingCustomers}
              setCustomerForm={setCustomerForm}
            />
          </div>

          <SelectedProducts form={form} storeId={storeId} />

          <div className="hidden lg:block w-full">
            <Summary
              isPending={isCreating || isUpdating}
              form={form}
              onSubmit={onSubmit}
            />
          </div>

          <Sheet open={isFinishOpen} onOpenChange={setIsFinishOpen}>
            <SheetTrigger className={cn(buttonVariants(), "lg:hidden w-full")}>
              Finalizar pedido
            </SheetTrigger>
            <SheetContent className="space-y-2">
              <SheetHeader className="flex flex-row items-center gap-2">
                <SheetClose
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                >
                  <ArrowLeft />
                </SheetClose>
                <SheetTitle className="!mt-0">Finalizar pedido</SheetTitle>
              </SheetHeader>

              <Summary
                isPending={isCreating || isUpdating}
                form={form}
                onSubmit={onSubmit}
              />
            </SheetContent>
          </Sheet>
        </form>
      </Form>

      <Sheet
        open={showCustomerForm}
        onOpenChange={(open) => {
          if (!open) setCustomerForm(null);
        }}
      >
        <SheetContent className="!p-0">
          <SheetHeader className="flex flex-row items-center gap-2 p-4">
            <SheetClose
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <ArrowLeft />
            </SheetClose>
            <SheetTitle className="!mt-0">
              {isUpdateCustomer ? "Editando" : "Novo"} cliente
            </SheetTitle>
          </SheetHeader>

          <CustomersForm
            orderForm={form}
            selectedCustomer={selectedCustomer}
            closeSheet={() => setCustomerForm(null)}
            phoneQuery={phoneQuery}
            setPhoneQuery={setPhoneQuery}
            storeId={storeId ?? ""}
            customerForm={customerForm}
          />

          {selectedCustomer && (
            <section>
              <h1 className="text-lg font-bold">Saldo do cliente</h1>

              <div className="flex flex-row items-center justify-between text-muted-foreground">
                <p>Saldo atual:</p>
                <strong>{formatCurrencyBRL(selectedCustomer.balance)}</strong>
              </div>
            </section>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
