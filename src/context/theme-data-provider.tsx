'use client'

import setGlobalColorTheme from '@/lib/theme-colors'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams,
)

interface ThemeDataProviderProps {
  children: React.ReactNode
  initialThemeMode: ThemeModes
  initialThemeColor: ThemeColors
}

export default function ThemeDataProvider({
  children,
  initialThemeMode,
  initialThemeColor,
}: ThemeDataProviderProps) {
  const [themeColor, setThemeColor] = useState<ThemeColors>(
    initialThemeColor || 'Zinc',
  )
  const [themeMode, setThemeMode] = useState<ThemeModes>(
    initialThemeMode || 'light',
  )

  // Função para capitalizar a primeira letra
  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  // Normaliza os valores antes de aplicar
  const normalizedThemeColor = capitalize(themeColor)
  const normalizedThemeMode = themeMode.toLowerCase() as ThemeModes

  useEffect(() => {
    setGlobalColorTheme(
      normalizedThemeMode,
      normalizedThemeColor as ThemeColors,
    )
  }, [normalizedThemeMode, normalizedThemeColor])

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
