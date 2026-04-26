import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = async () => {
    try {
      const me = await camiclockApi.me()
      setUser(me)
    } catch {
      localStorage.removeItem('camiclock_token')
      setUser(null)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('camiclock_token')
    if (!token) {
      setLoading(false)
      return
    }

    refreshMe().finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await camiclockApi.login({ email, password })
    localStorage.setItem('camiclock_token', response.token)
    await refreshMe()
  }

  const logout = () => {
    localStorage.removeItem('camiclock_token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
