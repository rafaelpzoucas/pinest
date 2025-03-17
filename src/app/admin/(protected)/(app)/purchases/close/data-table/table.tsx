'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PurchaseItemsType } from '@/models/purchase'
import { useCloseBillStore } from '@/stores/closeBillStore'
import { useEffect } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { rowSelection, setRowSelection, items, setItems } = useCloseBillStore()

  const unpaidItems = (items as PurchaseItemsType[]).filter(
    (item) => !item.is_paid,
  )

  const defaultSelection = unpaidItems.reduce(
    (acc, _, index) => {
      acc[index] = true
      return acc
    },
    {} as Record<number, boolean>,
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  useEffect(() => {
    setItems(data as unknown as PurchaseItemsType[])
    setRowSelection(defaultSelection)
  }, [])

  return (
    <div className="rounded-md w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isPaid = (row.original as { is_paid: boolean }).is_paid

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(isPaid && 'opacity-30 cursor-not-allowed')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="pt-2 text-xs text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} produto(s)
        selecionado(s).
      </div>
    </div>
  )
}
