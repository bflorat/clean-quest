import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser, getToken, login as pbLogin, refreshAuth, clearAuth } from '../services/pb.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const has = !!getToken()
        if (has) {
          await refreshAuth()
          if (!mounted) return
          setUser(getUser())
        }
      } catch {
        // ignore; user remains null
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const login = async (identity, password) => {
    setError('')
    const res = await pbLogin(identity, password)
    setUser(getUser())
    return res
  }

  const logout = async () => {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
