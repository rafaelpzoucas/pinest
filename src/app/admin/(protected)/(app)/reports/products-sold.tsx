'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { Printer } from 'lucide-react'
import Link from 'next/link'

export type ProductsSoldReportType =
  | {
      name: string
      quantity: number
      totalAmount: number
    }[]
  | undefined

export function ProductsSoldReport({
  data,
  startDate,
  endDate,
}: {
  data: ProductsSoldReportType
  startDate: string
  endDate: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Produtos vendidos</CardTitle>
        <Link
          href={`reports/print/products-sold?start_date=${startDate}&end_date=${endDate}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          target="_blank"
        >
          <Printer className="w-4 h-4" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <p
                key={index}
                className="grid grid-cols-3 py-2 border-b border-dashed last:border-none text-lg"
              >
                <span>{item.name}</span>
                <span className="text-right">{item.quantity} un.</span>
                <span className="text-right">
                  {formatCurrencyBRL(item.totalAmount)}
                </span>
              </p>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para o período selecionado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
