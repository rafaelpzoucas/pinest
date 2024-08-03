'use client'

import { SearchSheet } from '@/app/[public_store]/(app)/@search/search-sheet'
import { PublicStoreNavigation } from '@/app/[public_store]/navigation'
import { Button } from '@/components/ui/button'
import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { ArrowLeft, Pyramid } from 'lucide-react'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card } from '../ui/card'

type HeaderPropsType = {
  store?: StoreType | null
  title?: string
  cartProducts?: CartProductType[]
  connectedAccount?: any
  userData?: any
}

export function Header({
  title,
  store,
  cartProducts,
  connectedAccount,
  userData,
}: HeaderPropsType) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const pathname = usePathname()

  const callback = searchParams.get('callback')

  const storeUrl = params.public_store as unknown as string

  function redirect() {
    if (callback) {
      router.push(`/${storeUrl}`)
    } else {
      router.back()
    }
  }

  return (
    <header className="flex items-center justify-center w-full">
      <Card className="flex flex-row items-center justify-between gap-2 w-full p-2 lg:p-4 bg-secondary/50 border-0">
        <div className="flex flex-col items-center lg:flex-row gap-4">
          {pathname !== `/${storeUrl}` && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={redirect}
              className="lg:hidden w-full max-w-9 h-9 aspect-square"
            >
              <ArrowLeft />
            </Button>
          )}

          <Avatar className="hidden lg:block lg:w-12 lg:h-12">
            <AvatarImage src={store?.logo_url} />
            <AvatarFallback>
              <Pyramid className="w-4 h-4 lg:w-6 lg:h-6" />
            </AvatarFallback>
          </Avatar>

          <div className="hidden lg:flex text-center lg:text-left w-full max-w-72">
            <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
          </div>
        </div>

        {title && <h1 className="lg:hidden text-center font-bold">{title}</h1>}

        <SearchSheet publicStore={storeUrl} />

        <div className="hidden lg:block">
          {cartProducts && connectedAccount && userData && (
            <PublicStoreNavigation
              cartProducts={cartProducts}
              connectedAccount={connectedAccount}
              userData={userData}
            />
          )}
        </div>
      </Card>
    </header>
  )
}
