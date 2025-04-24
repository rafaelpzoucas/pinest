import { formatCurrencyBRL } from '@/lib/utils'
import { ProductsSoldReportType } from '../../products-sold'

export function ProductsSoldReportPrint({
  data,
}: {
  data: ProductsSoldReportType
}) {
  return (
    <div className="w-full">
      <header className="flex flex-col items-center justify-center w-full">
        <h1 className="uppercase">Produtos vendidos</h1>
      </header>

      {data && data.length > 0 ? (
        data.map((item, index) => (
          <p
            key={index}
            className="grid grid-cols-3 py-2 border-b border-dashed last:border-none"
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
  )
}
