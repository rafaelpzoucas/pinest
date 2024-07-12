import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Pyramid } from 'lucide-react'
import { getStoreByStoreURL } from '../../actions'
import { Menu } from './menu'

export default async function Header({
  params,
}: {
  params: { public_store: string }
}) {
  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  return (
    <header className="flex items-center justify-center w-full p-2">
      <Card className="relative flex flex-col items-center gap-2 w-full max-w-lg p-4 py-4 bg-secondary/30 border-0">
        <Avatar className="w-16 h-16">
          <AvatarImage src={store?.logo_url} />
          <AvatarFallback>
            <Pyramid />
          </AvatarFallback>
        </Avatar>

        <div className="text-center w-full max-w-72">
          <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
          {store?.description && (
            <p className="text-xs text-muted-foreground">
              {store?.description}
            </p>
          )}
        </div>

        <Menu />
      </Card>
    </header>
  )
}
