'use client'

import { readStore } from '@/app/[public_store]/actions'
import { readStoreTheme } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import setGlobalColorTheme from '@/lib/theme-colors'
import { StoreType } from '@/models/store'
import { useTheme } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import Image from 'next/image'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useServerAction } from 'zsa-react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams,
)

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const [store, setStore] = useState<StoreType | undefined>()
  const [themeColor, setThemeColor] = useState<ThemeColors>('Zinc')
  const [themeMode, setThemeMode] = useState<ThemeModes>('light')
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { setTheme } = useTheme()

  const { execute, data } = useServerAction(readStore, {
    onSuccess: () => {
      setStore(data?.store)
    },
  })

  const storeSubdomain = store?.store_subdomain

  const getSavedTheme = useCallback(async () => {
    try {
      if (!storeSubdomain) {
        return { color: 'Zinc' as ThemeColors, mode: 'system' as ThemeModes }
      }

      const { themeColor: color, themeMode: mode } =
        await readStoreTheme(storeSubdomain)

      return {
        color: (color as ThemeColors) || 'Zinc',
        mode: (mode as ThemeModes) || 'light',
      }
    } catch (err) {
      return { color: 'Zinc' as ThemeColors, mode: 'dark' as ThemeModes }
    }
  }, [storeSubdomain])

  useEffect(() => {
    const loadTheme = async () => {
      const { color, mode } = await getSavedTheme()
      setThemeColor(color)
      setThemeMode(mode)
      setTheme(mode) // Define o tema inicial com next-themes
    }

    if (storeSubdomain) {
      loadTheme()
    }
  }, [getSavedTheme, setTheme])

  useEffect(() => {
    if (!storeSubdomain) {
      return
    }

    localStorage.setItem('storeThemeColor', themeColor)
    localStorage.setItem('storeThemeMode', themeMode)

    setGlobalColorTheme(themeMode, themeColor)

    if (!isMounted) {
      setIsMounted(true)
    }

    setIsLoading(false)
  }, [themeColor, themeMode, storeSubdomain, isMounted])

  useEffect(() => {
    execute()
  }, [execute])

  // Mostra loading apenas se ainda estiver carregando e não estiver montado
  if (isLoading || !isMounted) {
    return (
      <div className="w-full h-dvh flex flex-col items-center justify-center bg-background">
        <div className="relative w-16 h-16 animate-bounce">
          <Image
            src="/icon-dark.svg"
            fill
            alt="Carregando..."
            className="object-fill"
          />
        </div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider
      value={{ themeColor, setThemeColor, themeMode, setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
