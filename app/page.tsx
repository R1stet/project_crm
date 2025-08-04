"use client"

import { useState, useEffect, useRef } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { supabase } from "@/lib/supabase"
import { loginRateLimiter } from "@/lib/rate-limiter"
import { sanitizeError, logSecurityEvent } from "@/lib/error-handler"
import { SessionManager } from "@/lib/session-manager"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const sessionManagerRef = useRef<SessionManager | null>(null)

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
        
        // Initialize session manager
        if (!sessionManagerRef.current) {
          sessionManagerRef.current = new SessionManager(
            () => setShowSessionWarning(true),
            () => {
              setIsAuthenticated(false)
              setCurrentUser("")
              setShowSessionWarning(false)
            }
          )
        }
      } else {
        setIsAuthenticated(false)
        setCurrentUser("")
        setShowSessionWarning(false)
        
        // Cleanup session manager
        if (sessionManagerRef.current) {
          sessionManagerRef.current.destroy()
          sessionManagerRef.current = null
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      if (sessionManagerRef.current) {
        sessionManagerRef.current.destroy()
      }
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true)
    setError(null)

    const rateLimitCheck = loginRateLimiter.check(email)
    if (!rateLimitCheck.allowed) {
      const resetTime = new Date(rateLimitCheck.resetTime)
      setError(`Too many login attempts. Try again after ${resetTime.toLocaleTimeString()}`)
      setLoginLoading(false)
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { email, ip: 'client' })
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        setCurrentUser(data.user.email || data.user.id)
        setIsAuthenticated(true)
        loginRateLimiter.reset(email)
      }
    } catch (error) {
      const userMessage = sanitizeError(error)
      setError(userMessage)
      logSecurityEvent('LOGIN_FAILED', { email, error: userMessage })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.destroy()
      sessionManagerRef.current = null
    }
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setCurrentUser("")
    setShowSessionWarning(false)
  }

  const extendSession = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.extendSession()
      setShowSessionWarning(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div>
        {error && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md">
            {error}
          </div>
        )}
        <LoginForm onLogin={handleLogin} isLoading={loginLoading} />
      </div>
    )
  }

  return (
    <div>
      {showSessionWarning && (
        <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md shadow-lg z-50">
          <p className="font-medium">Session expiring soon</p>
          <p className="text-sm">Your session will expire in 5 minutes.</p>
          <button
            onClick={extendSession}
            className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            Extend Session
          </button>
        </div>
      )}
      <Dashboard currentUser={currentUser} onLogout={handleLogout} />
    </div>
  )
}