import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function PickupOptionsLoading() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Card className="flex flex-col gap-2 p-4 w-full">
        <div className="space-y-2">
          <header className="flex flex-row items-center justify-between">
            <strong className="text-sm">Entregar no meu endereço</strong>

            <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
              <p>
                <Skeleton className="w-14 h-3" />
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </header>

          <Skeleton className="w-full h-4" />
          <Skeleton className="w-1/2 h-4" />
        </div>

        <Link href={``}>
          <footer className="border-t pt-4 pb-1 mt-2 text-sm">
            <Skeleton className="w-full h-4" />
          </footer>
        </Link>
      </Card>

      <Card className="flex flex-col gap-2 p-4 w-full">
        <Link href={``} className="space-y-2">
          <header className="flex flex-row items-center justify-between">
            <strong className="text-sm">Retirar na loja</strong>

            <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
              <p>Grátis</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </header>

          <Skeleton className="w-full h-4" />
          <Skeleton className="w-1/2 h-4" />
        </Link>

        <Link href="">
          <footer className="border-t pt-4 pb-1 mt-2 text-sm">
            <strong>Ver localização</strong>
          </footer>
        </Link>
      </Card>
    </div>
  )
}
