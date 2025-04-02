import { formatCurrencyBRL } from '@/lib/utils'
import { PAYMENT_TYPES } from '@/models/purchase'
import { SalesReportType } from '../../sales-report'

export function SalesReportPrint({ data }: { data: SalesReportType }) {
  return (
    <div className="w-full">
      {data?.totalAmount ? (
        <>
          <div className="flex flex-col gap-2">
            <h2>Entregas</h2>

            <div>
              <p className="flex justify-between py-2 border-b border-dashed last:border-none">
                <span>Total de entregas</span>
                <span>{data.deliveriesCount}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2>Métodos de pagamento</h2>

            <div>
              {data && data.totalAmount && (
                <p className="flex justify-between py-2 border-b border-dashed last:border-none">
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
        <p className="text-center text-sm">
          Nenhum resultado encontrado para o período selecionado.
        </p>
      )}
    </div>
  )
}
