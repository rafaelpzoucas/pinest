'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildProductsSoldReportESCPOS } from '@/lib/receipts'
import { formatCurrencyBRL } from '@/lib/utils'
import { Printer } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { printReportReceipt } from '../config/printing/actions'

export type ProductsSoldReportType =
  | {
      name: string
      quantity: number
      totalAmount: number
    }[]
  | undefined

export function ProductsSoldReport({ data }: { data: ProductsSoldReportType }) {
  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printReportReceipt)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Produtos vendidos</CardTitle>

        {data && data.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              executePrintReceipt({
                raw: buildProductsSoldReportESCPOS(data),
              })
            }
            disabled={isPrinting}
          >
            <Printer className="w-4 h-4" />
          </Button>
        )}
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
