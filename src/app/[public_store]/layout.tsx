import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
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
  children: React.ReactNode
  params: { public_store: string }
}

export default async function PublicStoreLayout({
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

  const { cart } = await getCart(params.public_store)

  return (
    <ThemeProvider
      storageKey="storeThemeMode"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeDataProvider>
        <div className="flex lg:flex-row items-center justify-center p-4 pb-20">
          <div className="w-full lg:max-w-7xl">
            {children}

            <MobileNavigation cartProducts={cart} />
          </div>
        </div>
      </ThemeDataProvider>
    </ThemeProvider>
  )
}
