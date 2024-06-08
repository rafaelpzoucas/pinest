import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { ProductCard } from '../(app)/components/product-card'

export default async function SearchPageLoading() {
  return (
    <div>
      <header className="flex flex-row p-4 gap-2">
        <div
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'w-full max-w-9',
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </div>

        <Input type="search" placeholder="Buscar na loja..." />
      </header>

      <div className="pl-4">
        <Skeleton className="w-1/2 h-3" />
      </div>

      <section className="flex flex-col gap-8 pt-4 pb-16">
        <div className="flex flex-col px-4">
          <div className="grid grid-cols-2 gap-4">
            <ProductCard variant={'featured'} />
            <ProductCard variant={'featured'} />
            <ProductCard variant={'featured'} />
            <ProductCard variant={'featured'} />
            <ProductCard variant={'featured'} />
          </div>
        </div>
      </section>
    </div>
  )
}
