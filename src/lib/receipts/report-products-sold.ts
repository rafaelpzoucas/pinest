import { ProductsSoldReportType } from "@/app/(protected)/(app)/reports/products-sold";
import { formatCurrencyBRL } from "../utils";
import { receipt } from "../escpos-builder/v2";
import { PrinterProfile } from "@/features/printers/profiles/schemas";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";

export function buildProductsSoldReportESCPOS(
  data: ProductsSoldReportType,
  profile: PrinterProfile = getDefaultProfile(),
): string {
  const r = receipt(profile)
    .center()
    .strong()
    .h3("PRODUTOS VENDIDOS")
    .endStrong()
    .br();

  if (!data || data.length === 0) {
    r.h2("NENHUM RESULTADO ENCONTRADO.");
    const escposString = r.feed(3).cut().build();
    return Buffer.from(escposString, "binary").toString("base64");
  }

  for (const item of data) {
    const name = item.name.toUpperCase();
    const quantity = item.quantity;
    const total = formatCurrencyBRL(item.totalAmount);

    r.strong().p(`${name}   -   ${quantity} un.   ${total}`).endStrong().hr();
  }

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}
