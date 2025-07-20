import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'
import Link from 'next/link'
import { readCoupons } from './coupons/actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'

export default async function PromotionsPage() {
  const [result] = await readCoupons()
  const coupons = result?.coupons || []

  return (
    <main className="p-4 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-lg font-bold">Cupons de Desconto</h1>
        <Link href="promotions/coupons/register">
          <Button>Novo Cupom</Button>
        </Link>
      </div>
      <div className="mt-6">
        {coupons.length === 0 ? (
          <section className="space-y-6">
            <div
              className="w-full h-full flex flex-col gap-6 items-center justify-center
                text-muted-foreground text-center"
            >
              <Ticket className="w-32 h-32" />
              <p className="max-w-md">
                Não há cupons cadastrados. Crie um novo para realizar promoções.
              </p>
            </div>
          </section>
        ) : (
          <DataTable columns={columns} data={coupons} />
        )}
      </div>
    </main>
  )
}
