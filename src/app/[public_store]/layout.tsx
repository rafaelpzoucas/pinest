import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
import { get } from '@vercel/edge-config'
import { Metadata } from 'next'
import { CartInitializer } from './cart/cart-initializer'
import { MobileNavigation } from './mobile-navigation'
import NotFound from './not-found'

type PublicStoreLayoutProps = {
  children: React.ReactNode
  params: { public_store: string }
}

export async function generateMetadata({
  params,
}: {
  params: { public_store: string }
}): Promise<Metadata> {
  const sub = params.public_store

  const store = (await get(`store_${sub}`)) as any

  if (!store) {
    return { title: 'Pinest' }
  }

  return {
    title: store.name
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    description: store.description,
    icons: { icon: store.logo_url },
  }
}

export default async function PublicStoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  const sub = params.public_store

  const store = (await get(`store_${sub}`)) as any

  if (!store) {
    return <NotFound />
  }

  return (
    <ThemeProvider
      storageKey="storeThemeMode"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeDataProvider>
        <div className="flex lg:flex-row items-center justify-center p-4 pb-20 bg-background">
          <div className="w-full lg:max-w-7xl">
            {children}

            <CartInitializer />
            <MobileNavigation storeSubdomain={store.store_subdomain} />
          </div>
        </div>
      </ThemeDataProvider>
    </ThemeProvider>
  )
}
