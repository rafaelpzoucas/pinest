import { StoreSocials } from '@/app/old-store/(app)/footer/socials'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { Edit } from 'lucide-react'
import Link from 'next/link'

export function Socials({ store }: { store?: StoreType }) {
  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <h3 className="text-lg font-bold">Redes sociais</h3>

      {store && <StoreSocials />}

      <Link
        href={`layout/register/socials`}
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
