"use client"

import { Search, Plus, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  currentUser: string
  onLogout: () => void
  onAddCustomer: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ currentUser, onLogout, onAddCustomer, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Wedding Dress CRM</h1>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search customers, dresses, makers..."
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
                    <Input
                      type="text"
                      placeholder="Search customers, dresses, makers..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button onClick={onAddCustomer} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>

            {/* Mobile add button */}
            <Button onClick={onAddCustomer} size="sm" className="sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 hidden sm:inline">{currentUser}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}