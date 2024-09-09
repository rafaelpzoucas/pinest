import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StoreType } from '@/models/store'
import { Edit, Pyramid } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export async function Store({ store }: { store: StoreType | null }) {
  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center gap-3">
        <Avatar className="w-16 h-16">
          <AvatarImage src={store?.logo_url} className="object-scale-down" />
          <AvatarFallback>
            <Pyramid />
          </AvatarFallback>
        </Avatar>
        <div>
          <strong className="capitalize">{store?.name}</strong>
          <p className="text-sm text-muted-foreground capitalize">
            {store?.role}
          </p>
        </div>
      </div>

      <Link
        href={`account/register/store?id=${store?.id}`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>
    </Card>
  )
}
