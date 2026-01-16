import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderItemsType } from "@/models/order";
import { PaymentType } from "@/models/payment";
import { isPermissionGranted } from "../../actions";
import { readOrderByIdCached } from "../deliveries/[id]/actions";
import { readTableByIdCached } from "../tables/[id]/actions";
import { readPaymentsCached } from "./actions";
import { readCustomersCached } from "./customers/actions";
import { DataTableStored } from "./data-table/data-table-stored";
import { CloseBillForm } from "./form";
import { Badge } from "@/components/ui/badge";
import { cn, formatAddress, formatDate } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { StatusKey } from "../deliveries/data-table/columns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyPhoneButton } from "@/components/copy-phone-button";

export default async function CloseBill({
  searchParams,
}: {
  searchParams: { table_id: string; order_id: string };
}) {
  const [
    [customersData],
    [tableData],
    [orderData],
    [paymentsData],
    [permission],
  ] = await Promise.all([
    readCustomersCached(),
    readTableByIdCached({ id: searchParams.table_id }),
    readOrderByIdCached({ id: searchParams.order_id }),
    readPaymentsCached({
      table_id: searchParams.table_id,
      order_id: searchParams.order_id,
    }),
    isPermissionGranted({ feature: "integration_ifood" }),
  ]);

  const sale = tableData?.table ?? orderData?.order;
  const order = orderData?.order;

  const orderDiscount = orderData?.order.total.discount;

  const storeCustomers = customersData?.customers;

  const customer = order?.store_customers?.customers;
  const customerNames = customer?.name.split(" ");
  const firstName = customerNames && customerNames[0];
  const customerPhone = customer?.phone;
  const customerAddress = formatAddress(
    order?.store_customers?.customers?.address,
  );

  const orderItems: OrderItemsType[] = sale.order_items;
  const orderPayments = paymentsData?.payments as unknown as PaymentType[];

  const organizedOrderItems = [
    ...orderItems.filter((item) => !item.is_paid),
    ...orderItems.filter((item) => item.is_paid),
  ];

  return (
    <main className="space-y-6 p-4 pb-16 lg:px-0">
      <div className="flex flex-col lg:grid grid-cols-[3fr_2fr] gap-4 items-start">
        <section className="space-y-4">
          {!!order && (
            <Card>
              <CardHeader className="flex flex-row">
                <Badge
                  className={cn(statuses[order?.status as StatusKey].color)}
                >
                  {statuses[order?.status as StatusKey].status}
                </Badge>

                <span className="text-muted-foreground ml-2">
                  #{order?.display_id}
                </span>

                <span
                  className={cn(
                    "text-xs text-muted-foreground ml-auto whitespace-nowrap",
                  )}
                >
                  {formatDate(order?.created_at, "dd/MM hh:mm")}
                </span>
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <strong>{`${firstName}`}</strong>

                  {customerPhone && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CopyPhoneButton phone={customerPhone} />
                      </TooltipTrigger>
                      <TooltipContent>Copiar telefone</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <span className="text-muted-foreground">{customerAddress}</span>
              </CardContent>
            </Card>
          )}

          <Card className="p-4 w-[calc(100vw_-_32px)] lg:w-auto">
            <section className="flex flex-col gap-2">
              <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

              <DataTableStored data={organizedOrderItems} />
            </section>
          </Card>
        </section>
        <aside className="sticky top-4 w-full">
          <CloseBillForm
            saleDiscount={orderDiscount}
            payments={orderPayments}
            storeCustomers={storeCustomers}
            isPermissionGranted={permission?.granted}
          />
        </aside>
      </div>
    </main>
  );
}
