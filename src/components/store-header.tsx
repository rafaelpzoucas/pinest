'use client'

import { SearchSheet } from '@/app/[public_store]/(app)/search/search-sheet'
import { PublicStoreNavigation } from '@/app/[public_store]/navigation'
import { Button } from '@/components/ui/button'
import { createPath, getRootPath } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { ArrowLeft } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card } from './ui/card'

type HeaderPropsType = {
  store?: StoreType | null
  title?: string
  cartProducts?: CartProductType[] | null
  connectedAccount?: any
  userData?: any
  storeSubdomain?: string
}

export function Header({
  title,
  store,
  cartProducts,
  connectedAccount,
  userData,
  storeSubdomain,
}: HeaderPropsType) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const callback = searchParams.get('callback') as string

  const rootPath = getRootPath(storeSubdomain)

  const CALLBACK_URLS = {
    home: `${rootPath ?? ''}`,
    purchases: createPath('/purchases?callback=home', storeSubdomain),
  }

  function redirect() {
    if (callback) {
      router.push(`/${CALLBACK_URLS[callback as keyof typeof CALLBACK_URLS]}`)
    } else {
      router.back()
    }
  }

  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', {
    store,
  })

  return (
    <header className="flex items-center justify-center w-full">
      <Card
        className="flex flex-row items-center justify-between gap-2 w-full p-2 lg:p-4
          bg-secondary/50 border-0"
      >
        <div className="flex flex-col items-center lg:flex-row gap-4 lg:w-full max-w-xs">
          {pathname !== `/${rootPath}` && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={redirect}
              className="w-full max-w-9 h-9 aspect-square"
            >
              <ArrowLeft />
            </Button>
          )}

          <div className="hidden lg:flex text-center lg:text-left w-full max-w-72">
            <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
          </div>
        </div>

        {title && <h1 className="lg:hidden text-center font-bold">{title}</h1>}

        <SearchSheet subdomain={storeSubdomain} />

        {cartProducts && connectedAccount && userData && (
          <div className="hidden lg:block">
            <PublicStoreNavigation
              cartProducts={cartProducts}
              connectedAccount={connectedAccount}
              userData={userData}
              storeSubdomain={store?.store_subdomain}
            />
          </div>
        )}
      </Card>
    </header>
  )
}
