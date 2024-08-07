import { Header } from '@/components/header'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CartPageLoading() {
  return (
    <main className="pb-40">
      <Header title="Finalizar compra" />

      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 py-2 border-b last:border-0">
          <div className="flex flex-row gap-4">
            <Skeleton className="w-3/4 h-4" />
          </div>

          <footer className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <Skeleton className="w-9 h-9" />
              <Skeleton className="w-24 h-9" />
            </div>

            <div className="leading-4 flex flex-col ml-auto items-end">
              <Skeleton className="w-20 h-3" />
            </div>
          </footer>
        </div>
        <div className="flex flex-col gap-2 py-2 border-b last:border-0">
          <div className="flex flex-row gap-4">
            <Skeleton className="w-3/4 h-4" />
          </div>

          <footer className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <Skeleton className="w-9 h-9" />
              <Skeleton className="w-24 h-9" />
            </div>

            <div className="leading-4 flex flex-col ml-auto items-end">
              <Skeleton className="w-20 h-3" />
            </div>
          </footer>
        </div>
        <div className="flex flex-col gap-2 py-2 border-b last:border-0">
          <div className="flex flex-row gap-4">
            <Skeleton className="w-3/4 h-4" />
          </div>

          <footer className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <Skeleton className="w-9 h-9" />
              <Skeleton className="w-24 h-9" />
            </div>

            <div className="leading-4 flex flex-col ml-auto items-end">
              <Skeleton className="w-20 h-3" />
            </div>
          </footer>
        </div>

        <Link href={'#'} className={cn(buttonVariants({ variant: 'outline' }))}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar itens
        </Link>
      </section>
    </main>
  )
}
