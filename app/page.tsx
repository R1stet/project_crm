"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("crm_user")
    if (user) {
      setIsAuthenticated(true)
      setCurrentUser(user)
    }
  }, [])

  const handleLogin = (username: string) => {
    localStorage.setItem("crm_user", username)
    setIsAuthenticated(true)
    setCurrentUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem("crm_user")
    setIsAuthenticated(false)
    setCurrentUser("")
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />
}