// lib/receipts/delivery.ts
import { IfoodOrder } from "@/features/admin/integrations/ifood/schemas";
import { OrderType, PAYMENT_TYPES } from "@/models/order";
import { formatAddress, formatCurrencyBRL, formatPhoneBR } from "../utils";

import { format, subHours } from "date-fns";
import { PrinterProfile } from "@/features/printers/profiles/schemas";
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";
import { receipt } from "../escpos-builder/v2";

export function buildReceiptDeliveryESCPOS(
  order?: OrderType,
  reprint = false,
  profile: PrinterProfile = getDefaultProfile(),
) {
  if (!order) return "";

  const isIfood = order?.is_ifood;
  const ifoodOrder: IfoodOrder = isIfood && order.ifood_order_data;

  const customer = isIfood
    ? order?.ifood_order_data.customer
    : order?.store_customers.customers;

  const customerName = customer.name;
  const customerPhone = isIfood
    ? `${customer.phone.number} ID: ${customer.phone.localizer}`
    : customer.phone;
  const customerAddress = isIfood
    ? (order.delivery.address as unknown as string)
    : formatAddress(order?.store_customers.customers.address);

  const displayId = isIfood
    ? ifoodOrder.displayId
    : (order?.display_id ?? order?.id.substring(0, 4));

  const deliveryType = {
    TAKEOUT: "RETIRAR NA LOJA",
    DELIVERY: "ENTREGAR",
  }[order.type];

  // Inicia o builder ESC/POS com o profile
  const r = receipt(profile);

  // Adiciona cabeçalho
  if (reprint) {
    r.center().h3("REIMPRESSÃO").br();
  }

  r.center()
    .h2(`PEDIDO #${displayId}`)
    .br()
    .center()
    .h2(deliveryType)
    .hr()
    .left();

  // Adiciona informações básicas
  r.p(
    `DATA: ${format(subHours(new Date(order.created_at), 3), "dd/MM HH:mm:ss")}`,
  ).br();

  if (isIfood) {
    r.p(
      `ENTREGA: ${format(subHours(new Date(ifoodOrder.delivery.deliveryDateTime), 3), "dd/MM HH:mm:ss")}`,
    ).br();
  }

  r.p(`CLIENTE: ${customerName.toUpperCase()}`)
    .br()
    .p(`TELEFONE: ${String(formatPhoneBR(customerPhone)).toUpperCase()}`)
    .br()
    .h3(`ENDEREÇO: ${String(customerAddress).toUpperCase()}`)
    .br();

  if (order.observations || ifoodOrder?.delivery?.observations) {
    r.strong()
      .p(
        `OBS: ${(ifoodOrder?.delivery?.observations ?? order.observations).toUpperCase().trim()}`,
      )
      .endStrong();
  }

  r.hr(undefined, "double");

  // Preparar dados da tabela
  const tableRows: Array<Array<string>> = [];

  // Adiciona itens do pedido
  if (!isIfood) {
    const items = order.order_items;

    const normalRows: Array<Array<string>> = [];
    const deliveryFeeRows: Array<Array<string>> = [];

    for (const item of items) {
      const productName = item.products?.name?.trim() || "Taxa de entrega";

      const targetRows =
        productName === "Taxa de entrega" ? deliveryFeeRows : normalRows;

      if (!item.products) {
        targetRows.push([
          productName.toUpperCase(),
          String(item.quantity ?? 0),
          formatCurrencyBRL(item.product_price ?? 0),
          formatCurrencyBRL((item.product_price ?? 0) * (item.quantity ?? 0)),
        ]);
        continue;
      }

      const itemTotal = item.product_price ?? 0;
      const choicesTotal =
        item.choices?.reduce((acc, choice) => acc + (choice.price ?? 0), 0) ??
        0;
      const extrasTotal =
        item.extras?.reduce(
          (acc, extra) => acc + (extra.price ?? 0) * (extra.quantity ?? 0),
          0,
        ) ?? 0;

      const quantity = item.quantity ?? 0;
      const unitPrice = itemTotal + choicesTotal + extrasTotal;
      const total = unitPrice * quantity;

      // Linha principal do produto
      targetRows.push([
        productName.toUpperCase(),
        String(quantity),
        formatCurrencyBRL(unitPrice),
        formatCurrencyBRL(total),
      ]);

      // Choices
      if (item.choices && item.choices.length > 0) {
        for (const choice of item.choices) {
          targetRows.push([
            `  ${choice.product_choices.name.toUpperCase()}`,
            "",
            formatCurrencyBRL(choice.price ?? 0),
            "",
          ]);
        }
      }

      // Extras
      if (item.extras && item.extras.length > 0) {
        for (const extra of item.extras) {
          const extraQty = extra.quantity ?? 0;
          const extraPrice = extra.price ?? 0;

          targetRows.push([
            `  +${extraQty} ad. ${extra.name.toUpperCase()}`,
            "",
            formatCurrencyBRL(extraPrice),
            formatCurrencyBRL(extraPrice * extraQty),
          ]);
        }
      }

      // Observações
      if (
        item.observations &&
        item.observations.length > 0 &&
        item.observations[0] !== ""
      ) {
        for (const obs of item.observations) {
          targetRows.push([` *${obs.toUpperCase()}`, "", "", ""]);
        }
      }
    }

    // Junta tudo garantindo que a Taxa de entrega fique por último
    tableRows.push(...normalRows, ...deliveryFeeRows);
  } else {
    const items = ifoodOrder.items;

    for (const item of items) {
      // Linha principal do produto iFood (sem preço unitário)
      tableRows.push([
        item.name.toUpperCase(),
        String(item.quantity ?? 0),
        "",
        "",
      ]);

      // Opções/adicionais
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          tableRows.push([
            `  +${option.quantity} ad. ${option.name.toUpperCase()}`,
            "",
            "",
            "",
          ]);
        }
      }

      // Observações
      if (item.observations) {
        tableRows.push([` *${item.observations.toUpperCase()}`, "", "", ""]);
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

  // Total do pedido
  const total = formatCurrencyBRL(order.total.total_amount);

  // Forma de pagamento
  if (order.payment_type) {
    const isIfood = order.is_ifood;
    const ifoodOrder: IfoodOrder | undefined =
      isIfood && order.ifood_order_data;

    let paymentLabel = "";
    if (isIfood) {
      if (ifoodOrder?.payments?.prepaid) {
        paymentLabel = "PAGO ONLINE";
      } else {
        const brand =
          ifoodOrder?.payments?.methods?.[0]?.card?.brand?.toUpperCase();
        paymentLabel = brand ? `CARTÃO - ${brand}` : "MÉTODO NÃO IDENTIFICADO";
      }
    } else {
      paymentLabel =
        PAYMENT_TYPES[
          order.payment_type as keyof typeof PAYMENT_TYPES
        ]?.toUpperCase() || "INDEFINIDO";
    }

    r.br()
      .hr(undefined, "double")
      .center()
      .h3("TOTAL")
      .br()
      .center()
      .strong()
      .h2(total)
      .endStrong()
      .hr(undefined, "double")
      .center()
      .h3(paymentLabel);

    if (order.total.change_value > 0) {
      const changeValue = order.total.change_value - order.total.total_amount;

      r.br()
        .strong()
        .h3(`TROCO PARA: ${formatCurrencyBRL(changeValue)}`)
        .endStrong()
        .br();
    }

    if (isIfood && ifoodOrder?.extraInfo) {
      r.br().text(`INFO ADICIONAL: ${ifoodOrder.extraInfo.toUpperCase()}`).br();
    }
  }

  const escposString = r.feed(3).cut().build();

  return Buffer.from(escposString, "binary").toString("base64");
}
