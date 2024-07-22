import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default async function PublicStoreLayout({
  header,
  children,
  params,
}: Readonly<{
  header: React.ReactNode
  children: React.ReactNode
  params: { public_store: string }
}>) {
  // const { store, storeError } = await getStoreByStoreURL(params.public_store)

  // if (storeError) {
  //   console.log(storeError)
  // }

  // if (!store) {
  //   return <NotFound />
  // }

  // const bagItems: CartProductType[] = await getCart(params.public_store)

  return (
    <div className="flex lg:flex-row items-center justify-center p-4 pb-20">
      <div className="w-full lg:max-w-7xl">
        {header}

        {children}

        {/* <MobileNavigation bagItems={bagItems} /> */}
      </div>
    </div>
  )
}
