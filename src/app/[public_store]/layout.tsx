import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
import { Metadata, ResolvingMetadata } from 'next'
import { getStoreByStoreURL } from './actions'
import { getCart } from './cart/actions'
import { MobileNavigation } from './mobile-navigation'
import NotFound from './not-found'

type PublicStoreLayoutProps = {
  children: React.ReactNode
  params: { public_store: string }
}

export async function generateMetadata(
  { params }: PublicStoreLayoutProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const storeURL = params.public_store

  const { store, storeError } = await getStoreByStoreURL(storeURL)

  if (storeError) {
    console.error({ storeError })

    return {
      title: 'Pinest',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  if (store) {
    return {
      title: store.name
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: store.description,
      icons: {
        icon: store.logo_url,
      },
      openGraph: {
        images: [store.logo_url, ...previousImages],
      },
    }
  }

  return {
    title: 'Pinest',
  }
}

export default async function PublicStoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  if (storeError) {
    console.error(storeError)
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
