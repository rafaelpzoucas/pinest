import { IfoodOrderData, Order } from "@/features/admin/orders/schemas";
import { formatCurrencyBRL } from "@/lib/utils";
import { PAYMENT_TYPES } from "@/models/order";

export function Payment({ order }: { order?: Order }) {
  if (!order) {
    return null;
  }
  const isIfood = order.is_ifood;
  const ifoodOrder: IfoodOrderData = isIfood && order.ifood_order_data;
  return (
    <section
      className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
        break-inside-avoid"
    >
      <div className="flex flex-row items-center justify-between">
        <h3 className="uppercase">Pagamento</h3>

        <strong className="uppercase border px-2 py-1">
          {isIfood && ifoodOrder.payments.prepaid
            ? "pago online"
            : ifoodOrder?.payments?.methods[0]?.card?.brand}{" "}
          - {PAYMENT_TYPES[order.payment_type as keyof typeof PAYMENT_TYPES]}
        </strong>
      </div>

      {(order?.total?.change_value || 0) > 0 && (
        <p className="flex flex-row items-center justify-between font-bold">
          <span>Troco:</span>{" "}
          <span>
            {formatCurrencyBRL(
              (order?.total?.change_value || 0) -
                (order?.total?.total_amount || 0),
            )}
          </span>
        </p>
      )}

      {isIfood && ifoodOrder?.extraInfo && (
        <div>
          <p>Informações adicionais: {ifoodOrder?.extraInfo}</p>
        </div>
      )}
    </section>
  );
}
