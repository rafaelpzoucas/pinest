import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StoreType } from '@/models/store'
import { Edit } from 'lucide-react'
import Image from 'next/image'

import { DefaultLogo } from '@/components/default-logo'
import { cn, queryParamsLink } from '@/lib/utils'
import Link from 'next/link'

export function Store({ store }: { store: StoreType | null }) {
  return (
    <Card className="relative flex flex-col gap-4 p-4 bg-primary text-primary-foreground">
      <h1 className="font-bold">Loja</h1>

      <div className="grid grid-cols-1 gap-3">
        <div className="relative w-full h-8 max-w-64">
          {store && store.logo_url ? (
            <Image
              src={store.logo_url}
              fill
              alt=""
              className="object-contain object-left"
            />
          ) : (
            <DefaultLogo storeName={store?.name} />
          )}
        </div>
        <div>
          <span className="opacity-80 text-xs">Nome da loja</span>
          <p className="text-sm capitalize">{store?.name}</p>
        </div>
        <div>
          <span className="opacity-80 text-xs">Nicho</span>
          <p className="text-sm capitalize">{store?.role}</p>
        </div>
      </div>

      <Link
        href={`account/register/store?${queryParamsLink(store)}`}
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
