'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { Pyramid } from 'lucide-react'
import { SearchSheet } from '../(app)/@search/search-sheet'
import { PublicStoreNavigation } from '../navigation'

type HeaderPropsType = {
  userData: any
  storeUrl: string
  store: StoreType | null
  bagItems: CartProductType[]
  connectedAccount: any
}

export default async function Header({
  userData,
  store,
  storeUrl,
  bagItems,
  connectedAccount,
}: HeaderPropsType) {
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
          <SearchSheet publicStore={storeUrl} />
        </div>

        <PublicStoreNavigation
          bagItems={bagItems}
          connectedAccount={connectedAccount}
          userData={userData}
        />
      </Card>
    </header>
  )
}
