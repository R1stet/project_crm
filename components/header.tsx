"use client"

import { Search, Plus, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"

interface HeaderProps {
  currentUser: string
  onLogout: () => void
  onAddCustomer: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  searching?: boolean
}

export function Header({ currentUser, onLogout, onAddCustomer, searchQuery, onSearchChange, searching = false }: HeaderProps) {
  // Extract email from currentUser string (assumes format: "firstname lastname email")
  const extractEmail = (userString: string): string => {
    const emailRegex = /\S+@\S+\.\S+/
    const match = userString.match(emailRegex)
    return match ? match[0] : userString
  }
  
  const userEmail = extractEmail(currentUser)
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Logo className="h-8" />
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              {searching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              )}
              <Input
                type="text"
                placeholder="Søg kunder, kjoler, producenter..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile search button */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2">
                    <div className="relative">
                      {searching ? (
                        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      )}
                      <Input
                        type="text"
                        placeholder="Søg kunder, kjoler, producenter..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button onClick={onAddCustomer} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Tilføj Kunde
            </Button>

            {/* Mobile add button */}
            <Button onClick={onAddCustomer} size="sm" className="sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 hidden sm:inline">{userEmail}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Ud
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}