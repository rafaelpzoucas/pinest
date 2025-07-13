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
  console.time('generateMetadata')
  const sub = params.public_store

  console.time('getStoreEdgeConfig')
  const store = (await get(`store_${sub}`)) as any
  console.timeEnd('getStoreEdgeConfig')

  if (!store) {
    console.timeEnd('generateMetadata')
    return { title: 'Pinest' }
  }

  console.time('formatTitle')
  const formattedTitle = store.name
    .toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase())
  console.timeEnd('formatTitle')

  console.timeEnd('generateMetadata')
  return {
    title: formattedTitle,
    description: store.description,
    icons: { icon: store.logo_url },
  }
}

export default async function PublicStoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  console.time('PublicStoreLayout')
  const sub = params.public_store

  console.time('getStoreEdgeConfig')
  const store = (await get(`store_${sub}`)) as any
  console.timeEnd('getStoreEdgeConfig')

  if (!store) {
    console.timeEnd('PublicStoreLayout')
    return <NotFound />
  }

  console.timeEnd('PublicStoreLayout')
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
