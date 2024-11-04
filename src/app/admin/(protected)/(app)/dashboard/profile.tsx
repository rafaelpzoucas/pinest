import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatAddress } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { ExternalLink, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export async function ProfileCard({ store }: { store: StoreType }) {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{store?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <span className="flex flex-row gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {formatAddress(store?.addresses[0])}
        </span>
        <span className="flex flex-row gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          {store?.phone}
        </span>
        <Link
          href={`/${store?.store_url}`}
          target="_blank"
          className={cn(buttonVariants(), 'w-full')}
        >
          Ver minha loja
          <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </CardContent>
    </Card>
  )
}
