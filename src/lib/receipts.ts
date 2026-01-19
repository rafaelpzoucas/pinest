import { format, subHours } from "date-fns";
import type { ProductsSoldReportType } from "@/app/(protected)/(app)/reports/products-sold";
import type { SalesReportType } from "@/app/(protected)/(app)/reports/sales-report";
import { formatAddress, formatCurrencyBRL } from "@/lib/utils";
import type { IfoodOrder } from "@/models/ifood";
import { type OrderType, PAYMENT_TYPES } from "@/models/order";
import type { TableType } from "@/models/table";
import { receipt } from "./escpos";

export function buildReceiptKitchenESCPOS(order?: OrderType, reprint = false) {
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

  const r = receipt()
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

export function buildReceiptDeliveryESCPOS(order?: OrderType, reprint = false) {
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

  // Inicia o builder ESC/POS
  const r = receipt();

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
    .p(`TELEFONE: ${String(customerPhone).toUpperCase()}`)
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

  r.hr().h3("ITENS DO PEDIDO:").br(2);

  // Adiciona itens do pedido
  if (!isIfood) {
    const items = order.order_items;

    for (const [index, item] of items.entries()) {
      if (!item.products) {
        r.p(
          `${item.quantity} ${item.description} - ${formatCurrencyBRL(item.product_price)}`,
        );
        continue;
      }

      const itemTotal = item.product_price;
      const choicesTotal =
        item.choices?.reduce((acc, choice) => acc + choice.price, 0) ?? 0;
      const extrasTotal = item.extras.reduce(
        (acc, extra) => acc + extra.price * extra.quantity,
        0,
      );
      const total = (itemTotal + choicesTotal + extrasTotal) * item.quantity;

      r.p(
        `${item.quantity} ${item.products.name.toUpperCase()} - ${formatCurrencyBRL(total)}`,
      );

      // Choices
      if (item.choices && item.choices.length > 0) {
        for (const choice of item.choices) {
          r.br().p(
            `  ${choice.product_choices.name.toUpperCase()} - ${formatCurrencyBRL(choice.price)}`,
          );
        }
      }

      for (const extra of item.extras) {
        r.br().p(
          `  +${extra.quantity} ad. ${extra.name.toUpperCase()} - ${formatCurrencyBRL(extra.price * extra.quantity)}`,
        );
      }

      if (item.observations.length > 0 && item.observations[0] !== "") {
        for (const obs of item.observations ?? []) {
          r.br().p(` *${obs.toUpperCase()}`);
        }
      }

      const isLast = index === items.length - 1;

      if (!isLast) {
        r.br().hr(undefined, "dashed");
      }
    }
  } else {
    const items = ifoodOrder.items;

    for (const [index, item] of items.entries()) {
      r.p(`${item.quantity} ${item.name.toUpperCase()}`);

      for (const option of item.options ?? []) {
        r.br().p(` +${option.quantity} ad. ${option.name.toUpperCase()}`);
      }

      if (item.observations) {
        r.br().p(` *${item.observations.toUpperCase()}`);
      }

      const isLast = items.length - 1 === index;

      if (!isLast) {
        r.br().hr(undefined, "dashed");
      }
    }
  }

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

    r.hr(undefined, "double")
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
      r.text(`INFO ADICIONAL: ${ifoodOrder.extraInfo.toUpperCase()}`).br(2);
    }
  }

  const escposString = r.feed(3).cut().build();

  return Buffer.from(escposString, "binary").toString("base64");
}

export function buildReceiptTableESCPOS(
  table: TableType,
  reprint = false,
): string {
  const displayId = table.number;
  const itemsList = reprint
    ? table.order_items
    : table.order_items.filter((item) => !item.printed);

  const r = receipt()
    .left()
    .strong()
    .h3(`${reprint ? "REIMPRESSÃO - " : ""}COZINHA`)
    .endStrong()
    .br()
    .h2(`Ident: ${table.description.toUpperCase()}`)
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

export function buildReceiptTableBillESCPOS(table: TableType): string {
  const displayId = table.number;
  const items = table.order_items;

  const r = receipt()
    .center()
    .strong()
    .h2("CONTA DA MESA")
    .endStrong()
    .br()
    .h2(`MESA #${displayId}`)
    .hr()
    .left()
    .p(`DATA: ${format(subHours(table.created_at, 3), "dd/MM HH:mm:ss")}`)
    .br()
    .p(`DESCRIÇÃO: ${(table.description ?? "").toUpperCase()}`)
    .hr()
    .h3("ITENS DO PEDIDO:")
    .br(2);

  let total = 0;

  for (const [index, item] of items.entries()) {
    if (!item.products) continue;

    const itemTotal = item.product_price ?? 0;
    const choicesTotal =
      item.choices?.reduce((acc, choice) => acc + (choice.price ?? 0), 0) ?? 0;
    const extrasTotal =
      item.extras?.reduce(
        (acc, extra) => acc + (extra.price ?? 0) * (extra.quantity ?? 0),
        0,
      ) ?? 0;
    const itemFinalTotal =
      (itemTotal + choicesTotal + extrasTotal) * (item.quantity ?? 0);
    total += itemFinalTotal;

    const productName = item.products.name ?? "PRODUTO";
    r.p(
      `${item.quantity ?? 0} ${productName.toUpperCase()} - ${formatCurrencyBRL(itemFinalTotal)}`,
    );

    // Choices
    if (item.choices && item.choices.length > 0) {
      for (const choice of item.choices) {
        const choiceName = choice.product_choices?.name ?? "OPÇÃO";
        r.br().p(
          `  ${choiceName.toUpperCase()} - ${formatCurrencyBRL(choice.price ?? 0)}`,
        );
      }
    }

    // Extras
    if (item.extras && item.extras.length > 0) {
      for (const extra of item.extras) {
        const extraName = extra.name ?? "ADICIONAL";
        const extraQty = extra.quantity ?? 0;
        const extraPrice = extra.price ?? 0;
        r.br().p(
          `  +${extraQty} ad. ${extraName.toUpperCase()} - ${formatCurrencyBRL(extraPrice * extraQty)}`,
        );
      }
    }

    // Observações
    if (item.observations && item.observations.length > 0) {
      for (const obs of item.observations) {
        if (obs && obs.trim() !== "") {
          r.br().p(` *${obs.toUpperCase()}`);
        }
      }
    }

    const isLast = index === items.length - 1;
    if (!isLast) {
      r.br().hr(undefined, "dashed");
    }
  }

  // Total final
  r.hr(undefined, "double")
    .center()
    .h3("TOTAL")
    .br()
    .center()
    .strong()
    .h2(formatCurrencyBRL(total))
    .endStrong()
    .hr(undefined, "double");

  const escposString = r.feed(3).cut().build();
  return Buffer.from(escposString, "binary").toString("base64");
}

export function buildProductsSoldReportESCPOS(
  data: ProductsSoldReportType,
): string {
  const r = receipt()
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

export function buildSalesReportESCPOS(data: SalesReportType): string {
  const r = receipt()
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
