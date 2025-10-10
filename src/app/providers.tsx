'use client'

import { AuthProvider } from '@/app/contexts/AuthContext'
import { ThemeProvider } from '@/app/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}