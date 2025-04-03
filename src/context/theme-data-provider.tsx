'use client'

import { readStore } from '@/app/[public_store]/actions'
import { readStoreTheme } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import setGlobalColorTheme from '@/lib/theme-colors'
import { StoreType } from '@/models/store'
import { useTheme } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams,
)

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const [store, setStore] = useState<StoreType | undefined>()
  const [themeColor, setThemeColor] = useState<ThemeColors>('Zinc')
  const [themeMode, setThemeMode] = useState<ThemeModes>('light')
  const [isMounted, setIsMounted] = useState(false)
  const { setTheme } = useTheme()

  const { execute, data } = useServerAction(readStore, {
    onSuccess: () => {
      setStore(data?.store)
    },
  })

  const storeSubdomain = store?.store_subdomain

  const getSavedTheme = async () => {
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
  }

  useEffect(() => {
    const loadTheme = async () => {
      const { color, mode } = await getSavedTheme()
      setThemeColor(color)
      setThemeMode(mode)
      setTheme(mode) // Define o tema inicial com next-themes
    }

    loadTheme()
  }, [storeSubdomain, setTheme])

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
  }, [themeColor, themeMode]) // eslint-disable-line

  useEffect(() => {
    execute()
  }, [])

  if (!isMounted) {
    return null
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
