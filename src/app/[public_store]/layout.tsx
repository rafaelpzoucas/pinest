import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
import { Metadata, ResolvingMetadata } from 'next'
import { readStore } from './actions'
import { readCart } from './cart/actions'
import { MobileNavigation } from './mobile-navigation'
import NotFound from './not-found'

type PublicStoreLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [response] = await readStore()
  const store = response?.store

  if (!store) {
    console.error('Não foi possível buscar a loja.')

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
}: PublicStoreLayoutProps) {
  const [response] = await readStore()

  const store = response?.store

  if (!store) {
    return <NotFound />
  }

  const [cartData] = await readCart()
  const cart = cartData?.cart

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
