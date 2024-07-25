import { CartProductType } from '@/models/cart'
import { Metadata } from 'next'
import { getStoreByStoreURL } from './actions'
import { getCart } from './cart/actions'
import { MobileNavigation } from './mobile-navigation'
import NotFound from './not-found'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

type PublicStoreLayoutProps = {
  header: React.ReactNode
  children: React.ReactNode
  params: { public_store: string }
}

export default async function PublicStoreLayout({
  header,
  children,
  params,
}: PublicStoreLayoutProps) {
  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  if (storeError) {
    console.log(storeError)
  }

  if (!store) {
    return <NotFound />
  }

  const bagItems: CartProductType[] = await getCart(params.public_store)

  return (
    <div className="flex lg:flex-row items-center justify-center p-4 pb-20">
      <div className="w-full lg:max-w-7xl">
        {header}

        {children}

        <MobileNavigation bagItems={bagItems} />
      </div>
    </div>
  )
}
