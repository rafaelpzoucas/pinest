import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingBag as Bag } from 'lucide-react'

export default async function ShoppingBagLoading() {
  return (
    <Card className="flex flex-row items-center gap-3 p-3 w-full text-sm bg-primary text-primary-foreground">
      <Bag className="w-5 h-5" />
      <strong>
        Ver sacola (<Skeleton className="w-5 h-3" />)
      </strong>

      <strong className="ml-auto">
        <Skeleton className="w-20 h-[0.875rem]" />
      </strong>
    </Card>
  )
}
