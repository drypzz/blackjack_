'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

import { useTheme } from '@/app/contexts/ThemeContext'

export const ThemeToggleButton = () => {
   const { theme, setTheme } = useTheme()

   const [isClient, setIsClient] = useState(false)
   useEffect(() => {
      setIsClient(true)
   }, [])

   if (!isClient) {
      return <div className="w-[44px] h-[44px]"></div>
   }

   const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light')
   }

   return (
      <button
         onClick={toggleTheme}
         className="p-2 sm:p-3 bg-slate-800/80 rounded-xl border border-slate-700 hover:bg-slate-700/80 transition-colors cursor-pointer"
         title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      >
         {theme === 'light' ? (
         <Moon size={20} className="text-slate-300" />
         ) : (
         <Sun size={20} className="text-amber-400" />
         )}
      </button>
   )
}