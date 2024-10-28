'use client'

import { readStoreTheme } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import setGlobalColorTheme from '@/lib/theme-colors'
import { useTheme } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { useParams } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams,
)

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const params = useParams()
  const storeURL = params.public_store as string

  const [themeColor, setThemeColor] = useState<ThemeColors>('Zinc')
  const [themeMode, setThemeMode] = useState<ThemeModes>('light')
  const [isMounted, setIsMounted] = useState(false)
  const { setTheme } = useTheme()

  const getSavedTheme = async () => {
    try {
      if (!storeURL) {
        return { color: 'Zinc' as ThemeColors, mode: 'system' as ThemeModes }
      }

      const { themeColor: color, themeMode: mode } =
        await readStoreTheme(storeURL)

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
  }, [storeURL, setTheme])

  useEffect(() => {
    if (!storeURL) {
      return
    }

    localStorage.setItem('storeThemeColor', themeColor)
    localStorage.setItem('storeThemeMode', themeMode)

    setGlobalColorTheme(themeMode, themeColor)

    if (!isMounted) {
      setIsMounted(true)
    }
  }, [themeColor, themeMode]) // eslint-disable-line

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
