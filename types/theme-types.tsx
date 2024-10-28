type ThemeColors =
  | 'Orange'
  | 'Red'
  | 'Violet'
  | 'Yellow'
  | 'Zinc'
  | 'Rose'
  | 'Blue'
  | 'Green'
type ThemeModes = 'light' | 'dark'

interface ThemeColorStateParams {
  themeColor: ThemeColors
  themeMode: ThemeModes
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeModes>>
}
