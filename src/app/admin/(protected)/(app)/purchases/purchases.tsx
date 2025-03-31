'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PurchaseType } from '@/models/purchase'
import { TableType } from '@/models/table'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { MdSportsMotorsports, MdTableBar } from 'react-icons/md'
import { Deliveries } from './deliveries/deliveries'
import { Tables } from './tables/tables'

export function Purchases({
  purchases,
  tables,
}: {
  purchases: PurchaseType[] | null
  tables: TableType[] | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTab = searchParams.get('tab')

  useEffect(() => {
    router.push('?tab=deliveries')
  }, [])

  return (
    <Tabs
      defaultValue={currentTab ?? 'deliveries'}
      onValueChange={(e) => router.push(`?tab=${e}`)}
    >
      <TabsList className="h-fit">
        <TabsTrigger value="deliveries" className="px-6 py-3">
          <MdSportsMotorsports className="mr-2" />
          Entregas
        </TabsTrigger>
        <TabsTrigger value="tables" className="px-6 py-3">
          <MdTableBar className="mr-2" />
          Mesas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deliveries">
        <Deliveries deliveries={purchases} />
      </TabsContent>
      <TabsContent value="tables">
        <Tables tables={tables} />
      </TabsContent>
    </Tabs>
  )
}
