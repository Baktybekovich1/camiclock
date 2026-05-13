import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Locale = 'en' | 'ru'
export type Theme = 'light' | 'dark'

type SettingsContextValue = {
  locale: Locale
  setLocale: (value: Locale) => void
  theme: Theme
  toggleTheme: () => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('bloomb_locale')
    return saved === 'ru' ? 'ru' : 'en'
  })

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('bloomb_theme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    localStorage.setItem('bloomb_locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    localStorage.setItem('bloomb_theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [locale, theme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
