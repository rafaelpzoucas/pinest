import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { Pyramid } from 'lucide-react'
import { SearchSheet } from '../(app)/@search/search-sheet'
import { getStoreByStoreURL } from '../actions'
import { getCart, getConnectedAccountByStoreUrl } from '../cart/actions'
import { PublicStoreNavigation } from '../navigation'

export default async function Header({
  params,
}: {
  params: { public_store: string }
}) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(params.public_store)
  const bagItems: CartProductType[] = await getCart(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const connectedAccount = await getConnectedAccountByStoreUrl(
    params.public_store,
  )

  return (
    <header className="flex items-center justify-center w-full">
      <Card className="flex flex-row items-center justify-between gap-2 w-full p-4 py-4 bg-secondary/50 border-0">
        <div className="flex flex-col items-center lg:flex-row gap-4 w-full max-w-sm">
          <Avatar className="w-24 h-24 lg:w-16 lg:h-16">
            <AvatarImage src={store?.logo_url} />
            <AvatarFallback>
              <Pyramid />
            </AvatarFallback>
          </Avatar>

          <div className="text-center lg:text-left w-full max-w-72">
            <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
            {store?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {store?.description}
              </p>
            )}
          </div>
        </div>

        <div className="hidden lg:flex w-full max-w-xs">
          <SearchSheet publicStore={params.public_store} />
        </div>

        <PublicStoreNavigation
          bagItems={bagItems}
          connectedAccount={connectedAccount?.data}
          userData={userData}
        />
      </Card>
    </header>
  )
}
