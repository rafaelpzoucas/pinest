import { TableType } from "@/models/table";
import { receipt } from "../escpos-builder/v2";
import { format, subHours } from "date-fns";
import { PrinterProfile } from "@/features/printers/profiles/schemas";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";

export function buildReceiptTableESCPOS(
  table: TableType,
  reprint = false,
  profile: PrinterProfile = getDefaultProfile(),
): string {
  const displayId = table.number;
  const itemsList = reprint
    ? table.order_items
    : table.order_items.filter((item) => !item.printed);

  let r = receipt(profile)
    .left()
    .strong()
    .h3(`${reprint ? "REIMPRESSÃO - " : ""}COZINHA`)
    .endStrong()
    .br();

  if (table.description) {
    r = r.h2(`Ident: ${table.description.toUpperCase()}`);
  }

  r = r
    .hr()
    .strong()
    .h2(`MESA #${displayId}`)
    .endStrong()
    .br()
    .p(`Data: ${format(subHours(table.created_at, 3), "dd/MM HH:mm:ss")}`)
    .hr();

  const lastItemIndex = itemsList.length - 1;

  for (const [index, item] of itemsList.entries()) {
    if (!item.products) continue;

    // Nome do produto
    r.strong()
      .h2(`${item.quantity} ${item.products.name.toUpperCase()}`)
      .endStrong()
      .br();

    // Choices
    if (item.choices && item.choices.length > 0) {
      for (const choice of item.choices) {
        r.h2(`${choice.product_choices.name.toUpperCase()}`).br();
      }
      r.br();
    }

    // Extras
    for (const [i, extra] of item.extras.entries()) {
      r.h2(`+ ${extra.quantity} ad. ${extra.name.toUpperCase()}`).br();
    }

    // Observações
    if (item.observations?.length) {
      for (const obs of item.observations) {
        r.h2(`* ${obs.toUpperCase()}`).br();
      }
    }

    if (index !== lastItemIndex) {
      r.hr();
    }
  }

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}
