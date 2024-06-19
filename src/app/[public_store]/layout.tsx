import { Metadata } from 'next'
import { getStores } from './actions'
import NotFound from './not-found'

export const metadata: Metadata = {
  title: 'Ching Ling | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default async function PublicStoreLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { public_store: string }
}>) {
  const storeSlug = params.public_store.split('-')
  const storeName = storeSlug.join(' ')

  const { stores, storesError } = await getStores(storeName)

  if (storesError) {
    console.log(storesError)
  }

  if (stores && stores.length === 0) {
    return <NotFound />
  }
  return <div>{children}</div>
}
