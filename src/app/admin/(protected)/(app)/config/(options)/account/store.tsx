import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StoreType } from '@/models/store'
import { Edit, Plus, Pyramid } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { readSocials } from './register/socials/actions'

export async function Store({ store }: { store: StoreType | null }) {
  const { socials, readSocialsError } = await readSocials()

  if (readSocialsError) {
    console.error(readSocialsError)
  }

  const storeNiche = store && store.market_niches[0]

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center gap-3">
        <Avatar className="w-20 h-20">
          <AvatarImage src={store?.logo_url} className="object-scale-down" />
          <AvatarFallback>
            <Pyramid />
          </AvatarFallback>
        </Avatar>
        <div>
          <strong className="capitalize">{store?.name}</strong>
          <p className="text-sm text-muted-foreground capitalize">
            {storeNiche?.name}
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

      <section className="space-y-2">
        <h3 className="text-lg font-bold">Redes sociais</h3>

        <div>
          {socials &&
            socials.map((media) => <p key={media.id}>{media.link}</p>)}
        </div>

        <Link
          href="account/register/socials"
          className={buttonVariants({ variant: 'outline' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar rede social
        </Link>
      </section>
    </Card>
  )
}
