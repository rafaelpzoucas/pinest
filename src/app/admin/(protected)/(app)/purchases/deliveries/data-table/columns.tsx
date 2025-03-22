'use client'

import { StatusKey } from '@/app/[public_store]/purchases/[id]/status'
import { Badge } from '@/components/ui/badge'
import { cn, formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import {
  CustomersType,
  PurchaseItemsType,
  PurchaseType,
} from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { GuestType } from '@/models/user'
import { ColumnDef } from '@tanstack/react-table'
import { PurchaseOptions } from './options'
import Image from 'next/image'
import { IfoodOrder } from '@/models/ifood'
import { addHours, addMinutes, format, parseISO } from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'

export const columns: ColumnDef<PurchaseType>[] = [
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return formatDate(date, 'dd/MM - HH:mm:ss')
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const isIfood = row.original.is_ifood
      const ifoodOrderData: IfoodOrder =
        isIfood && row.original.ifood_order_data
      const deliveryDateTime = addHours(
        ifoodOrderData?.delivery?.deliveryDateTime,
        3,
      )
      const preparationStartDateTime = addHours(
        ifoodOrderData?.preparationStartDateTime,
        3,
      )

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
                <Badge className="flex flex-col w-fit bg-secondary text-secondary-foreground">
                  <span>INICIAR PREPARO</span>
                  <span>{format(preparationStartDateTime, 'dd/MM HH:mm')}</span>
                </Badge>
              </div>
            )}
        </div>
      )
    },
  },
  {
    accessorKey: 'customers',
    header: 'Cliente',
    cell: ({ row }) => {
      const purchase = row.original
      const customer = row.getValue('customers') as CustomersType
      const guest = purchase.guest_data as GuestType
      const type = purchase.type
      const customerAddress = ((purchase.addresses
        ? formatAddress(purchase.addresses)
        : purchase.guest_data?.address) ?? purchase.customers.address) as string

      return (
        <div className="max-w-[280px]">
          <p className="capitalize">
            {(
              customer?.users?.name ??
              customer?.name ??
              guest?.name
            ).toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            {type === 'DELIVERY' ? customerAddress : 'Retirada na loja'}
          </p>
        </div>
      )
    },
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
  },
  {
    accessorKey: 'change_value',
    header: 'Troco',
    cell: ({ row }) => {
      const changeValue = row.getValue('change_value') as number
      const totalAmount = row.getValue('total_amount') as number
      const ifoodOrderData: IfoodOrder =
        row.original.is_ifood && row.original?.ifood_order_data
      const ifoodCashChangeAmount = ifoodOrderData?.payments.methods[0].cash
        ? ifoodOrderData.payments.methods[0].cash.changeFor
        : 0

      return changeValue ? (
        formatCurrencyBRL((ifoodCashChangeAmount || changeValue) - totalAmount)
      ) : (
        <p>-</p>
      )
    },
  },
  {
    accessorKey: 'discount',
    header: 'Desconto',
    cell: ({ row }) => {
      const discount = row.getValue('discount') as number

      return discount ? formatCurrencyBRL(discount) : <p>-</p>
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Total',
    cell: ({ row }) => {
      const totalAmount = row.getValue('total_amount') as number
      const discount = row.original.discount ?? 0

      return (
        <div>
          {discount > 0 && (
            <span className="line-through text-xs text-muted-foreground">
              {formatCurrencyBRL(totalAmount)}
            </span>
          )}
          <p>{formatCurrencyBRL(totalAmount - discount)}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => {
      const currentStatus = row.original.status as string
      const accepted = row.original.accepted
      const type = row.original.type

      return (
        <PurchaseOptions
          accepted={accepted}
          purchaseId={row.getValue('id')}
          currentStatus={currentStatus}
          type={type}
        />
      )
    },
  },
]
