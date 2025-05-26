'use client'

import { StatusKey } from '@/app/[public_store]/purchases/[id]/status'
import { Badge } from '@/components/ui/badge'
import { cn, formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import Image from 'next/image'
import { PurchaseOptions } from './options'

export const columns: ColumnDef<PurchaseType>[] = [
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return formatDate(date, 'dd/MM - HH:mm:ss')
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const isIfood = row.original.is_ifood
      const ifoodOrderData: IfoodOrder =
        isIfood && row.original.ifood_order_data
      const deliveryDateTime = ifoodOrderData?.delivery?.deliveryDateTime
      const preparationStartDateTime = ifoodOrderData?.preparationStartDateTime

      return (
        <div className="flex flex-col gap-3 items-center justify-center">
          <div className="flex flex-row items-center gap-2">
            <span>
              {isIfood && (
                <Image src="/ifood.png" alt="" width={30} height={15} />
              )}
            </span>

            <span>
              {row.original.type === 'DELIVERY' ? 'Entrega' : 'Retirada'}
            </span>
          </div>

          {ifoodOrderData &&
            preparationStartDateTime &&
            ifoodOrderData.orderTiming === 'SCHEDULED' && (
              <div className="flex flex-row gap-2">
                <Badge className="flex flex-col w-fit">
                  <span>AGENDADO</span>
                  <span>{format(deliveryDateTime, 'dd/MM HH:mm')}</span>
                </Badge>
                <Badge className="flex flex-col w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
                  <span>INICIAR PREPARO</span>
                  <span>{format(preparationStartDateTime, 'dd/MM HH:mm')}</span>
                </Badge>
              </div>
            )}
        </div>
      )
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'store_customers',
    header: 'Cliente',
    cell: ({ row }) => {
      const purchase = row.original
      const isIfood = purchase.is_ifood

      const customer = isIfood
        ? purchase.ifood_order_data.customer
        : purchase.store_customers.customers
      const type = purchase.type
      const customerAddress = isIfood
        ? (purchase.delivery.address as unknown as string)
        : formatAddress(purchase.store_customers.customers.address)
      return (
        <div className="max-w-[280px]">
          <p className="capitalize">{(customer?.name).toLowerCase()}</p>
          <p className="text-xs text-muted-foreground">
            {type === 'DELIVERY' ? customerAddress : 'Retirada na loja'}
          </p>
        </div>
      )
    },
    meta: { clickable: true },
  },

  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge className={cn(statuses[status as StatusKey].color)}>
          {statuses[status as StatusKey].status}
        </Badge>
      )
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'change_value',
    header: 'Troco',
    cell: ({ row }) => {
      const isIfood = row.original.is_ifood
      const changeValue = row.original?.total?.change_value ?? 0
      const totalAmount = row.original?.total?.total_amount ?? 0
      const ifoodOrderData: IfoodOrder =
        isIfood && row.original?.ifood_order_data
      const ifoodCashChangeAmount =
        isIfood && ifoodOrderData?.payments.methods[0].cash
          ? ifoodOrderData.payments.methods[0].cash.changeFor
          : 0

      return changeValue ? (
        formatCurrencyBRL((ifoodCashChangeAmount || changeValue) - totalAmount)
      ) : (
        <p>-</p>
      )
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'discount',
    header: 'Desconto',
    cell: ({ row }) => {
      const discount = row.original?.total?.discount

      return discount ? formatCurrencyBRL(discount) : <p>-</p>
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const purchase = row.original

      const totalAmount = purchase?.total?.total_amount

      return (
        <div>
          <p>{formatCurrencyBRL(totalAmount)}</p>
        </div>
      )
    },
    meta: { clickable: true },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => {
      const currentStatus = row.original.status as string
      const type = row.original.type
      const isIfood = row.original.is_ifood ?? false

      return (
        <PurchaseOptions
          purchaseId={row.getValue('id')}
          currentStatus={currentStatus}
          type={type}
          isIfood={isIfood}
        />
      )
    },
  },
]
