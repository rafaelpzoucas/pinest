import { OrderType } from "@/models/order";
import { receipt } from "../escpos-builder/v2";
import { format, subHours } from "date-fns";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";
import { PrinterProfile } from "@/features/printers/profiles/schemas";

export function buildReceiptKitchenESCPOS(
  order?: OrderType,
  reprint = false,
  profile: PrinterProfile = getDefaultProfile(),
) {
  if (!order) return "";

  const displayId = order?.display_id ?? order.id.substring(0, 4);
  const isIfood = order?.is_ifood;

  const customer = isIfood
    ? order.ifood_order_data.customer
    : order.store_customers.customers;

  const parts = customer.name.trim().split(/\s+/);
  const customerName = parts.slice(0, 2).join(" ");

  const itemsList = reprint
    ? order.order_items
    : order.order_items.filter((item) => !item.printed);

  const r = receipt(profile)
    .left()
    .strong()
    .h3(`${reprint ? "REIMPRESSÃO - " : ""}COZINHA`)
    .endStrong()
    .br()
    .h2(`Ident: ${customerName.toUpperCase()}`)
    .hr()
    .strong()
    .h2(`PEDIDO #${displayId}`)
    .endStrong()
    .br()
    .p(
      `DATA: ${format(subHours(new Date(order.created_at), 3), "dd/MM HH:mm:ss")}`,
    )
    .hr();

  if (!isIfood) {
    const lastItemIndex = itemsList.length - 1;

    for (const [index, item] of itemsList.entries()) {
      if (!item.products) continue;

      // Nome do produto
      r.strong()
        .h2(`${item.quantity} ${item.products.name.toUpperCase()}`)
        .endStrong()
        .br();

      // Kitchen Observations (Observações do Produto)
      if (
        item.products.kitchen_observations &&
        item.products.kitchen_observations.length > 0
      ) {
        for (const kitchenObs of item.products.kitchen_observations) {
          if (kitchenObs.trim() !== "") {
            r.h2(` • ${kitchenObs.toUpperCase()}`).br();
          }
        }
        r.br();
      }

      // Choices
      if (item.choices && item.choices.length > 0) {
        for (const choice of item.choices) {
          r.h2(` ${choice.product_choices.name.toUpperCase()}`).br();
        }
        r.br();
      }

      // Extras
      for (const [i, extra] of item.extras.entries()) {
        r.h2(` +${extra.quantity} ad. ${extra.name.toUpperCase()}`).br();
      }

      if (item.extras.length > 0) r.br();

      // Observações do cliente
      if (item.observations.length > 0 && item.observations[0] !== "") {
        for (const obs of item.observations) {
          r.h2(` *${obs.toUpperCase()}`).br();
        }
      }

      if (index !== lastItemIndex) {
        r.hr();
      }
    }
  } else {
    const ifoodItems = order.ifood_order_data.items;
    const lastIfoodIndex = ifoodItems.length - 1;

    for (const [index, item] of ifoodItems.entries()) {
      r.h2(`${item.quantity} ${item.name.toUpperCase()}`).br();

      for (const option of item.options ?? []) {
        r.h2(` +${option.quantity} ad. ${option.name.toUpperCase()}`).br();
      }

      if (item.options?.length) r.br();

      if (item.observations) {
        r.h2(` *${item.observations.toUpperCase()}`).br();
      }

      if (index !== lastIfoodIndex) {
        r.hr();
      }
    }
  }

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}
