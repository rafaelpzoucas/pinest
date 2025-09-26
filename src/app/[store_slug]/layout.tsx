import { ThemeProvider } from '@/components/theme-provider'
import ThemeDataProvider from '@/context/theme-data-provider'
import { get } from '@vercel/edge-config'
import { BottomActionBar } from './(bottom-actions-bar)/bottom-bar'
import { HeaderNavigation } from './(navigation)/nav'

type PublicStoreLayoutProps = {
  children: React.ReactNode
  params: { store_slug: string }
}

export default async function StoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  const store = (await get(`store_${params.store_slug}`)) as any

  console.log('Store data:', store, params)

  const theme = store?.theme || { mode: 'system', color: 'Zinc' }

  const themeMode = theme?.mode
  const themeColor = theme?.color

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
        <div
          className="flex lg:flex-row items-center justify-center pb-20 bg-background scroll-smooth
            select-none"
        >
          <div className="w-full lg:max-w-7xl">
            <HeaderNavigation />

            {children}

            <BottomActionBar />
          </div>
        </div>
      </ThemeDataProvider>
    </ThemeProvider>
  )
}
