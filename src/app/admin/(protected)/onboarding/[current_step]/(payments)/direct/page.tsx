import { readOwnShipping } from '@/app/admin/(protected)/(app)/config/(options)/shipping/actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function Payments() {
  const { shipping } = await readOwnShipping()

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Configurar Pagamentos</h1>

      <Link
        href="/admin/onboarding/shipping/own"
        className={cn(buttonVariants(), 'w-fit ml-auto')}
      >
        Configurar entrega
      </Link>
    </div>
  )
}
