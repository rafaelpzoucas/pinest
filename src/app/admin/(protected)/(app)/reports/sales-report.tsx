'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { PAYMENT_TYPES } from '@/models/purchase'
import { Printer } from 'lucide-react'
import Link from 'next/link'

export type SalesReportType =
  | {
      deliveriesCount: number | null
      totalAmount: number | null
      paymentTypes: { [key: string]: number }
    }
  | undefined

export function SalesReport({
  data,
  startDate,
  endDate,
}: {
  data: SalesReportType
  startDate: string
  endDate: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Relatório de Vendas</CardTitle>

        <Link
          href={`reports/print/sales?start_date=${startDate}&end_date=${endDate}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          target="_blank"
        >
          <Printer className="w-4 h-4" />
        </Link>
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
