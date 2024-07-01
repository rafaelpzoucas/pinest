import { Metadata } from 'next'
import { getStoreByStoreURL } from './actions'
import NotFound from './not-found'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default async function PublicStoreLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { public_store: string }
}>) {
  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  if (storeError) {
    console.log(storeError)
  }

  if (!store) {
    return <NotFound />
  }

  return <div>{children}</div>
}
