'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { PurchaseCard } from './purchase-card'

export function Deliveries({
  deliveries,
}: {
  deliveries: PurchaseType[] | null
}) {
  const supabase = createClient()

  const router = useRouter()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || ''

  const searchStr = normalizeString(search)

  const statusFilters = [
    {
      status: 'accept',
      title: 'aguardando',
      status_length: getStatusLengths('accept'),
    },
    {
      status: 'pending',
      title: 'pendente(s)',
      status_length: getStatusLengths('pending'),
    },
    {
      status: 'preparing',
      title: 'em preparo',
      status_length: getStatusLengths('preparing'),
    },
    {
      status: 'shipped',
      title: 'enviado(s)',
      status_length: getStatusLengths('shipped'),
    },
    {
      status: 'delivered',
      title: 'entregue(s)',
      status_length: getStatusLengths('delivered'),
    },
    {
      status: 'cancelled',
      title: 'cancelado(s)',
      status_length: getStatusLengths('cancelled'),
    },
  ]

  function getStatusLengths(status: string) {
    const statusLength = deliveries?.filter(
      (purchase) => purchase.status === status,
    )

    return statusLength?.length
  }

  const filteredDeliveries =
    deliveries &&
    deliveries.filter((delivery) => {
      const { customers, status, id, guest_data: guestData } = delivery

      const matchesSearch =
        normalizeString(customers?.users?.name).includes(searchStr) ||
        normalizeString(customers?.name).includes(searchStr) ||
        normalizeString(guestData?.name).includes(searchStr) ||
        id.includes(searchStr)
      const matchesStatus = statusFilter ? status === statusFilter : true

      return matchesSearch && matchesStatus
    })

  function handleStatusClick(status: string) {
    setStatusFilter((prevStatus) => (prevStatus === status ? '' : status))
  }

  function showNotification() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification('Novo Pedido Recebido', {
          body: 'Clique aqui para visualizar o pedido.',
          icon: '/icon-dark.svg',
        })

        notification.onclick = () => {
          const myWindow = window.open(
            `${process.env.NEXT_PUBLIC_APP_URL}/admin/purchases?tab=deliveries`,
            'pinest',
          )
          if (myWindow) {
            myWindow.focus()
          }
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            showNotification()
          }
        })
      }
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('realtime-purchases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases',
        },
        () => {
          router.refresh()
          showNotification()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  return (
    <section className="flex flex-col gap-4 text-sm">
      <header className="flex flex-col lg:flex-row gap-4">
        <Link
          href="purchases/deliveries/register"
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

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statusFilters.map((filter) => (
          <Card
            key={filter.status}
            className={`p-2 px-4 flex flex-col text-xl
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
        {filteredDeliveries && filteredDeliveries.length > 0 ? (
          filteredDeliveries?.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))
        ) : (
          <div>Não encontramos nenhum resultado para &apos;{search}&apos;</div>
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
