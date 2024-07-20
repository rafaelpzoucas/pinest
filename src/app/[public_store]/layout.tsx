import { Metadata } from 'next'
import { getStoreByStoreURL } from './actions'
import Header from './header'
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

  return (
    <div className="flex lg:flex-row items-center justify-center p-4 pb-20">
      <div className="w-full lg:max-w-7xl">
        <Header params={params} />

        {children}
      </div>
    </div>
  )
}
