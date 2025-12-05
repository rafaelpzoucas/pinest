'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildSalesReportESCPOS } from '@/lib/receipts'
import { formatCurrencyBRL } from '@/lib/utils'
import { PAYMENT_TYPES } from '@/models/order'
import { Loader2, Printer } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { printReportReceipt } from '../config/printing/actions'

export type SalesReportType =
  | {
      deliveriesCount: number | null
      totalAmount: number | null
      paymentTypes: { [key: string]: number }
    }
  | undefined

export function SalesReport({ data }: { data: SalesReportType }) {
  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printReportReceipt)

  return (
    <Card className="h-auto max-w-full break-inside-avoid">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Relatório de Vendas</CardTitle>

        {data?.totalAmount && data?.totalAmount > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              executePrintReceipt({
                raw: buildSalesReportESCPOS(data),
              })
            }
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {data?.totalAmount ? (
          <>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg">Entregas</h2>

              <div className="text-muted-foreground">
                <p className="flex justify-between py-2 border-b border-dashed last:border-none text-lg">
                  <span>Total de entregas</span>
                  <span>{data.deliveriesCount}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg">Métodos de pagamento</h2>

              <div className="text-muted-foreground">
                {data && data.totalAmount && (
                  <p className="flex justify-between py-2 border-b border-dashed last:border-none text-lg">
                    <span>Total de vendas</span>
                    <span>{formatCurrencyBRL(data.totalAmount)}</span>
                  </p>
                )}
                {data &&
                  data.paymentTypes &&
                  Object.entries(data.paymentTypes).map(([key, value]) => (
                    <p
                      key={key}
                      className="flex justify-between py-2 border-b border-dashed last:border-none"
                    >
                      <span>
                        {PAYMENT_TYPES[key as keyof typeof PAYMENT_TYPES]}
                      </span>
                      <span>{formatCurrencyBRL(value)}</span>
                    </p>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado para o período selecionado.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
