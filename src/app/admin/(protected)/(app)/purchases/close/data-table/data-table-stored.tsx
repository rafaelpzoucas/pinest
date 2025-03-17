'use client'

import { PurchaseItemsType } from '@/models/purchase'
import { useCloseBillStore } from '@/stores/closeBillStore'
import { useEffect } from 'react'
import { columns } from './columns'
import { DataTable } from './table'

export function DataTableStored({ data }: { data: PurchaseItemsType[] }) {
  const { items, setItems } = useCloseBillStore()

  useEffect(() => {
    setItems(data)
  }, [])

  return <DataTable data={items} columns={columns} />
}
