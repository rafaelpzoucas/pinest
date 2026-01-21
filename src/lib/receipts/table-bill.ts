import { Store } from "@/features/store/store/schemas";
import { TableType } from "@/models/table";
import { receipt } from "../escpos-builder/v2";
import { format, subHours } from "date-fns";
import { formatCurrencyBRL, formatDuration } from "../utils";
import { PrinterProfile } from "@/features/printers/profiles/schemas";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";

export function buildReceiptTableBillESCPOS(
  store: Store,
  table: TableType,
  profile: PrinterProfile = getDefaultProfile(),
): string {
  const displayId = table.number;
  const items = table.order_items;
  const now = new Date();

  const r = receipt(profile)
    .center()
    .strong()
    .h2(`${store?.name?.toUpperCase()}`)
    .endStrong()
    .br()
    .h2(`MESA #${displayId}`)
    .hr()
    .left()
    .p(`DATA DE ENVIO: ${format(subHours(now, 3), "dd/MM HH:mm:ss")}`)
    .br()
    .p(`PERMANENCIA: ${formatDuration(new Date(table.created_at), now)}`)
    .br()
    .h3("ITENS DO PEDIDO:")
    .br();

  // Preparar dados da tabela
  const tableRows: Array<Array<string>> = [];
  let total = 0;

  for (const item of items) {
    if (!item.products) continue;

    const itemTotal = item.product_price ?? 0;
    const choicesTotal =
      item.choices?.reduce((acc, choice) => acc + (choice.price ?? 0), 0) ?? 0;
    const extrasTotal =
      item.extras?.reduce(
        (acc, extra) => acc + (extra.price ?? 0) * (extra.quantity ?? 0),
        0,
      ) ?? 0;

    const quantity = item.quantity ?? 0;
    const unitPrice = itemTotal + choicesTotal + extrasTotal;
    const itemFinalTotal = unitPrice * quantity;
    total += itemFinalTotal;

    const productName = item.products.name ?? "PRODUTO";

    // Linha principal do produto
    tableRows.push([
      productName.toUpperCase(),
      String(quantity),
      formatCurrencyBRL(unitPrice),
      formatCurrencyBRL(itemFinalTotal),
    ]);

    // Choices como sub-itens
    if (item.choices && item.choices.length > 0) {
      for (const choice of item.choices) {
        const choiceName = choice.product_choices?.name ?? "OPCAO";
        tableRows.push([
          `  ${choiceName.toUpperCase()}`,
          "",
          formatCurrencyBRL(choice.price ?? 0),
          "",
        ]);
      }
    }

    // Extras como sub-itens
    if (item.extras && item.extras.length > 0) {
      for (const extra of item.extras) {
        const extraName = extra.name ?? "ADICIONAL";
        const extraQty = extra.quantity ?? 0;
        const extraPrice = extra.price ?? 0;
        tableRows.push([
          `  +${extraQty} ad. ${extraName.toUpperCase()}`,
          "",
          formatCurrencyBRL(extraPrice),
          formatCurrencyBRL(extraPrice * extraQty),
        ]);
      }
    }

    // Observações
    if (item.observations && item.observations.length > 0) {
      for (const obs of item.observations) {
        if (obs && obs.trim() !== "") {
          tableRows.push([` *${obs.toUpperCase()}`, "", "", ""]);
        }
      }
    }
  }

  // Adicionar a tabela ao recibo
  r.table(
    [
      { title: "PRODUTO", width: 20, align: "left" },
      { title: "QTD", width: 3, align: "center" },
      { title: "UNIT.", width: 10, align: "right" },
      { title: "TOTAL", width: 12, align: "right" },
    ],
    tableRows,
  );

  // Total final
  r.br()
    .hr(undefined, "double")
    .center()
    .h3("TOTAL")
    .br()
    .center()
    .strong()
    .h2(formatCurrencyBRL(total))
    .endStrong()
    .hr(undefined, "double")
    .br()
    .center()
    .p("Nao tem validade fiscal");

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}
