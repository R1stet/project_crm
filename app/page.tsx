"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        setCurrentUser(user.email || user.id)
      }
      setLoading(false)
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setCurrentUser(session.user.email || session.user.id)
      } else {
        setIsAuthenticated(false)
        setCurrentUser("")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) {
      console.error('Authentication error:', error)
      alert(`Login failed: ${error.message}`)
      return
    }
    
    if (data.user) {
      setCurrentUser(data.user.email || data.user.id)
      setIsAuthenticated(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setCurrentUser("")
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />
}