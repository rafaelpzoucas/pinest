import { SalesReportType } from "@/app/(protected)/(app)/reports/sales-report";
import { receipt } from "../escpos-builder/v2";
import { formatCurrencyBRL } from "../utils";
import { PAYMENT_TYPES } from "@/models/order";
import { PrinterProfile } from "@/features/printers/profiles/schemas";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";

export function buildSalesReportESCPOS(
  data: SalesReportType,
  profile: PrinterProfile = getDefaultProfile(),
): string {
  const r = receipt(profile)
    .left()
    .strong()
    .h3("RELATÓRIO DE VENDAS")
    .endStrong()
    .br();

  if (!data?.totalAmount) {
    r.h2("NENHUM RESULTADO ENCONTRADO.");
    const escposString = r.feed(3).cut().build();
    return Buffer.from(escposString, "binary").toString("base64");
  }

  // Seção de Entregas
  r.strong()
    .h3("ENTREGAS")
    .endStrong()
    .br()
    .h3(`TOTAL DE ENTREGAS: ${data.deliveriesCount}`)
    .br()
    .hr(undefined, "double")
    .br();

  // Seção de Métodos de Pagamento
  r.strong()
    .h3("MÉTODOS DE PAGAMENTO")
    .endStrong()
    .br()
    .h3(`TOTAL DE VENDAS: ${formatCurrencyBRL(data.totalAmount)}`)
    .br()
    .hr(undefined, "double")
    .br();

  // Lista de métodos de pagamento
  for (const [key, value] of Object.entries(data.paymentTypes || {})) {
    const paymentLabel =
      PAYMENT_TYPES[key as keyof typeof PAYMENT_TYPES] || key;
    r.h2(`${paymentLabel.toUpperCase()}: ${formatCurrencyBRL(value)}`).hr();
  }

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}
