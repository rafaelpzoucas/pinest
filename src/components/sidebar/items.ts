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
} from 'lucide-react'

export const main = [
  {
    title: 'Pedidos',
    url: '/admin/purchases',
    icon: ReceiptText,
  },
  {
    title: 'Financeiro',
    url: '/admin/cash-register',
    icon: CircleDollarSign,
  },
  {
    title: 'Cardápio',
    url: '/admin/catalog',
    icon: LayoutList,
  },
  {
    title: 'Promoções',
    url: '/admin/promotions',
    icon: Ticket,
  },
  // {
  //   title: 'Clientes',
  //   url: '/admin/customers',
  //   icon: Users,
  // },
]

export const settings = [
  {
    title: 'Conta',
    url: '/admin/config/account',
    icon: User,
  },
  {
    title: 'Loja virtual',
    url: '/admin/config/layout',
    icon: Store,
  },
  {
    title: 'Entrega',
    url: '/admin/config/shipping',
    icon: Bike,
  },
  {
    title: 'Impressão',
    url: '/admin/config/printing',
    icon: Printer,
  },
  {
    title: 'Integrações',
    url: '/admin/config/integrations',
    icon: Blocks,
  },
]

export const reports = [
  {
    title: 'Relatórios',
    url: '/admin/reports',
    icon: ChartPie,
  },
]
