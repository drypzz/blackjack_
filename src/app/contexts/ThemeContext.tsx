'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
   theme: Theme
   setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
   const context = useContext(ThemeContext)
   if (!context) {
      throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
   }
   return context
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
   const [theme, setTheme] = useState<Theme>('light')

   useEffect(() => {
      const root = window.document.documentElement
      const initialTheme = root.classList.contains('dark') ? 'dark' : 'light'
      setTheme(initialTheme)
   }, [])

   const handleSetTheme = (newTheme: Theme) => {
      const root = window.document.documentElement
      localStorage.setItem('casino_theme', newTheme)
      root.classList.toggle('dark', newTheme === 'dark')
      setTheme(newTheme)
   }

   const value = {
      theme,
      setTheme: handleSetTheme,
   }

   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}