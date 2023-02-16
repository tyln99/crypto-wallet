import React, { createContext, useState } from 'react'
import { lock, unlock } from '@store/actions'

export const AuthContext = createContext()

function AuthProvider({ children, isUnlocked }) {
  const [unlocked, setUnlocked] = useState(isUnlocked)

  const login = async (password, callback) => {
    try {
      const success = await unlock(password)
      setUnlocked(success)
      return callback(success)
    } catch (error) {
      throw error
    }
  }

  const logout = async (callback) => {
    try {
      const success = await lock()
      setUnlocked(success)
      return callback(success)
    } catch (error) {
      throw error
    }
  }

  return <AuthContext.Provider value={{ login, logout, unlocked }}>{children}</AuthContext.Provider>
}

export default AuthProvider
