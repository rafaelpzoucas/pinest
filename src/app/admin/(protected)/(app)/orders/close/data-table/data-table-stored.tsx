'use client'

import { OrderItemsType } from '@/models/order'
import { useCloseBillStore } from '@/stores/closeBillStore'
import { useEffect } from 'react'
import { columns } from './columns'
import { DataTable } from './table'

export function DataTableStored({ data }: { data: OrderItemsType[] }) {
  const { items, setItems } = useCloseBillStore()

  useEffect(() => {
    setItems(data)
  }, [])

  return <DataTable data={items} columns={columns} />
}
