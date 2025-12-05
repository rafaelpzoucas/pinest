import {
  Bike,
  Blocks,
  ChartPie,
  CircleDollarSign,
  LayoutList,
  Printer,
  ReceiptText,
  Store,
  Ticket,
  User,
} from "lucide-react";

export const main = [
  {
    title: "Pedidos",
    url: "/orders",
    icon: ReceiptText,
  },
  {
    title: "Financeiro",
    url: "/cash-register",
    icon: CircleDollarSign,
  },
  {
    title: "Cardápio",
    url: "/catalog",
    icon: LayoutList,
  },
  {
    title: "Promoções",
    url: "/promotions",
    icon: Ticket,
  },
  // {
  //   title: 'Clientes',
  //   url: '/customers',
  //   icon: Users,
  // },
];

export const settings = [
  {
    title: "Conta",
    url: "/config/account",
    icon: User,
  },
  {
    title: "Loja virtual",
    url: "/config/layout",
    icon: Store,
  },
  {
    title: "Entrega",
    url: "/config/shipping",
    icon: Bike,
  },
  {
    title: "Impressão",
    url: "/config/printing",
    icon: Printer,
  },
  {
    title: "Integrações",
    url: "/config/integrations",
    icon: Blocks,
  },
];

export const reports = [
  {
    title: "Relatórios",
    url: "/reports",
    icon: ChartPie,
  },
];
