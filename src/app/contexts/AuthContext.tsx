"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { LocalStorage, Profile } from '@/app/lib/storage'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = (userId: string) => {
    return LocalStorage.getProfile(userId)
  }

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    const currentUser = LocalStorage.getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const profileData = fetchProfile(currentUser.id)
      setProfile(profileData)
    }

    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    const { user: newUser } = await LocalStorage.signUp(email, password, username)
    setUser(newUser)
    const profileData = fetchProfile(newUser.id)
    setProfile(profileData)
  }

  const signIn = async (email: string, password: string) => {
    const { user: existingUser } = await LocalStorage.signIn(email, password)
    setUser(existingUser)
    const profileData = fetchProfile(existingUser.id)
    setProfile(profileData)
  }

  const signOut = async () => {
    await LocalStorage.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
