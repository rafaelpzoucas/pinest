'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { OrderType } from '@/models/order'
import { useCashRegister } from '@/stores/cashRegisterStore'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { readCashSession } from '../../cash-register/actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { OrderCard } from './order-card'

type OrderStatus =
  | 'accept'
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export function Deliveries({ deliveries }: { deliveries: OrderType[] | null }) {
  const supabase = createClient()

  const router = useRouter()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('in_progress')

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || ''

  const searchStr = normalizeString(search)

  const statusFilters = [
    {
      status: 'in_progress',
      title: 'andamento',
      status_length: getStatusLengths([
        'accept',
        'pending',
        'preparing',
        'shipped',
        'readyToPickup',
      ]),
    },
    {
      status: 'delivered',
      title: 'finalizada(s)',
      status_length: getStatusLengths(['delivered']),
    },
    {
      status: 'cancelled',
      title: 'cancelada(s)',
      status_length: getStatusLengths(['cancelled']),
    },
  ]

  function getStatusLengths(statuses: string[]) {
    return (
      deliveries?.filter((delivery) => {
        const isDelivered = statuses.includes('delivered')
        const isInProgress =
          statuses.includes('accept') ||
          statuses.includes('pending') ||
          statuses.includes('preparing') ||
          statuses.includes('shipped') ||
          statuses.includes('readyToPickup')

        if (isDelivered && !isInProgress) {
          // contagem para "Finalizadas"
          return delivery.status === 'delivered' && delivery.is_paid === true
        }

        if (isInProgress) {
          // contagem para "Em andamento", incluindo delivered não pago
          return (
            statuses.includes(delivery.status) ||
            (delivery.status === 'delivered' && delivery.is_paid === false)
          )
        }

        // fallback
        return statuses.includes(delivery.status)
      }).length || 0
    )
  }

  const filteredDeliveries = deliveries?.filter((delivery) => {
    const { store_customers: storeCustomers, status, id } = delivery

    const matchesSearch =
      normalizeString(storeCustomers?.customers?.name).includes(searchStr) ||
      id.includes(searchStr)

    const matchesStatus =
      statusFilter === 'in_progress'
        ? [
            'accept',
            'pending',
            'preparing',
            'shipped',
            'readyToPickup',
          ].includes(status) ||
          (status === 'delivered' && delivery.is_paid === false)
        : statusFilter === 'delivered'
          ? status === 'delivered' && delivery.is_paid === true
          : statusFilter
            ? status === statusFilter
            : true

    return matchesSearch && matchesStatus
  })

  function handleStatusClick(status: string) {
    setStatusFilter((prevStatus) => (prevStatus === status ? '' : status))
  }

  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const { setIsCashOpen } = useCashRegister()

  const { execute, data } = useServerAction(readCashSession, {
    onSuccess: () => {
      const isOpen = !!data?.cashSession

      setIsCashOpen(isOpen)
    },
  })

  async function handleReadCashSession() {
    await execute()
  }

  useEffect(() => {
    handleReadCashSession()
  }, [])

  return (
    <section className="flex flex-col gap-4 text-sm pb-16">
      <header className="flex flex-col lg:flex-row gap-4">
        <Link
          href="orders/deliveries/register"
          className={cn(buttonVariants(), 'w-full max-w-sm')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar pedido
        </Link>

        <div className="relative w-full">
          <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Buscar pedido..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {statusFilters.map((filter) => (
          <Card
            key={filter.status}
            className={`p-2 px-4 flex flex-col text-xl select-none cursor-pointer
            ${statusFilter === filter.status ? 'border-primary' : ''}`}
            onClick={() => handleStatusClick(filter.status)}
          >
            <strong>{filter.status_length}</strong>
            <span className="text-xs text-muted-foreground">
              {filter.title}
            </span>
          </Card>
        ))}
      </section>

      <span className="text-xs text-muted-foreground">
        Exibindo {filteredDeliveries?.length} pedido(s)
      </span>

      <div className="lg:hidden flex flex-col gap-2">
        {filteredDeliveries && filteredDeliveries.length > 0
          ? filteredDeliveries?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          : search !== '' && (
              <div>
                Não encontramos nenhum resultado para &apos;{search}&apos;
              </div>
            )}
      </div>

      <div className="hidden lg:flex w-full">
        {filteredDeliveries && (
          <DataTable columns={columns} data={filteredDeliveries} />
        )}
      </div>
    </section>
  )
}
