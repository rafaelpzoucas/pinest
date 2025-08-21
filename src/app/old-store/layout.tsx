import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
import { extractSubdomainOrDomain } from '@/lib/helpers'
import { get } from '@vercel/edge-config'
import { Metadata } from 'next'
import React from 'react'
import { readPublicStoreData } from './(app)/actions'
import { CartInitializer } from './cart/cart-initializer'
import { StoreHydrator } from './hydrator'
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
  const sub =
    params.public_store !== 'undefined'
      ? params.public_store
      : (extractSubdomainOrDomain() as string)

  const store = (await get(`store_${sub}`)) as any

  if (!store) {
    return { title: 'Pinest' }
  }

  console.log({ store })

  const formattedTitle = store?.name
    ?.toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

  return {
    title: formattedTitle,
    description: store?.description,
    icons: { icon: store.logo_url },
  }
}

export default async function PublicStoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  const [publicStoreData] = await readPublicStoreData()

  const subdomain =
    params.public_store !== 'undefined'
      ? params.public_store
      : (extractSubdomainOrDomain() as string)

  const store = (await get(`store_${subdomain}`)) as any

  if (!store) {
    return <NotFound />
  }

  // Busca o tema da loja diretamente do Edge Config
  const themeMode = store.theme?.mode || 'system'
  const themeColor = store.theme?.color || 'Zinc'

  return (
    <ThemeProvider
      storageKey="storeThemeMode"
      attribute="class"
      defaultTheme={themeMode}
      forcedTheme={themeMode}
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeDataProvider
        initialThemeMode={themeMode}
        initialThemeColor={themeColor}
      >
        <div className="flex lg:flex-row items-center justify-center p-4 pb-20 bg-background">
          <div className="w-full lg:max-w-7xl">
            {children}

            <CartInitializer />
            <MobileNavigation storeSubdomain={subdomain} />
            <StoreHydrator publicStoreData={publicStoreData} />
          </div>
        </div>
      </ThemeDataProvider>
    </ThemeProvider>
  )
}
