'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderType } from '@/models/order'
import { TableType } from '@/models/table'
import { useQueryState } from 'nuqs'
import { MdSportsMotorsports, MdTableBar } from 'react-icons/md'
import { Deliveries } from './deliveries/deliveries'
import { Tables } from './tables/tables'

export function Orders({
  orders,
  tables,
}: {
  orders: OrderType[] | null
  tables: TableType[] | null
}) {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'deliveries',
    history: 'replace',
  })

  return (
    <Tabs value={tab} onValueChange={setTab}>
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
        <Deliveries deliveries={orders} />
      </TabsContent>
      <TabsContent value="tables">
        <Tables tables={tables} />
      </TabsContent>
    </Tabs>
  )
}
