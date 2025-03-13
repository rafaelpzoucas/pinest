'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { PurchaseType } from '@/models/purchase'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { PurchaseCard } from './purchase-card'

export function Purchases({ purchases }: { purchases: PurchaseType[] | null }) {
  const supabase = createClient()

  const router = useRouter()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || ''

  const searchStr = normalizeString(search)

  const statusFilters = [
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
    const statusLength = purchases?.filter(
      (purchase) => purchase.status === status,
    )

    return statusLength?.length
  }

  const filteredPurchases =
    purchases &&
    purchases.filter((purchase) => {
      const { customers, status, id, guest_data: guestData } = purchase

      const matchesSearch =
        normalizeString(customers?.users.name).includes(searchStr) ||
        id.includes(searchStr)
      const matchesStatus = statusFilter ? status === statusFilter : true

      return matchesSearch && matchesStatus
    })

  function handleStatusClick(status: string) {
    setStatusFilter((prevStatus) => (prevStatus === status ? '' : status))
  }

  // if (purchases && purchases.length === 0) {
  //   return (
  //     <div
  //       className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
  //         mx-auto"
  //     >
  //       <Scroll className="w-20 h-20" />
  //       <p className="text-muted-foreground">Nenhum pedido registrado</p>
  //     </div>
  //   )
  // }

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
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  return (
    <section className="flex flex-col gap-4 text-sm">
      {/* <CreatePurchaseSheet /> */}

      <div className="relative">
        <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

        <Input
          placeholder="Buscar pedido..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
        Exibindo {filteredPurchases?.length} pedido(s)
      </span>

      <div className="lg:hidden flex flex-col gap-2">
        {filteredPurchases && filteredPurchases.length > 0 ? (
          filteredPurchases?.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))
        ) : (
          <div>Não encontramos nenhum resultado para &apos;{search}&apos;</div>
        )}
      </div>

      <div className="hidden lg:flex w-full">
        {filteredPurchases && (
          <DataTable columns={columns} data={filteredPurchases} />
        )}
      </div>
    </section>
  )
}
